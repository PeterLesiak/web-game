export class Viewport {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  set(width: number, height: number): this {
    this.width = width;
    this.height = height;

    return this;
  }

  equals(width: number, height: number): boolean {
    return this.width === width && this.height === height;
  }

  aspect(): number {
    return this.width / this.height;
  }
}
