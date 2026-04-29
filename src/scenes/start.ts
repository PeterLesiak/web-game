import * as ex from 'excalibur';

import { Board } from '~/actors/board';
import { Ball } from '~/actors/ball';
import { SoccerBall } from '~/actors/soccer-ball';
import { BallDragEffect } from '~/actors/ball-drag-effect';

const ballStartPositions = [
  ex.vec(0, 60),
  ex.vec(-60, 110),
  ex.vec(60, 110),
  ex.vec(35, 315),
  ex.vec(-35, 315),
];

export class Start extends ex.Scene {
  players!: Ball[];
  enemies!: Ball[];

  soccerBall!: SoccerBall;

  override onInitialize(engine: ex.Engine): void {
    const board = new Board();
    this.add(board);

    this.soccerBall = new SoccerBall();
    this.add(this.soccerBall);

    this.players = Array.from(ballStartPositions, () => {
      const ball = new Ball('player');

      this.add(ball);

      return ball;
    });

    this.enemies = Array.from(ballStartPositions, () => {
      const ball = new Ball('enemy');

      this.add(ball);

      return ball;
    });

    this.reset();

    const ballDragEffect = new BallDragEffect();
    this.add(ballDragEffect);

    engine.input.pointers.primary.on('up', event => {
      this.players.forEach(ball => {
        ball.emit('cancelDragEffect', { ...event, ballDragEffect });
      });
    });

    engine.input.pointers.primary.on('move', event => {
      this.players.forEach(ball => {
        ball.emit('updateDragEffect', { ...event, ballDragEffect });
      });
    });
  }

  reset() {
    this.engine.screen.center.clone(this.soccerBall.pos);
    this.soccerBall.vel = ex.Vector.Zero;

    this.players.forEach((ball, index) => {
      const offset = ballStartPositions[index];

      this.engine.screen.center.sub(ex.vec(offset.x, -offset.y), ball.pos);
      ball.vel = ex.Vector.Zero;
    });

    this.enemies.forEach((ball, index) => {
      const offset = ballStartPositions[index];

      this.engine.screen.center.sub(ex.vec(offset.x, offset.y), ball.pos);
      ball.vel = ex.Vector.Zero;
    });
  }
}
