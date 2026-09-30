"""Single-node ComfyUI entry point for H3 Sparse Attention (dan)."""

from importlib import util as importlib_util
from pathlib import Path
import sys


def _load_core():
    package_name = "h3_sparse_dan_core"
    existing = sys.modules.get(package_name)
    if existing is not None:
        return existing

    package_dir = Path(__file__).resolve().parent / package_name
    spec = importlib_util.spec_from_file_location(
        package_name,
        package_dir / "__init__.py",
        submodule_search_locations=[str(package_dir)],
    )
    if spec is None or spec.loader is None:
        raise ImportError("could not load H3 Sparse Attention (dan) core")
    module = importlib_util.module_from_spec(spec)
    sys.modules[package_name] = module
    try:
        spec.loader.exec_module(module)
    except Exception:
        sys.modules.pop(package_name, None)
        raise
    return module


_load_core()

WEB_DIRECTORY = "./web"

from h3_sparse_dan_core.public_nodes import H3SparseAttentionDanExtension


async def comfy_entrypoint() -> H3SparseAttentionDanExtension:
    return H3SparseAttentionDanExtension()
