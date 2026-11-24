import { describe, expect, it } from 'vitest';
import { ImageBuffer } from '../image/ImageBuffer.js';
import { adaptiveMeanThreshold, globalThreshold, otsuThreshold } from './threshold.js';
describe('threshold processors',()=>{
 it('uses Otsu to split two intensity classes',()=>{const values=new Uint8Array([0,0,10,10,240,240,255,255]);const {image,threshold}=otsuThreshold(new ImageBuffer(8,1,values,'GRAY'));expect(threshold).toBeGreaterThanOrEqual(10);expect(threshold).toBeLessThan(240);expect([...image.data]).toEqual([0,0,0,0,255,255,255,255]);});
 it('supports explicit and local thresholds without modifying color source',()=>{const src=new ImageBuffer(3,3,new Uint8Array(27).fill(120),'RGB');const binary=globalThreshold(src,100);expect(binary.format).toBe('GRAY');expect([...binary.data]).toEqual(Array(9).fill(255));expect(adaptiveMeanThreshold(src,3,0).data).toHaveLength(9);expect(src.format).toBe('RGB');});
 it('rejects invalid threshold parameters',()=>{const image=new ImageBuffer(3,3,new Uint8Array(9),'GRAY');expect(()=>globalThreshold(image,300)).toThrow();expect(()=>adaptiveMeanThreshold(image,4)).toThrow();});
});
