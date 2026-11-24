import { CpuBackend } from './CpuBackend.js';
import type { BackendKind,ProcessingBackend } from './ProcessingBackend.js';
export type BackendPreference='AUTO'|BackendKind;
export interface BackendSelection {backend:ProcessingBackend;requested:BackendPreference;fallback:boolean;warning?:string}
/** Selects only implemented backends. Acceleration capability alone never implies an implementation exists. */
export class BackendSelector {
 constructor(private readonly cpu:ProcessingBackend=new CpuBackend()){}
 select(requested:BackendPreference='AUTO'):BackendSelection{
  if(requested==='AUTO'||requested==='CPU')return{backend:this.cpu,requested,fallback:false};
  return{backend:this.cpu,requested,fallback:true,warning:`${requested} backend is not implemented; processing safely fell back to CPU.`};
 }
 static webGpuAvailable():boolean{return typeof navigator!=='undefined'&&'gpu'in navigator;}
}
