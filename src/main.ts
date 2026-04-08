import * as ex from 'excalibur';

import { Start } from '~/scenes/start';
import { Palette } from '~/resources';

const game = new ex.Engine({
  width: 460,
  height: 1000,
  displayMode: ex.DisplayMode.FitScreen,
  backgroundColor: ex.Color.fromHex(Palette.Background),

  scenes: {
    start: Start,
  },
});

await game.start();
await game.goToScene('start');

const root = document.querySelector('#root');
root?.append(game.canvas);
