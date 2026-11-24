import { ImageBuffer } from '../image/ImageBuffer.js';
import type { ProcessingContext,ProcessingStage } from '../core/types.js';
import { CpuBackend } from './CpuBackend.js';
import type { ProcessingBackend } from './ProcessingBackend.js';
const SHADER=`@group(0) @binding(0) var<storage, read> source: array<u32>;
@group(0) @binding(1) var<storage, read_write> target: array<u32>;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) id: vec3<u32>) { let i=id.x; if(i>=arrayLength(&source)){return;} let c=source[i]; let r=c&255u; let g=(c>>8u)&255u; let b=(c>>16u)&255u; target[i]=(54u*r+183u*g+19u*b+128u)>>8u; }`;
/** WebGPU grayscale acceleration with safe CPU fallback for unsupported stages or unavailable devices. */
export class WebGpuBackend implements ProcessingBackend {
 readonly kind='WEBGPU' as const;readonly available=typeof navigator!=='undefined'&&'gpu'in navigator;lastStageBackend='CPU';private devicePromise?:Promise<any>;private pipelinePromise?:Promise<any>;private readonly cpu=new CpuBackend();
 async processStage(stage:ProcessingStage,image:ImageBuffer,context:ProcessingContext):Promise<ImageBuffer>{
  if(stage.name!=='grayscale'||image.format==='GRAY'||!this.available){this.lastStageBackend='CPU';return this.cpu.processStage(stage,image,context);}
  try{const device=await(this.devicePromise??=this.getDevice());const pipeline=await(this.pipelinePromise??=this.getPipeline(device));const count=image.width*image.height,packed=new Uint32Array(count);for(let p=0;p<count;p++){const i=p*image.channels;packed[p]=image.data[i]!|(image.data[i+1]!<<8)|(image.data[i+2]!<<16);}
   const usage={STORAGE:128,COPY_DST:8,COPY_SRC:4,MAP_READ:1};const input=device.createBuffer({size:packed.byteLength,usage:usage.STORAGE|usage.COPY_DST});const output=device.createBuffer({size:packed.byteLength,usage:usage.STORAGE|usage.COPY_SRC});const readback=device.createBuffer({size:packed.byteLength,usage:usage.MAP_READ|usage.COPY_DST});device.queue.writeBuffer(input,0,packed);
   const bind=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:input}},{binding:1,resource:{buffer:output}}]});const encoder=device.createCommandEncoder();const pass=encoder.beginComputePass();pass.setPipeline(pipeline);pass.setBindGroup(0,bind);pass.dispatchWorkgroups(Math.ceil(count/256));pass.end();encoder.copyBufferToBuffer(output,0,readback,0,packed.byteLength);device.queue.submit([encoder.finish()]);await readback.mapAsync(1);const words=new Uint32Array(readback.getMappedRange()),gray=new Uint8Array(count);for(let i=0;i<count;i++)gray[i]=words[i]!&255;readback.unmap();input.destroy();output.destroy();readback.destroy();this.lastStageBackend='WEBGPU';return new ImageBuffer(image.width,image.height,gray,'GRAY');
  }catch(error){this.lastFallbackReason=error instanceof Error?error.message:String(error);this.lastStageBackend='CPU';return this.cpu.processStage(stage,image,context);}
 }
 lastFallbackReason?:string;
 private async getDevice():Promise<any>{const gpu=(navigator as Navigator&{gpu?:any}).gpu;if(!gpu)throw new Error('WebGPU is not available');const adapter=await gpu.requestAdapter();if(!adapter)throw new Error('No WebGPU adapter is available');return adapter.requestDevice();}
 private async getPipeline(device:any):Promise<any>{const module=device.createShaderModule({code:SHADER});return device.createComputePipeline({layout:'auto',compute:{module,entryPoint:'main'}});}
}
