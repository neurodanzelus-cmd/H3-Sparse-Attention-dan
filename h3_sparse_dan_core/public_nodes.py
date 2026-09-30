'''Register the single public H3 Sparse Attention (dan) node.'''

from comfy_api.latest import ComfyExtension

# Keep the sparse engine's backend selection policies active.
from . import apply_policy as _apply_policy  # noqa: F401
# Experimental AMD policy is layered after the ordinary policy for AMD-specific
# backend eligibility and the tested RDNA2 path.
from . import amd_policy as _amd_policy  # noqa: F401
# The final layer is architecture-neutral: if Auto exhausted every specialized
# sparse backend, try routing through the already-working dense consumer before
# accepting fully dense attention.
from . import universal_sparse_fallback as _universal_sparse_fallback  # noqa: F401
from .nodes import H3SparseAttentionAdvanced


class H3SparseAttentionDanExtension(ComfyExtension):
    '''Register the single H3 Sparse Attention (dan) node.'''

    async def get_node_list(self):
        return [H3SparseAttentionAdvanced]
