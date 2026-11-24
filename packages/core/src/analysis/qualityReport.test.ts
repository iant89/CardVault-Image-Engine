import {describe,expect,it} from 'vitest';
import {ImageBuffer} from '../image/ImageBuffer.js';
import {analyzeImageQuality} from './qualityReport.js';
describe('quality report',()=>{
 it('returns normalized scores and actionable warnings',()=>{const image=new ImageBuffer(24,24,new Uint8Array(24*24).fill(128),'GRAY');const report=analyzeImageQuality(image);for(const score of Object.values(report.scores))expect(score).toBeGreaterThanOrEqual(0);for(const score of Object.values(report.scores))expect(score).toBeLessThanOrEqual(1);expect(report.warnings.length).toBeGreaterThan(0);});
 it('accepts custom warning thresholds and validates them',()=>{const image=new ImageBuffer(4,4,new Uint8Array(16).fill(128),'GRAY');expect(analyzeImageQuality(image,{minSharpness:0,minContrast:0,minExposure:0,minGlareScore:0}).warnings).toEqual([]);expect(()=>analyzeImageQuality(image,{minContrast:2})).toThrow();});
});
