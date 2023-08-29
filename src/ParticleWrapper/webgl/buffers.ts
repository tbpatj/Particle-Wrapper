import { BufferObject } from "./types";

//---------------------- position ---------------------
export const createPositionBuffer = (
  gl: WebGLRenderingContext,
  program: WebGLProgram
) => {
  const x = (16 / gl.canvas.width) * 2;
  const y = (16 / gl.canvas.height) * 2;

  const positionLoc = gl.getAttribLocation(program, "position");

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-x, -y, x, -y, -x, y, -x, y, x, -y, x, y]),
    gl.STATIC_DRAW
  );
  if (positionBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    const buffer: BufferObject = {
      loc: positionLoc,
      buffer: positionBuffer,
      type: "static",
    };
    return buffer;
  }
  return null;
};

//--------------------- t --------------------------
export const createTBuffer = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  instances: number,
  ext: ANGLE_instanced_arrays
) => {
  const tLoc = gl.getAttribLocation(program, "t");
  //set up the data for the buffer
  const tData = new Float32Array(instances * 2);
  for (let i = 0; i < instances * 2; i += 2) {
    tData[i] = Math.random();
    tData[i + 1] = Math.random();
  }
  //create the buffer
  const tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, tData, gl.DYNAMIC_DRAW);
  if (tBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.enableVertexAttribArray(tLoc);
    gl.vertexAttribPointer(tLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, tData, gl.DYNAMIC_DRAW);
    ext.vertexAttribDivisorANGLE(tLoc, 1);
    return {
      loc: tLoc,
      buffer: tBuffer,
      type: "t",
      data: tData,
    } as BufferObject;
  }
};

export const createTexCoordsBuffer = (
  gl: WebGLRenderingContext,
  program: WebGLProgram
) => {
  const texLoc = gl.getAttribLocation(program, "texcoord");
  //set up the data for the text coords
  const texData = new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]);
  const texBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texData, gl.STATIC_DRAW);
  if (texBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
    return { loc: texLoc, buffer: texBuffer, type: "static" } as BufferObject;
  }
};
