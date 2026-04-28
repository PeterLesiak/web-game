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
  override onInitialize(engine: ex.Engine): void {
    const board = new Board();
    this.add(board);

    const playerBalls = Array.from(ballStartPositions, offset => {
      const ball = new Ball('player');
      engine.screen.center.sub(ex.vec(offset.x, -offset.y), ball.pos);

      this.add(ball);

      return ball;
    });

    Array.from(ballStartPositions, offset => {
      const ball = new Ball('enemy');
      engine.screen.center.sub(offset, ball.pos);

      this.add(ball);

      return ball;
    });

    const ballDragEffect = new BallDragEffect();
    this.add(ballDragEffect);

    engine.input.pointers.primary.on('up', event => {
      playerBalls.forEach(ball => {
        ball.emit('cancelDragEffect', { ...event, ballDragEffect });
      });
    });

    engine.input.pointers.primary.on('move', event => {
      playerBalls.forEach(ball => {
        ball.emit('updateDragEffect', { ...event, ballDragEffect });
      });
    });

    const soccerBall = new SoccerBall();
    engine.screen.center.clone(soccerBall.pos);

    this.add(soccerBall);
  }
}
