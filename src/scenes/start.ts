import * as ex from 'excalibur';

import { Board } from '~/actors/board';

export class Start extends ex.Scene {
  override onInitialize(): void {
    const board = new Board();

    this.add(board);
  }
}
