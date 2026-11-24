import { describe,expect,it } from 'vitest';
import { ImageBuffer } from '../image/ImageBuffer.js';
import { clahe } from './clahe.js';
describe('CLAHE',()=>{
 it('enhances local grayscale contrast without changing format or input',()=>{const input=new ImageBuffer(8,8,new Uint8Array(64).fill(80),'GRAY');const output=clahe(input,{tileSize:4});expect(output.format).toBe('GRAY');expect([...input.data]).toEqual(Array(64).fill(80));expect(output.data[0]).toBeGreaterThan(0);});
 it('preserves alpha in RGBA and validates options',()=>{const values=new Uint8Array(4*4*4);for(let p=0;p<16;p++){values[p*4]=80;values[p*4+1]=90;values[p*4+2]=100;values[p*4+3]=73;}const out=clahe(new ImageBuffer(4,4,values,'RGBA'),{tileSize:2});expect(out.data[3]).toBe(73);expect(()=>clahe(new ImageBuffer(1,1,new Uint8Array([1]),'GRAY'),{clipLimit:0})).toThrow();});
});
