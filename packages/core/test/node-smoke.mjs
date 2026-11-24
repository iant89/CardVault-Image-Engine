import assert from 'node:assert/strict';
import { ImageBuffer, ImagePipeline, GrayscaleStage } from '../dist/index.js';
const input = new ImageBuffer(16, 16, new Uint8Array(16 * 16 * 3).fill(127), 'RGB');
const result = await new ImagePipeline([new GrayscaleStage()]).process(input);
assert.equal(result.success, true);
assert.equal(result.alignedColor.format, 'GRAY');
assert.equal(result.metrics.backend, 'CPU');
console.log('Node ESM package smoke test passed.');
