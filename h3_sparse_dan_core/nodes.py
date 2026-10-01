'''Composable production nodes for MiniMax H3 optimization.'''

import json
import logging
import math

from comfy_api.latest import io, ui
from comfy.ldm.minimax.model import MiniMaxH3Model

from .apply import apply_plan
from .node_constants import NODE_CATEGORY
from .plan import (
    DEFAULT_VIDEO_BUDGET,
    DEFAULT_VIDEO_TOKEN_ORDER,
    SPARSE_BACKEND_COMPAT_REQUESTS,
    SPARSE_BACKEND_KITCHEN,
    SPARSE_BACKEND_PUBLIC_REQUESTS,
    SparseRequest,
    VIDEO_TOKEN_ORDER_REQUESTS,
    read_plan,
)
from .status import format_sparse_status

DEFAULT_CURVE_POINTS = (
    (0.0, 41.0 / 60.0),
    (8.0 / 19.0, DEFAULT_VIDEO_BUDGET),
    (1.0, DEFAULT_VIDEO_BUDGET),
)
DEFAULT_CURVE_DATA = json.dumps(DEFAULT_CURVE_POINTS, separators=(',', ':'))
DEFAULT_CURVE_PROFILES = {'Default': DEFAULT_CURVE_POINTS}
DEFAULT_CURVE_PROFILES_DATA = json.dumps(
    DEFAULT_CURVE_PROFILES,
    separators=(',', ':'),
)

VSA_PASSTHROUGH_MESSAGE = (
    'VSA-trained H3 checkpoint detected. H3 Sparse Attention (dan) passed the '
    'model through unchanged to preserve its trained sparse pattern.'
)


def _vsa_passthrough(model):
    """Do not apply the standard H3 sparse route to VSA-trained checkpoints."""
    try:
        diffusion_model = model.get_model_object('diffusion_model')
    except Exception:
        return None
    if not isinstance(diffusion_model, MiniMaxH3Model) or not diffusion_model.blocks:
        return None
    first_attention = getattr(diffusion_model.blocks[0], 'attn', None)
    if getattr(first_attention, 'to_gate_compress', None) is None:
        return None
    logging.warning('[H3 Sparse Attention (dan)] %s', VSA_PASSTHROUGH_MESSAGE)
    return io.NodeOutput(model, ui=ui.PreviewText(VSA_PASSTHROUGH_MESSAGE))


def _parse_curve_points(points):
    if not isinstance(points, list) or len(points) < 2 or len(points) > 64:
        raise ValueError('attention curve must contain between 2 and 64 points')

    parsed = []
    for index, point in enumerate(points):
        if not isinstance(point, list) or len(point) != 2:
            raise ValueError(
                'attention curve point %d must be [progress, budget]' % index
            )
        if any(isinstance(value, bool) for value in point):
            raise ValueError('attention curve point %d must contain numbers' % index)
        try:
            position, budget = (float(value) for value in point)
        except (TypeError, ValueError):
            raise ValueError('attention curve point %d must contain numbers' % index)
        if not math.isfinite(position) or not 0.0 <= position <= 1.0:
            raise ValueError('attention curve progress must be between 0 and 1')
        if not math.isfinite(budget) or not 0.01 <= budget <= 1.0:
            raise ValueError('attention curve budget must be between 0.01 and 1')
        parsed.append((position, budget))

    if parsed[0][0] != 0.0 or parsed[-1][0] != 1.0:
        raise ValueError('attention curve must include both start and end points')
    if any(left[0] >= right[0] for left, right in zip(parsed, parsed[1:])):
        raise ValueError('attention curve points must be ordered from left to right')
    return tuple(parsed)


def _parse_curve_data(curve_data):
    try:
        points = json.loads(curve_data)
    except (TypeError, json.JSONDecodeError) as error:
        raise ValueError('attention curve data is not valid JSON') from error
    return _parse_curve_points(points)


def _parse_curve_profiles(profiles_data):
    try:
        profiles = json.loads(profiles_data)
    except (TypeError, json.JSONDecodeError) as error:
        raise ValueError('saved curve profiles are not valid JSON') from error
    if not isinstance(profiles, dict) or len(profiles) > 20:
        raise ValueError('saved curve profiles must be an object with at most 20 entries')
    for name, points in profiles.items():
        if not isinstance(name, str) or not name.strip() or len(name) > 40:
            raise ValueError('saved profile names must contain 1 to 40 characters')
        _parse_curve_points(points)
    return profiles


class H3SparseAttentionAdvanced(io.ComfyNode):
    '''Zironic-compatible sparse attention with a custom video-budget curve.'''

    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id='H3SparseAttentionDan',
            display_name='H3 Sparse Attention (dan)',
            category=NODE_CATEGORY,
            description=(
                'Curve-controlled sparse attention for MiniMax H3. Open the curve '
                'editor to set the target-video attention budget across sampler '
                'progress. Audio, text, and mixed boundary tiles remain dense. The '
                'default curve matches the current Advanced eight-step ramp on a '
                '20-step sampler. VSA-trained H3 checkpoints pass through unchanged. '
                'Choose an explicit sparse backend and video token order below.'
            ),
            search_aliases=[
                'H3 sparse curve',
                'H3 sparse attention curve',
                'H3 sparse backend',
            ],
            inputs=[
                io.Model.Input('model'),
                io.Boolean.Input(
                    'protect_audio',
                    display_name='Protect audio (legacy)',
                    default=True,
                    tooltip=(
                        'Legacy workflow field. Audio protection is always enabled, '
                        'matching the current H3-Optimizations sparse route.'
                    ),
                ),
                io.String.Input(
                    'curve_data',
                    display_name='Attention curve data',
                    default=DEFAULT_CURVE_DATA,
                    tooltip=(
                        'Saved automatically by the curve editor. Progress values '
                        'range from 0 to 1 and attention budgets from 0.01 to 1.'
                    ),
                ),
                io.String.Input(
                    'curve_profiles',
                    display_name='Saved curve profiles',
                    default=DEFAULT_CURVE_PROFILES_DATA,
                    tooltip='Curve editor profiles saved with this workflow.',
                ),
                io.Combo.Input(
                    'backend',
                    display_name='Sparse backend',
                    options=list(SPARSE_BACKEND_PUBLIC_REQUESTS),
                    default=SPARSE_BACKEND_KITCHEN,
                    tooltip=(
                        'Kitchen INT8 64Q x 64KV (Quality) is the default. '
                        'Kitchen INT8 64Q x 128KV (Faster) was faster in the '
                        'measured full-block SM89 comparison, but its coarser '
                        'KV selections can change output quality and the speed '
                        'gain is not guaranteed on every GPU. '
                        'FROST BF16, BF16 Triton, and FP8 FlexAttention use '
                        '64Q x 64KV routing. Sparse Sage uses 128Q x 64KV on '
                        'SM80/86/87/89/120 and 64Q x 128KV on SM90. '
                        'Explicit backend choices fail if that backend is '
                        'unavailable and do not switch to another backend.'
                    ),
                ),
                io.Combo.Input(
                    'video_token_order',
                    display_name='Video token order',
                    options=list(VIDEO_TOKEN_ORDER_REQUESTS),
                    default=DEFAULT_VIDEO_TOKEN_ORDER,
                    tooltip=(
                        '1x8x8 is the measured default and groups each 64-token router '
                        'tile as temporal x height x width. 1x16x4 and 4x4x4 are '
                        'experimental comparison geometries. Raster restores stock '
                        'H3 target-video ordering.'
                    ),
                ),
            ],
            outputs=[io.Model.Output()],
        )

    @classmethod
    def execute(
        cls,
        model,
        protect_audio=True,
        curve_data=DEFAULT_CURVE_DATA,
        curve_profiles=DEFAULT_CURVE_PROFILES_DATA,
        backend=SPARSE_BACKEND_KITCHEN,
        video_token_order=DEFAULT_VIDEO_TOKEN_ORDER,
    ):
        passthrough = _vsa_passthrough(model)
        if passthrough is not None:
            return passthrough
        _parse_curve_profiles(curve_profiles)
        plan = read_plan(model).with_sparse(
            SparseRequest(
                video_budget=DEFAULT_VIDEO_BUDGET,
                protect_audio=True,
                backend=backend,
                curve_points=_parse_curve_data(curve_data),
                video_token_order=video_token_order,
            )
        )
        patched = apply_plan(model, plan)
        return io.NodeOutput(
            patched,
            ui=ui.PreviewText(format_sparse_status(patched)),
        )

    @classmethod
    def validate_inputs(
        cls,
        backend,
        curve_data=DEFAULT_CURVE_DATA,
        curve_profiles=DEFAULT_CURVE_PROFILES_DATA,
        video_token_order=DEFAULT_VIDEO_TOKEN_ORDER,
        protect_audio=True,
    ):
        if backend is not None and backend not in SPARSE_BACKEND_COMPAT_REQUESTS:
            return 'unknown sparse backend %r' % backend
        if (
            video_token_order is not None
            and video_token_order not in VIDEO_TOKEN_ORDER_REQUESTS
        ):
            return 'unknown video token order %r' % video_token_order
        try:
            _parse_curve_data(curve_data)
            _parse_curve_profiles(curve_profiles)
        except ValueError as error:
            return str(error)
        return True
