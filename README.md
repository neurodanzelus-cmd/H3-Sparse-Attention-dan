# H3 Sparse Attention (dan)

<img src="assets/attention-curve-editor.png" alt="Attention curve editor" width="800">

One ComfyUI model patch node for MiniMax H3, updated to the current **H3 Sparse Attention (Advanced)** behavior from Zironic/H3-Optimizations. Click **Edit attention curve** to open a graph editor and shape the video attention budget across sampler progress. The background columns use the step count read from the connected sampler or Scheduler. After changing Scheduler steps, click the refresh icon to update the count immediately without running generation. If the editor cannot find a connected sampler, it draws no columns and shows a translucent message in the graph asking you to retry with the refresh button. The attention curve and node operation remain unchanged. **Step values** shows column numbers and budgets, with fewer labels at high step counts and the exact hovered value on demand. **Show curve** hides or shows the curve and its control points; hiding them leaves the sampled columns and their values unchanged. Click in the graph to add curve points, drag to adjust them, and use Delete or Remove point to remove a selected middle point. Choose a saved curve profile or save your own; profiles are stored with the workflow. The start and end points stay anchored to the first and last sampler steps. The default curve matches the current eight-step Ramp schedule on a 20-step sampler: it starts at 68.33%, ramps toward 15%, then holds 15%. Audio, text, reference context, non-video queries, and mixed boundary tiles stay dense automatically; there is no Protect audio switch.

## Install

Copy this `H3-Sparse-Attention-dan` folder into `ComfyUI/custom_nodes` and restart ComfyUI. It registers only **H3 Sparse Attention (dan)**. ComfyUI 0.33.0 or newer with MiniMax H3 support is required. Explicit backends still require compatible GPU and runtime support; a selected unavailable backend raises an error, as in Advanced.

The packaged native backends cover Windows x64. No other nodes from either upstream repository are registered or required.

## Source

Advanced-related updates were synchronized against Zironic/H3-Optimizations **0.2.46**, commit [`c6bc3cf`](https://github.com/Zironic/H3-Optimizations/commit/c6bc3cfc58c18c3a6220aeea09116e1eebd91669), checked 2026-10-25:

- Added **Kitchen INT8 64Q x 32KV (Quality)** as the default for new nodes, matching Advanced. The existing 64KV and 128KV choices remain available, and saved workflows keep their selected backend.
- Kitchen uses native threshold routing when available, targeting the curve's budget with variable tile counts per query row. It falls back to the existing top-k router when the native threshold router is unavailable. Audio, text, reference context, and mixed boundary tiles stay dense.
- Updated the Windows native library to `native-v19` / `h3_int8_attention_v9.dll` (ABI 4), including the finer 32KV route, packed sparse traversal, and device geometry self-checks.
- Synced shared engine compatibility fixes, including stock-original capture when rebuilding a loaded model's patches, to prevent nested wrappers and repeated-run cube-order failures.
- Retained recognized KJNodes SageAttention override replacement, ComfyUI per-block attention preferences, and native Sparse Sage SA2++ support on SM89. SpargeAttention's compiled package is still required for the Sparse Sage backend.

The backend dropdown now has seven choices. The curve editor, profiles, step columns, step detection and refresh, curve visibility, saved curve data, and workflow-loading fix are preserved. The frontend JavaScript is unchanged by this update.

The sparse route keeps audio, text, reference context, and mixed boundary tiles dense by default. This node retains a hidden legacy workflow field for old graphs, but always enables that protection and no longer shows a toggle. VSA-trained H3 checkpoints pass through unchanged so their trained sparse route remains intact. The curve editor and workflow-saved profiles are this package's additions. Separate upstream nodes such as VSA Attention, Memory Optimization, and AIMDO Residency Limiter are not registered by this package.

The ComfyUI entry point and Python namespace were changed so this package exposes one node and can coexist with the original H3-Optimizations package.
