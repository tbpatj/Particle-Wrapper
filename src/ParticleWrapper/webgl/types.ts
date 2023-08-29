export interface GLDeps {
  program: WebGLProgram;
  bufferInfo: BufferObject[];
  uniforms: { [name: string]: UniformDeps };
  ext: ANGLE_instanced_arrays;
}

export interface UniformDeps {}

export interface BufferObject {
  loc: number;
  buffer: WebGLBuffer;
  type: "t" | "static";
  data?: Float32Array;
}
