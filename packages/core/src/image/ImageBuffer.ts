export type PixelFormat = 'RGB' | 'RGBA' | 'GRAY';

/** Packed, row-major unsigned 8-bit pixels. The buffer is copied on construction. */
export class ImageBuffer {
  readonly data: Uint8Array;
  readonly channels: number;
  constructor(readonly width: number, readonly height: number, data: Uint8Array | Uint8ClampedArray, readonly format: PixelFormat = 'RGBA') {
    if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1) throw new RangeError('Image dimensions must be positive safe integers');
    this.channels = format === 'RGBA' ? 4 : format === 'RGB' ? 3 : 1;
    if (width * height > 100_000_000) throw new RangeError('Image exceeds the default 100 megapixel safety limit');
    if (data.length !== width * height * this.channels) throw new RangeError(`Expected ${width * height * this.channels} pixel values, received ${data.length}`);
    this.data = new Uint8Array(data);
  }
  clone(): ImageBuffer { return new ImageBuffer(this.width, this.height, this.data, this.format); }
  getPixel(x: number, y: number): readonly number[] {
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= this.width || y >= this.height) throw new RangeError('Pixel coordinates are outside the image');
    const i = (y * this.width + x) * this.channels;
    return Array.from(this.data.subarray(i, i + this.channels));
  }
}
