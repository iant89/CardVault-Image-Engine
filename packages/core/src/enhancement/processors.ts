import { ImageBuffer, type PixelFormat } from '../image/ImageBuffer.js';
import type { ProcessingStage, ProcessingContext } from '../core/types.js';

export function toGrayscale(image: ImageBuffer): ImageBuffer {
  if (image.format === 'GRAY') return image.clone();
  const out = new Uint8Array(image.width * image.height);
  for (let p = 0; p < out.length; p++) { const i = p * image.channels; out[p] = Math.round(0.2126 * image.data[i]! + 0.7152 * image.data[i + 1]! + 0.0722 * image.data[i + 2]!); }
  return new ImageBuffer(image.width, image.height, out, 'GRAY');
}
export class GrayscaleStage implements ProcessingStage {
  readonly name = 'grayscale';
  process(image: ImageBuffer, _context: ProcessingContext): ImageBuffer { return toGrayscale(image); }
}
export type ContrastOptions = { lowPercentile?: number; highPercentile?: number };
export class LinearContrastStage implements ProcessingStage {
  readonly name = 'linear-contrast';
  constructor(readonly options: ContrastOptions = {}) {}
  process(image: ImageBuffer): ImageBuffer {
    const c = image.channels; const hist = new Uint32Array(256);
    for (let i = 0; i < image.data.length; i += c) { const v = image.format === 'GRAY' ? image.data[i]! : Math.round((image.data[i]! + image.data[i + 1]! + image.data[i + 2]!) / 3); hist[v] = hist[v]! + 1; }
    const count = image.width * image.height; const low = percentile(hist, count * (this.options.lowPercentile ?? 0.01)); const high = percentile(hist, count * (this.options.highPercentile ?? 0.99));
    const range = Math.max(1, high - low); const out = image.data.slice();
    for (let p = 0; p < count; p++) for (let ch = 0; ch < c; ch++) { const i = p * c + ch; if (image.format !== 'RGBA' || ch !== 3) out[i] = Math.max(0, Math.min(255, Math.round((image.data[i]! - low) * 255 / range))); }
    return new ImageBuffer(image.width, image.height, out, image.format as PixelFormat);
  }
}
function percentile(hist: Uint32Array, target: number): number { let sum = 0; for (let i = 0; i < hist.length; i++) { sum += hist[i]!; if (sum >= target) return i; } return 255; }
