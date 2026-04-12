export function drawVerticalMirror(
  ctx: CanvasRenderingContext2D,
  height: number,
  fn: (upside: boolean) => void,
) {
  fn(false);

  ctx.save();

  ctx.translate(0, height);
  ctx.scale(1, -1);

  fn(true);

  ctx.restore();
}

export function drawRoundedStar({
  ctx,
  x,
  y,
  points,
  outerRadius,
  innerRadius,
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  points: number;
  outerRadius: number;
  innerRadius: number;
}): void {
  const step = Math.PI / points;
  const vertices = [];

  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;

    vertices.push({
      x: x + Math.cos(angle) * r,
      y: y + Math.sin(angle) * r,
    });
  }

  ctx.beginPath();

  for (let i = 0; i < vertices.length; i++) {
    const prev = vertices[(i - 1 + vertices.length) % vertices.length];
    const curr = vertices[i];
    const next = vertices[(i + 1) % vertices.length];

    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;

    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);

    const r = Math.min(1, len1 / 2, len2 / 2);

    const p1x = curr.x - (v1x / len1) * r;
    const p1y = curr.y - (v1y / len1) * r;

    const p2x = curr.x + (v2x / len2) * r;
    const p2y = curr.y + (v2y / len2) * r;

    if (i === 0) {
      ctx.moveTo(p1x, p1y);
    } else {
      ctx.lineTo(p1x, p1y);
    }

    ctx.quadraticCurveTo(curr.x, curr.y, p2x, p2y);
  }

  ctx.closePath();
  ctx.fill();
}
