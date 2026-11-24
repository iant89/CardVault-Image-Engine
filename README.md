# CardVault Image Engine

A TypeScript-first, backend-independent image preparation library for collectible-card computer vision. The core package intentionally contains no OCR, ML, pricing, application, or database integrations.

## Current foundation

- Workspace-based monorepo with `@cardvault/image-engine` core package.
- Validated packed RGB/RGBA/grayscale `ImageBuffer` with defensive copies and pixel safety bounds.
- Aspect-ratio-explicit bilinear image resizing as a standalone operation and configurable pipeline stage, with output safety limits.
- Composable asynchronous processing pipeline with stage enable/disable, cancellation, execution timings, result statuses, and configurable input limits.
- Deterministic grayscale and percentile-based linear contrast stages, plus dependency-free image quality indicators.
- Configurable card profile geometry types (including the standard 0.714 trading-card profile).
- Four-corner ordering, 3×3 homography calculation, and bilinear inverse-mapped perspective warping with output resource guards.
- Non-destructive Otsu, fixed global, and integral-image adaptive-mean binarization; color input is retained by the calling pipeline and threshold output is a separate grayscale image.
- Configurable local-illumination shadow correction using integral-image estimation, with alpha-channel preservation.
- CLAHE local contrast enhancement with clipped tile histograms and bilinear map interpolation; color input keeps its format and alpha channel.
- Local Niblack and Sauvola adaptive thresholding using integral-image local statistics.
- Sobel gradient edge detection with configurable threshold and a pipeline-stage adapter.
- Binary square-kernel dilation, erosion, opening, and closing for edge-map cleanup.
- Connected-component card candidate extraction and ranking by profile aspect ratio, area, and rectangularity, with per-candidate bounds and rejection reasons.
- Harris-response corner refinement around candidate corner estimates.
- A pipeline-compatible perspective-warp stage that consumes supplied corners and a target size or card profile.
- Quality reports with normalized blur/sharpness, exposure, contrast, glare, and overall scores, plus configurable capture warnings.
- Pipeline-stage adapters for CLAHE and Otsu, adaptive mean, Niblack, and Sauvola thresholding, composable with enabled/disabled stages.
- Pipeline introspection, per-stage start/completion progress callbacks, dimension/backend metadata, and cancellation handling.
- Backend interface and selector with truthful AUTO/CPU fallback; requested but unimplemented WASM/WebGPU backends return CPU with an explicit warning.
- Benchmark helper with configurable warmups, cancellation, average/median/P95/P99/min/max latency, and throughput; `benchmarkPipeline` runs full pipelines repeatedly and treats failed iterations as errors.
- Bounded `processBatch` API with configurable concurrency/job limits, cancellation propagation, indexed progress, and input-order results for Node or browser consumers.
- Pipeline input/output pixel and elapsed-time resource limits with explicit processing failures on exceeded limits (time budgets are checked between stage execution boundaries).

Detection, perspective correction, decoding/encoding adapters, browser workers, React Image Lab, WASM, and GPU backends are future roadmap items; AUTO currently safely falls back to CPU.

## Quick start

```ts
import { ImageBuffer, ImagePipeline, GrayscaleStage } from '@cardvault/image-engine';

const image = new ImageBuffer(width, height, rgbBytes, 'RGB');
const result = await new ImagePipeline([new GrayscaleStage()]).process(image);
if (!result.success) throw new Error(result.errors.join('; '));
```

`ImageBuffer` receives interleaved unsigned 8-bit values. Formats are `RGB`, `RGBA`, and `GRAY`. Pipeline processing preserves the input as `original`; stage output is exposed as `alignedColor` and `enhancedColor` until dedicated alignment/enhancement stages are configured.

## Development

```sh
npm install
npm run build
npm test
```

## CardVault Image Lab

The React/Vite demonstration is in `packages/react-demo`. Start it with `npm run dev`; it provides image upload/drop, original and pipeline-stage previews, capture-quality scores, and progress feedback while consuming the shared core package. Image decoding and pixel readback happen in the UI; CPU-heavy quality analysis and pipeline processing run in a dedicated Web Worker.

See the design specification and roadmap for intended future capabilities. The core package is published as ESM for Node.js 18+ and browser bundlers; it accepts decoded packed pixel buffers and deliberately does not bundle an opinionated image-codec dependency. `npm test` runs the core suite and a Node ESM package smoke test.

For a stable model-agnostic handoff, `toStandardizedCardImage(result)` creates a versioned `StandardizedCardImage` containing aligned image pixels, dimensions/format, available grayscale/binary representations, geometry when provided, quality, and warnings. It rejects unsuccessful pipeline results and has no dependency on any vision or ML implementation.

This package is an image-processing layer, not an OCR or card-identification system.
