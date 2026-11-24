import { describe, expect, it } from 'vitest';
import { ImageBuffer } from '../image/ImageBuffer.js';
import { removeShadows } from './shadow.js';
describe('shadow correction',()=>{
 it('lifts dark illumination while preserving image shape and alpha',()=>{const width=9,height=9,rgba=new Uint8Array(width*height*4);for(let p=0;p<width*height;p++){rgba[p*4]=rgba[p*4+1]=rgba[p*4+2]=p<width*height/2?60:120;rgba[p*4+3]=255;}const source=new ImageBuffer(width,height,rgba,'RGBA');const out=removeShadows(source,{windowSize:5});expect(out.width).toBe(width);expect(out.format).toBe('RGBA');expect(out.data[3]).toBe(255);expect(out.data[0]).toBeGreaterThan(60);expect(source.data[0]).toBe(60);});
 it('rejects invalid strength or window',()=>{const image=new ImageBuffer(2,2,new Uint8Array(4),'GRAY');expect(()=>removeShadows(image,{strength:2})).toThrow();expect(()=>removeShadows(image,{windowSize:4})).toThrow();});
});
