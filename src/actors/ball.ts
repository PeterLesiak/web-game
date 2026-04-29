import * as ex from 'excalibur';

import { boardFrameGroup } from '~/actors/board';
import { soccerBallGroup } from '~/actors/soccer-ball';
import { type BallDragEffect } from '~/actors/ball-drag-effect';
import { DampingComponent } from '~/components/damping-component';
import { ballBorder, ballRadius, LayerIndex, Palette } from '~/resources';
import { drawRoundedStar } from '~/utils';

export type Team = 'player' | 'enemy';

const desiredDashLength = 16;
const desiredGapLength = 12;
const dashLineWidth = 4.5;
const ballOutlineRadius = ballRadius + ballBorder * 2.25;
const graphicRadius = ballOutlineRadius + dashLineWidth;

export const ballGroup = ex.CollisionGroupManager.create('ball');

class BallGraphic extends ex.Raster {
  readonly team: Team;

  constructor(team: Team) {
    super({ width: graphicRadius * 2, height: graphicRadius * 2 });

    this.team = team;
  }

  antiRotation: number = 0;

  showOutline: boolean = false;
  outlineDashOffset: number = 0;

  override execute(ctx: CanvasRenderingContext2D): void {
    ctx.translate(graphicRadius, graphicRadius);

    ctx.save();

    ctx.fillStyle = Palette.Outline;
    ctx.globalAlpha = 0.2;

    ctx.rotate(this.antiRotation);
    ctx.beginPath();
    ctx.ellipse(
      ballRadius * 0.5,
      ballRadius * 0.5,
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

    ctx.fillStyle = this.team === 'player' ? Palette.Player : Palette.Enemey;

    ctx.beginPath();
    ctx.arc(0, 0, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = Palette.Foreground;

    drawRoundedStar({
      ctx,
      x: 0,
      y: 0,
      points: 5,
      outerRadius: ballRadius * 0.75,
      innerRadius: ballRadius * 0.35,
    });

    if (!this.showOutline) return;

    const arcLength = ballOutlineRadius * Math.PI * 2;
    const unit = desiredDashLength + desiredGapLength;
    const dashCount = Math.max(1, Math.round(arcLength / unit));
    const fittedUnit = arcLength / dashCount;
    const ratio = desiredDashLength / unit;
    const dash = fittedUnit * ratio;
    const gap = fittedUnit * (1 - ratio);

    ctx.save();
    ctx.rotate(this.antiRotation);
    ctx.setLineDash([dash, gap]);
    ctx.strokeStyle = Palette.Outline;
    ctx.lineWidth = dashLineWidth;
    ctx.lineDashOffset = this.outlineDashOffset;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.arc(0, 0, ballOutlineRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  override clone(): ex.Graphic {
    return new BallGraphic(this.team);
  }
}

export class Ball extends ex.Actor {
  readonly team: Team;

  static readonly pool: Ball[] = [];

  graphic: BallGraphic;

  dragging: boolean = false;
  dragStart: ex.Vector = ex.Vector.Zero;

  constructor(team: Team) {
    const graphic = new BallGraphic(team);

    super({
      collisionGroup: ex.CollisionGroup.combine([soccerBallGroup, boardFrameGroup]),
      collisionType: ex.CollisionType.Active,
      collider: new ex.CircleCollider({ radius: ballRadius + ballBorder }),
      graphic,
      z: LayerIndex.Ball,
    });

    this.addComponent(
      new DampingComponent({
        damping: 0.85,
        minSpeed: 12,
      }),
    );

    Ball.pool.push(this);
    this.team = team;
    this.graphic = graphic;

    this.pointer.useGraphicsBounds = false;
    this.body.bounciness = 0.2;

    this.on('pointerdragstart', () => {
      this.dragging = true;
      this.dragStart = this.globalPos;
    });

    this.on('predraw', () => this.onPreDraw());
  }

  override onInitialize(): void {
    this.on('cancelDragEffect', data => {
      const event = data as ex.PointerEvent & { ballDragEffect: BallDragEffect };

      if (!this.dragging) return;

      const dir = this.dragStart.sub(event.coordinates.screenPos);

      this.launch(dir.normalize());
      this.dragging = false;

      event.ballDragEffect.cancelEffect();
    });

    this.on('updateDragEffect', data => {
      const event = data as ex.PointerEvent & { ballDragEffect: BallDragEffect };

      if (!this.dragging) return;

      const distance = this.dragStart.distance(event.coordinates.screenPos);

      event.ballDragEffect.updateEffect(
        this.pos,
        event.coordinates.screenPos,
        distance,
      );
    });
  }

  launch(dir: ex.Vector): void {
    if (dir.magnitude === 0 || !isFinite(dir.x) || !isFinite(dir.y)) {
      return;
    }

    const speed = 850;

    this.body.wake();
    this.vel = dir.scale(speed);
  }

  onPreDraw(): void {
    if (this.rotation === 0) return;

    this.graphic.antiRotation = Math.PI * 2 - this.rotation;
    this.graphic.flagDirty();
  }

  override onPostUpdate(_engine: ex.Engine, deltaTime: number): void {
    const teamSign = this.team === 'player' ? -1 : 1;

    if (this.graphic.showOutline) {
      this.graphic.outlineDashOffset += deltaTime * 0.03 * teamSign;
      this.graphic.flagDirty();
    }
  }

  static showOutline(team: Team): void {
    for (const ball of Ball.pool) {
      ball.graphic.showOutline = ball.team === team;
    }
  }

  static hideOutline(): void {
    for (const ball of Ball.pool) {
      ball.graphic.showOutline = false;
    }
  }
}
