import * as ex from 'excalibur';

import { Palette } from '~/resources';

const boardWidth = 425;
const boardHeight = 704;
const frameSize = 17;
const outsideGateHeight = 30;

class BoardField extends ex.Raster {
  constructor() {
    super({ width: boardWidth, height: boardHeight });
  }

  override execute(ctx: CanvasRenderingContext2D): void {
    const grassStripes = 12;
    const lineSize = 6;
    const centerArcRadius = 35;
    const gateWidth = 220;
    const gateHeight = 80;
    const gateArcRadius = 34;

    const drawGrassStripes = () => {
      let accumulatedUnits = 0;

      for (let i = 0; i < grassStripes; i++) {
        const units = i === 0 || i === grassStripes - 1 ? 0.5 : 1;

        const stripeTop = Math.round(
          (accumulatedUnits / (grassStripes - 1)) * boardHeight,
        );
        accumulatedUnits += units;
        const stripeBottom = Math.round(
          (accumulatedUnits / (grassStripes - 1)) * boardHeight,
        );

        ctx.fillStyle = i % 2 ? Palette.GrassPrimary : Palette.GrassSecondary;
        ctx.fillRect(0, stripeTop, boardWidth, stripeBottom - stripeTop);
      }
    };

    const drawCenterline = () => {
      ctx.fillStyle = Palette.Foreground;
      ctx.strokeStyle = Palette.Foreground;
      ctx.lineWidth = lineSize;

      ctx.fillRect(0, (boardHeight - lineSize) * 0.5, boardWidth, lineSize);

      ctx.beginPath();
      ctx.arc(boardWidth * 0.5, boardHeight * 0.5, centerArcRadius, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawGate = (upside: boolean) => {
      const gateX = (boardWidth - gateWidth) * 0.5;
      const gateY = upside ? boardHeight - gateHeight : 0;

      ctx.fillStyle = Palette.Foreground;
      ctx.strokeStyle = Palette.Foreground;
      ctx.lineWidth = lineSize;

      ctx.fillRect(gateX, gateY, lineSize, gateHeight);
      ctx.fillRect(gateX + gateWidth - lineSize, gateY, lineSize, gateHeight);
      ctx.fillRect(
        gateX,
        upside ? gateY : gateHeight - lineSize,
        gateWidth,
        lineSize,
      );

      ctx.beginPath();
      ctx.ellipse(
        boardWidth * 0.5,
        upside ? gateY + lineSize : gateHeight - lineSize,
        gateArcRadius,
        gateArcRadius * 0.75,
        0,
        upside ? Math.PI : 0,
        upside ? Math.PI * 2 : Math.PI,
      );
      ctx.stroke();
    };

    drawGrassStripes();
    drawCenterline();
    drawGate(false);
    drawGate(true);
  }

  override clone(): ex.Graphic {
    return new BoardField();
  }
}

class BoardFrame extends ex.Raster {
  constructor() {
    super({ width: boardWidth, height: boardHeight + outsideGateHeight * 2 });
  }

  override execute(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = Palette.Foreground;

    ctx.fillRect(0, outsideGateHeight, boardWidth, frameSize);
    ctx.fillRect(boardWidth - frameSize, outsideGateHeight, frameSize, boardHeight);
    ctx.fillRect(
      0,
      this.height - outsideGateHeight - frameSize,
      boardWidth,
      frameSize,
    );
    ctx.fillRect(0, outsideGateHeight, frameSize, boardHeight);
  }

  override clone(): ex.Graphic {
    return new BoardFrame();
  }
}

export class Board extends ex.Entity {
  override onInitialize(engine: ex.Engine): void {
    const boardField = new ex.Actor({
      pos: engine.screen.center,
      graphic: new BoardField(),
    });

    this.addChild(boardField);

    const boardFrame = new ex.Actor({
      pos: engine.screen.center,
      graphic: new BoardFrame(),
    });

    this.addChild(boardFrame);
  }
}
