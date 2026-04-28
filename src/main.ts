import * as ex from 'excalibur';

import { Start } from '~/scenes/start';
import { Palette } from '~/resources';

const game = new ex.Engine({
  width: 460,
  height: 1000,

  displayMode: ex.DisplayMode.FitScreen,
  pointerScope: ex.PointerScope.Document,
  backgroundColor: ex.Color.fromHex(Palette.Background),

  antialiasing: { filtering: ex.ImageFiltering.Blended },
  pixelRatio: 2,

  physics: {
    solver: ex.SolverStrategy.Realistic,
  },

  scenes: {
    start: Start,
  },
});

await game.start();
await game.goToScene('start');

const root = document.querySelector('#root');
root?.append(game.canvas);
