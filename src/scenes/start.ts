import * as ex from 'excalibur';

import { Board } from '~/actors/board';
import { Ball } from '~/actors/ball';
import { SoccerBall } from '~/actors/soccer-ball';

export class Start extends ex.Scene {
  override onInitialize(engine: ex.Engine): void {
    const board = new Board();
    this.add(board);

    {
      const playerBall = new Ball('player');
      engine.screen.center.sub(ex.vec(0, -50), playerBall.pos);

      this.add(playerBall);

      const enemyBall1 = new Ball('enemy');
      engine.screen.center.sub(ex.vec(-100, -200), enemyBall1.pos);

      this.add(enemyBall1);

      const enemyBall2 = new Ball('enemy');
      engine.screen.center.sub(ex.vec(100, -200), enemyBall2.pos);

      this.add(enemyBall2);
    }

    Ball.showOutline('player');

    const soccerBall = new SoccerBall();
    engine.screen.center.sub(ex.vec(0, 50), soccerBall.pos);

    this.add(soccerBall);
  }
}
