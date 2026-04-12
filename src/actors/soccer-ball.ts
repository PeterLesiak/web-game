import * as ex from 'excalibur';

import { DampingComponent } from '~/components/damping-component';
import { LayerIndex, Palette } from '~/resources';

const ballRadius = 8;
const ballBorder = 3;
const ballOutlineRadius = ballBorder + ballRadius * 2.75;
const graphicRadius = ballOutlineRadius + 1;

class SoccerBallGraphic extends ex.Raster {
  constructor() {
    super({ width: graphicRadius * 2, height: graphicRadius * 2 });
  }

  antiRotation: number = 0;

  override execute(ctx: CanvasRenderingContext2D): void {
    ctx.translate(graphicRadius, graphicRadius);

    ctx.fillStyle = Palette.Foreground;
    ctx.globalAlpha = 0.1;

    ctx.beginPath();
    ctx.arc(0, 0, ballOutlineRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();

    ctx.fillStyle = Palette.Outline;
    ctx.globalAlpha = 0.2;

    ctx.rotate(this.antiRotation);
    ctx.beginPath();
    ctx.ellipse(
      ballRadius * 0.8,
      ballRadius * 0.8,
      ballRadius * 1.1,
      ballRadius * 1.2,
      0.6,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();

    ctx.globalAlpha = 1;

    ctx.fillStyle = Palette.Outline;

    ctx.beginPath();
    ctx.arc(0, 0, ballRadius + ballBorder, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = Palette.Foreground;

    ctx.beginPath();
    ctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = Palette.Outline;

    ctx.beginPath();
    ctx.arc(ballRadius - 3, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-ballRadius + 2, 1, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ballRadius - 3, ballRadius - 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  override clone(): ex.Graphic {
    return new SoccerBallGraphic();
  }
}

export class SoccerBall extends ex.Actor {
  graphic: SoccerBallGraphic;

  constructor() {
    const graphic = new SoccerBallGraphic();

    super({
      collisionType: ex.CollisionType.Active,
      collider: new ex.CircleCollider({ radius: ballRadius + ballBorder }),
      graphic,
      z: LayerIndex.SoccerBall,
    });

    this.addComponent(
      new DampingComponent({
        damping: 0.6,
        minSpeed: 10,
      }),
    );

    this.graphic = graphic;

    this.body.bounciness = 0.4;
    this.body.mass = 5;

    this.on('predraw', () => this.onPreDraw());
  }

  onPreDraw(): void {
    if (this.rotation === 0) return;

    this.graphic.antiRotation = Math.PI * 2 - this.rotation;
    this.graphic.flagDirty();
  }
}
