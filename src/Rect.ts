import type { Viewport } from '~/Viewport';

export type ResponsiveRectOptions = {
  viewport: Viewport;
  aspect: number;

  margin?: { x: number; y: number };
};

export class Rect {
  x: number;
  y: number;

  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
  }

  static center(width: number, height: number, container: Viewport): Rect {
    const x = (container.width - width) * 0.5;
    const y = (container.height - height) * 0.5;

    return new Rect(x, y, width, height);
  }

  static responsive(options: ResponsiveRectOptions): Rect {
    const { viewport, aspect, margin = { x: 0, y: 0 } } = options;

    const availableWidth = viewport.width - margin.x * 2;
    const availableHeight = viewport.height - margin.y * 2;

    let width = availableWidth;
    let height = width / aspect;

    if (height > availableHeight) {
      height = availableHeight;
      width = height * aspect;
    }

    return Rect.center(width, height, viewport);
  }
}
