import {describe,expect,it} from 'vitest';
import {ImageBuffer} from '../image/ImageBuffer.js';
import {niblackThreshold,sauvolaThreshold} from './localThreshold.js';
describe('local statistic thresholds',()=>{
 it('returns grayscale binary images of equal dimensions',()=>{const data=Uint8Array.from({length:100},(_,i)=>i<50?30:210);const input=new ImageBuffer(10,10,data,'GRAY');for(const output of [niblackThreshold(input),sauvolaThreshold(input)]){expect(output.width).toBe(10);expect(output.format).toBe('GRAY');expect([...new Set(output.data)].every(v=>v===0||v===255)).toBe(true);}});
 it('rejects invalid local parameters',()=>{const image=new ImageBuffer(3,3,new Uint8Array(9),'GRAY');expect(()=>niblackThreshold(image,{windowSize:2})).toThrow();expect(()=>sauvolaThreshold(image,{dynamicRange:0})).toThrow();});
});
