interface ColorConstructor {
  R?: number;
  G?: number;
  B?: number;
  A?: number;
}
class ColorRGB {
  R: number;
  G: number;
  B: number;
  A: number;

  constructor({ R = 0, G = 0, B = 0, A = 255 }: ColorConstructor) {
    this.R = R;
    this.G = G;
    this.B = B;
    this.A = A;
  }

  toObject() {
    return { R: this.R, G: this.G, B: this.B, A: this.A };
  }

  toString() {
    return `rgba(${this.R},${this.G},${this.B},${this.A / 255})`;
  }

  interpolate(c: ColorRGB, mul: number) {
    this.R = c.R + (this.R - c.R) * mul;
    this.G = c.G + (this.G - c.G) * mul;
    this.B = c.B + (this.B - c.B) * mul;
    this.A = c.A + (this.A - c.A) * mul;
  }
}

export default ColorRGB;
