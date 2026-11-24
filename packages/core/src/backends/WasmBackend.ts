import { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext,ProcessingStage } from '../core/types.js';
import { CpuBackend } from './CpuBackend.js';
import type { ProcessingBackend } from './ProcessingBackend.js';
const MODULE_BASE64='AGFzbQEAAAABCAFgBH9/f38AAwIBAAUDAQACBxYCBm1lbW9yeQIACWdyYXlzY2FsZQAACloBWAEDfwJAA0AgBCACTw0BIAAgBCADbGohBSAFLQAAQTZsIAVBAWotAABBtwFsaiAFQQJqLQAAQRNsakGAAWpBCHYhBiABIARqIAY6AAAgBEEBaiEEDAALCws=';
type WasmExports={memory:WebAssembly.Memory;grayscale:(input:number,output:number,count:number,channels:number)=>void};
/** WebAssembly acceleration for grayscale conversion; all unsupported stages safely use the CPU implementation. */
export class WasmBackend implements ProcessingBackend {
 readonly kind='WASM' as const;readonly available=typeof WebAssembly!=='undefined';lastStageBackend='CPU';lastFallbackReason?:string;private instance?:Promise<WasmExports>;private readonly cpu=new CpuBackend();
 async processStage(stage:ProcessingStage,image:ImageBuffer,context:ProcessingContext):Promise<ImageBuffer>{
  if(stage.name!=='grayscale'||image.format==='GRAY'||!this.available){this.lastStageBackend='CPU';return this.cpu.processStage(stage,image,context);}
  try{const wasm=await(this.instance??=this.instantiate());const input=image.data,outputOffset=input.length,needed=input.length+image.width*image.height,pages=Math.ceil(needed/65536),current=wasm.memory.buffer.byteLength/65536;if(pages>current)wasm.memory.grow(pages-current);const memory=new Uint8Array(wasm.memory.buffer);memory.set(input,0);wasm.grayscale(0,outputOffset,image.width*image.height,image.channels);this.lastStageBackend='WASM';return new ImageBuffer(image.width,image.height,memory.slice(outputOffset,needed),'GRAY');}
  catch(error){this.lastFallbackReason=error instanceof Error?error.message:String(error);this.lastStageBackend='CPU';return this.cpu.processStage(stage,image,context);}
 }
 private async instantiate():Promise<WasmExports>{const decoded=atob(MODULE_BASE64),bytes=Uint8Array.from(decoded,c=>c.charCodeAt(0));const result=await WebAssembly.instantiate(bytes);return result.instance.exports as unknown as WasmExports;}
}
