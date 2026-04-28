import * as ex from 'excalibur';
import { ballBorder, ballRadius, LayerIndex, Palette } from '~/resources';

const minRadius = ballRadius + ballBorder;
const maxRadius = minRadius + 50;

class BallDragCone extends ex.Raster {
  vertex: ex.Vector = ex.Vector.Zero;

  override execute(ctx: CanvasRenderingContext2D): void {
    const mag = this.vertex.magnitude;
    if (mag <= 0) return;

    const edge1 = ex.vec(0, minRadius * -2);
    const edge2 = ex.vec(0, minRadius * 2);

    ctx.save();

    const gradient = ctx.createLinearGradient(mag, 0, 0, 0);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.3, Palette.Foreground);
    gradient.addColorStop(1, Palette.Foreground);

    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.5;

    ctx.beginPath();
    ctx.moveTo(edge1.x, edge1.y);
    ctx.lineTo(edge2.x, edge2.y);
    ctx.lineTo(mag, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  override clone(): ex.Graphic {
    const clone = new BallDragCone();
    clone.vertex = this.vertex.clone();
    return clone;
  }
}

export class BallDragEffect extends ex.Entity {
  readonly transform: ex.TransformComponent;

  readonly circleGraphic: ex.Circle;
  readonly circleEffect: ex.Actor;

  readonly coneGraphic: BallDragCone;
  readonly coneEffect: ex.Actor;

  constructor() {
    super();

    this.transform = new ex.TransformComponent();
    this.addComponent(this.transform);

    this.circleGraphic = new ex.Circle({
      radius: 0,
      color: ex.Color.fromHex(Palette.DragEffect),
    });
    this.circleGraphic.opacity = 0.8;

    this.circleEffect = new ex.Actor({
      graphic: this.circleGraphic,
      z: LayerIndex.BallDragCircle,
    });

    this.addChild(this.circleEffect);

    this.coneGraphic = new BallDragCone();
    this.coneGraphic.opacity = 0;

    this.coneEffect = new ex.Actor({
      graphic: this.coneGraphic,
      anchor: ex.vec(0, 0.5),
      z: LayerIndex.BallDragCone,
    });

    this.addChild(this.coneEffect);
  }

  cancelEffect(): void {
    this.circleGraphic.radius = 0;
    this.coneGraphic.opacity = 0;
  }

  updateEffect(position: ex.Vector, cursor: ex.Vector, distance: number): void {
    const radius = ex.clamp(distance + minRadius, minRadius, maxRadius);
    this.circleGraphic.radius = radius;

    const relativeCursor = cursor.sub(position);
    this.coneGraphic.vertex = relativeCursor;
    this.coneGraphic.opacity = 1;

    this.coneEffect.rotation = relativeCursor.toAngle();

    this.coneGraphic.width = relativeCursor.magnitude;
    this.coneGraphic.height = minRadius * 2;

    this.coneGraphic.flagDirty();

    position.clone(this.transform.pos);
  }
}
