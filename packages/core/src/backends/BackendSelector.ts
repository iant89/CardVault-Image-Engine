import { CpuBackend } from './CpuBackend.js';
import { WasmBackend } from './WasmBackend.js';
import { WebGpuBackend } from './WebGpuBackend.js';
import type { BackendKind,ProcessingBackend } from './ProcessingBackend.js';
export type BackendPreference='AUTO'|BackendKind;
export interface BackendSelection {backend:ProcessingBackend;requested:BackendPreference;fallback:boolean;warning?:string}
/** Selects only implemented backends. Acceleration capability alone never implies an implementation exists. */
export class BackendSelector {
 constructor(private readonly cpu:ProcessingBackend=new CpuBackend()){}
 select(requested:BackendPreference='AUTO'):BackendSelection{
  if(requested==='CPU')return{backend:this.cpu,requested,fallback:false};
  if(requested==='WEBGPU'||requested==='AUTO'){const gpu=new WebGpuBackend();if(gpu.available)return{backend:gpu,requested,fallback:false,warning:'WebGPU accelerates grayscale conversion; other stages use CPU.'};if(requested==='WEBGPU')return{backend:this.cpu,requested,fallback:true,warning:'WebGPU is unavailable; processing safely fell back to CPU.'};}
  if(requested==='WASM'||requested==='AUTO'){const wasm=new WasmBackend();if(wasm.available)return{backend:wasm,requested,fallback:false,warning:'WASM accelerates grayscale conversion; other stages use CPU.'};}
  return{backend:this.cpu,requested,fallback:true,warning:`${requested} backend is not implemented or unavailable; processing safely fell back to CPU.`};
 }
 static webGpuAvailable():boolean{return typeof navigator!=='undefined'&&'gpu'in navigator;}
}
