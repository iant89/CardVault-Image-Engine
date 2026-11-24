import { ImagePipeline } from '../core/ImagePipeline.js';
import type { ImageBuffer } from '../image/ImageBuffer.js';
import { benchmark,type BenchmarkOptions,type BenchmarkResult } from './benchmark.js';
/** Benchmarks an entire configured pipeline against one immutable image fixture. */
export function benchmarkPipeline(pipeline:ImagePipeline,image:ImageBuffer,options:BenchmarkOptions={}):Promise<BenchmarkResult>{
 return benchmark(async()=>{const result=await pipeline.process(image,options.signal?{signal:options.signal}:{});if(!result.success)throw new Error(`Pipeline benchmark iteration failed (${result.status}): ${result.errors.join('; ')}`);},options);
}
