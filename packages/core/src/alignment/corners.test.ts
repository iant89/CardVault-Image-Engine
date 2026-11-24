import {describe,expect,it} from 'vitest';
import {ImageBuffer} from '../image/ImageBuffer.js';
import {refineCorners} from './corners.js';
describe('Harris corner refinement',()=>{
 it('returns four ordered, distinct corners near the supplied estimates',()=>{const w=32,h=32,data=new Uint8Array(w*h);for(let y=8;y<24;y++)for(let x=9;x<23;x++)data[y*w+x]=255;const initial=[{x:10,y:9},{x:21,y:9},{x:21,y:22},{x:10,y:22}] as const;const result=refineCorners(new ImageBuffer(w,h,data,'GRAY'),initial,{searchRadius:3});expect(result).toHaveLength(4);expect(new Set(result.map(p=>`${p.x},${p.y}`)).size).toBe(4);for(const p of result)expect(Math.abs(p.x-initial[result.indexOf(p)]!.x)).toBeLessThanOrEqual(3);});
 it('rejects invalid search settings',()=>{const image=new ImageBuffer(3,3,new Uint8Array(9),'GRAY');const q=[{x:0,y:0},{x:2,y:0},{x:2,y:2},{x:0,y:2}] as const;expect(()=>refineCorners(image,q,{searchRadius:-1})).toThrow();});
});
