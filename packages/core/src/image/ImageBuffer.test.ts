import { describe, expect, it } from 'vitest';
import { ImageBuffer } from './ImageBuffer.js';
import { toGrayscale, GrayscaleStage } from '../enhancement/processors.js';
import { ImagePipeline } from '../core/ImagePipeline.js';
describe('ImageBuffer and core pipeline', () => {
  it('validates dimensions and pixel length', () => { expect(() => new ImageBuffer(2, 2, new Uint8Array(3), 'GRAY')).toThrow(); });
  it('converts RGB to grayscale without mutating input', () => { const input = new ImageBuffer(1, 1, new Uint8Array([255, 0, 0]), 'RGB'); const gray = toGrayscale(input); expect(gray.data[0]).toBe(54); expect(input.format).toBe('RGB'); });
  it('runs configured stages and returns metrics', async () => { const input = new ImageBuffer(16, 16, new Uint8Array(16 * 16 * 3).fill(100), 'RGB'); const result = await new ImagePipeline([new GrayscaleStage()]).process(input); expect(result.success).toBe(true); expect(result.alignedColor.format).toBe('GRAY'); expect(result.stages).toHaveLength(1); });
});
