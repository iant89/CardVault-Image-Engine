import { ImageBuffer } from './ImageBuffer.js';
export type ImageFormat='JPEG'|'PNG'|'WEBP'|'BMP'|'TIFF'|'UNKNOWN';
export interface ImageMetadata {width:number;height:number;format:ImageFormat;channels?:number;orientation?:number;fileSizeBytes?:number}
export interface DecodeOptions {maxFileSizeBytes?:number;maxPixels?:number;applyOrientation?:boolean}
export interface EncodeOptions {quality?:number}
/** Pluggable codec boundary. The core remains independent of browser, Node, native, and WASM codecs. */
export interface ImageDecoder {readonly formats:readonly ImageFormat[];metadata(data:Uint8Array):ImageMetadata|Promise<ImageMetadata>;decode(data:Uint8Array,options?:DecodeOptions):ImageBuffer|Promise<ImageBuffer>}
export interface ImageEncoder {readonly formats:readonly ImageFormat[];encode(image:ImageBuffer,format:ImageFormat,options?:EncodeOptions):Uint8Array|Promise<Uint8Array>}
export interface ImageCodec {readonly format:ImageFormat;readonly decoder?:ImageDecoder;readonly encoder?:ImageEncoder}
export class ImageCodecRegistry {
 private readonly codecs=new Map<ImageFormat,ImageCodec>();
 register(codec:ImageCodec):this{if(this.codecs.has(codec.format))throw new Error(`Codec for ${codec.format} is already registered`);this.codecs.set(codec.format,codec);return this;}
 decoder(format:ImageFormat):ImageDecoder{const decoder=this.codecs.get(format)?.decoder;if(!decoder)throw new Error(`No decoder registered for ${format}`);return decoder;}
 encoder(format:ImageFormat):ImageEncoder{const encoder=this.codecs.get(format)?.encoder;if(!encoder)throw new Error(`No encoder registered for ${format}`);return encoder;}
 supportedFormats():ImageFormat[]{return [...this.codecs.keys()];}
}
/** Validate encoded byte limits and decoded dimensions before allocating full pixel storage. */
export async function decodeImage(data:Uint8Array,format:ImageFormat,registry:ImageCodecRegistry,options:DecodeOptions={}):Promise<{image:ImageBuffer;metadata:ImageMetadata}>{
 const fileLimit=options.maxFileSizeBytes??25*1024*1024;if(!Number.isSafeInteger(fileLimit)||fileLimit<1)throw new RangeError('maxFileSizeBytes must be a positive safe integer');if(data.byteLength>fileLimit)throw new RangeError(`Image file exceeds the ${fileLimit} byte limit`);
 const decoder=registry.decoder(format);if(!decoder.formats.includes(format))throw new Error(`Decoder does not declare support for ${format}`);const metadata=await decoder.metadata(data);validateImageMetadata({...metadata,fileSizeBytes:metadata.fileSizeBytes??data.byteLength},options);const image=await decoder.decode(data,options);
 if(!(image instanceof ImageBuffer))throw new TypeError('Image decoder returned an invalid image buffer');if(image.width!==metadata.width||image.height!==metadata.height)throw new Error('Decoded image dimensions do not match inspected metadata');return{image,metadata:{...metadata,fileSizeBytes:metadata.fileSizeBytes??data.byteLength}};
}
export function validateImageMetadata(metadata:ImageMetadata,options:DecodeOptions={}):void{
 const maxPixels=options.maxPixels??40_000_000,maxFileSize=options.maxFileSizeBytes??25*1024*1024;
 if(!Number.isSafeInteger(maxPixels)||maxPixels<1)throw new RangeError('maxPixels must be a positive safe integer');if(!Number.isSafeInteger(maxFileSize)||maxFileSize<1)throw new RangeError('maxFileSizeBytes must be a positive safe integer');
 if(!Number.isSafeInteger(metadata.width)||!Number.isSafeInteger(metadata.height)||metadata.width<1||metadata.height<1)throw new RangeError('Decoded image dimensions must be positive safe integers');
 if(metadata.fileSizeBytes!==undefined&&(!Number.isSafeInteger(metadata.fileSizeBytes)||metadata.fileSizeBytes<0))throw new RangeError('fileSizeBytes must be a non-negative safe integer');
 if(metadata.fileSizeBytes!==undefined&&metadata.fileSizeBytes>maxFileSize)throw new RangeError(`Image file exceeds the ${maxFileSize} byte limit`);
 if(metadata.width*metadata.height>maxPixels)throw new RangeError(`Image dimensions exceed the ${maxPixels} pixel limit`);
}
