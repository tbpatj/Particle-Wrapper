import Particle from "../classes/Particle";
import { MouseCursor } from "../types/mouse";
import { DefaultedWrapperOptions, ParticleGroups } from "../types/types";
import {
  createPositionBuffer,
  createTBuffer,
  createTexCoordsBuffer,
} from "../webgl/buffers";
import { fs, vs } from "../webgl/shaders";
import { GLDeps } from "../webgl/types";

export const getWebGLContext = (
  canvasRef: HTMLCanvasElement,
  width: number,
  height: number
) => {
  if (canvasRef) {
    const gl =
      canvasRef.getContext("webgl") ||
      (canvasRef.getContext(
        "experimental-webgl"
      ) as WebGLRenderingContext | null);
    if (gl) {
      console.log(width, height);
      //this sets up the clip space
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    return gl;
  }
};

export const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
) => {
  const shader = gl.createShader(type);
  if (shader) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
  }
  if (shader) console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
};

export const createProgram = (
  gl: WebGLRenderingContext,
  vShader: WebGLShader,
  fShader: WebGLShader
) => {
  const program = gl.createProgram();
  if (program) {
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) return program;
  }
  if (program) console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
};

const initalizeParticleBuffers = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  ext: ANGLE_instanced_arrays,
  particlesCnt: number
) => {
  const pBuffer = createPositionBuffer(gl, program);
  const tBuffer = createTBuffer(gl, program, particlesCnt, ext);
  const texBuffer = createTexCoordsBuffer(gl, program);
  if (pBuffer && tBuffer && texBuffer) return [pBuffer, tBuffer, texBuffer];
};

const initializeUniforms = (
  gl: WebGLRenderingContext,
  program: WebGLProgram
) => {
  const uniforms: any = {};
  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );
  uniforms["u_resolution"] = resolutionUniformLocation;
  const aspectRatioUniform = gl.getUniformLocation(program, "u_aspect_ratio");
  uniforms["u_aspect_ratio"] = aspectRatioUniform;
  return uniforms;
};

export const initializeGL = (
  gl: WebGLRenderingContext,
  options: DefaultedWrapperOptions
) => {
  //load in the gl extension
  const ext = gl.getExtension("ANGLE_instanced_arrays");
  if (ext) {
    //initialize the shaders
    const vShader = createShader(gl, gl.VERTEX_SHADER, vs);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
    if (vShader && fShader) {
      const program = createProgram(gl, vShader, fShader);
      if (program) {
        const particleBuffer = initalizeParticleBuffers(
          gl,
          program,
          ext,
          options.prtcleCnt
        );
        const uniforms = initializeUniforms(gl, program);
        if (particleBuffer) {
          const deps: GLDeps = {
            program: program,
            bufferInfo: particleBuffer,
            ext,
            uniforms: uniforms,
          };
          return deps;
        }
      }
    }
  }
  return null;
};

export const glLoop = (
  gl: WebGLRenderingContext,
  deps: GLDeps,
  particles: Particle[],
  mouse: MouseCursor,
  canvasWidth: number,
  canvasHeight: number,
  options: DefaultedWrapperOptions,
  groups: ParticleGroups
) => {
  const { program, bufferInfo, ext, uniforms } = deps;
  //maybe move program instantiation to the intialization methods along with the static buffers
  gl.useProgram(program);
  gl.uniform2f(uniforms["u_resolution"], gl.canvas.width, gl.canvas.height);
  const wR = gl.canvas.width / gl.canvas.height;
  const hR = gl.canvas.height / gl.canvas.width;
  gl.uniform2f(uniforms["u_aspect_ratio"], wR >= 1 ? 1 : wR, hR >= 1 ? 1 : hR);
  for (let i = 0; i < bufferInfo.length; i++) {
    const buffer = bufferInfo[i];
    if (buffer.type === "static") {
      // gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
      // gl.enableVertexAttribArray(buffer.loc);
      // gl.vertexAttribPointer(buffer.loc, 2, gl.FLOAT, false, 0, 0);
    }
    if (buffer.type === "t") {
      if (buffer.data && particles.length > 0) {
        for (let i = 0; i < buffer.data.length; i += 2) {
          const pi = i / 2;
          const p = particles[pi];
          buffer.data[i] = p.pos.x;
          buffer.data[i + 1] = p.pos.y;
          const group = groups[p.group ?? ""];
          particles[pi].updateParticle(
            mouse,
            canvasWidth,
            canvasHeight,
            options,
            group
          );
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
        gl.enableVertexAttribArray(buffer.loc);
        gl.vertexAttribPointer(buffer.loc, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(gl.ARRAY_BUFFER, buffer.data, gl.DYNAMIC_DRAW);
        ext.vertexAttribDivisorANGLE(buffer.loc, 1);
      }
    }
  }
  ext.drawArraysInstancedANGLE(
    gl.TRIANGLES,
    0, // offset
    6, // num vertices per instance
    particles.length // num instances
  );

  // gl.bindBuffer(gl.ARRAY_BUFFER, translateBuffer);
  // gl.bufferData(gl.)
};
