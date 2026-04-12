import * as ex from 'excalibur';

import { LayerIndex, Palette } from '~/resources';
import { drawVerticalMirror } from '~/utils';

const fieldWidth = 391;
const fieldHeight = 670;
const frameSize = 17;
const grassStripes = 12;
const decorationLineSize = 6.5;
const centerArcRadius = 35;
const insideGateWidth = 218;
const insideGateHeight = 65;
const insideGateArcRadius = 34;
const outsideGateOuterWidth = 144;
const outsideGateOuterHeight = 28;
const outsideGateFrameSize = frameSize * 0.45;
const outsideGateSeparatorSize = outsideGateFrameSize * 0.5;
const outsideGateInnerWidth = outsideGateOuterWidth * 0.95;
const outsideGateInnerHeight = frameSize - outsideGateSeparatorSize * 0;
const outsideGateNetTileSize = outsideGateOuterHeight * 0.275;
const outsideGateWidth = outsideGateOuterWidth + outsideGateFrameSize * 2;
const outsideGateHeight =
  outsideGateOuterHeight + outsideGateFrameSize + outsideGateSeparatorSize * 2.5;

const boardWidth = fieldWidth + frameSize * 2;
const boardHeight = fieldHeight + frameSize * 2 + outsideGateHeight * 2;

class BoardGraphic extends ex.Raster {
  constructor() {
    super({ width: boardWidth, height: boardHeight });
  }

  override execute(ctx: CanvasRenderingContext2D): void {
    const drawGrassStripes = () => {
      ctx.fillStyle = Palette.GrassPrimary;
      ctx.fillRect(
        frameSize,
        outsideGateHeight + frameSize,
        fieldWidth,
        fieldHeight,
      );

      let accumulatedUnits = 0;

      for (let i = 0; i < grassStripes; i++) {
        const units = i === 0 || i === grassStripes - 1 ? 0.5 : 1;

        const stripeTop = Math.round(
          (accumulatedUnits / (grassStripes - 1)) * fieldHeight,
        );
        accumulatedUnits += units;
        const stripeBottom = Math.round(
          (accumulatedUnits / (grassStripes - 1)) * fieldHeight,
        );

        ctx.fillStyle = i % 2 ? Palette.GrassPrimary : Palette.GrassSecondary;
        ctx.fillRect(
          frameSize,
          outsideGateHeight + frameSize + stripeTop,
          fieldWidth,
          stripeBottom - stripeTop,
        );
      }
    };

    const drawCenterline = () => {
      ctx.fillStyle = Palette.Foreground;
      ctx.strokeStyle = Palette.Foreground;
      ctx.lineWidth = decorationLineSize;

      ctx.fillRect(
        frameSize,
        (this.height - decorationLineSize) * 0.5,
        fieldWidth,
        decorationLineSize,
      );

      ctx.beginPath();
      ctx.arc(this.width * 0.5, this.height * 0.5, centerArcRadius, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawInsideGate = () => {
      const gateX = (this.width - insideGateWidth) * 0.5;

      ctx.fillStyle = Palette.Foreground;
      ctx.strokeStyle = Palette.Foreground;
      ctx.lineWidth = decorationLineSize;

      ctx.fillRect(
        gateX,
        outsideGateHeight + frameSize,
        decorationLineSize,
        insideGateHeight,
      );
      ctx.fillRect(
        gateX + insideGateWidth - decorationLineSize,
        outsideGateHeight + frameSize,
        decorationLineSize,
        insideGateHeight,
      );
      ctx.fillRect(
        gateX,
        outsideGateHeight + frameSize + insideGateHeight - decorationLineSize,
        insideGateWidth,
        decorationLineSize,
      );

      ctx.beginPath();
      ctx.ellipse(
        this.width * 0.5,
        outsideGateHeight + frameSize + insideGateHeight - decorationLineSize,
        insideGateArcRadius,
        insideGateArcRadius * 0.75,
        0,
        0,
        Math.PI,
      );
      ctx.stroke();
    };

    const drawFrame = () => {
      ctx.fillStyle = Palette.Foreground;

      ctx.fillRect(0, outsideGateHeight, fieldWidth + frameSize * 2, frameSize);
      ctx.fillRect(
        boardWidth - frameSize,
        outsideGateHeight,
        frameSize,
        fieldHeight + frameSize * 2,
      );
      ctx.fillRect(
        0,
        outsideGateHeight + frameSize + fieldHeight,
        fieldWidth + frameSize * 2,
        frameSize,
      );
      ctx.fillRect(0, outsideGateHeight, frameSize, fieldHeight + frameSize * 2);
    };

    const drawOutsideGate = (upside: boolean) => {
      const frameInnerY =
        outsideGateOuterHeight + outsideGateFrameSize + outsideGateSeparatorSize;

      ctx.fillStyle = Palette.Foreground;

      ctx.fillRect(
        (this.width - outsideGateWidth) * 0.5,
        0,
        outsideGateWidth,
        frameInnerY,
      );

      ctx.beginPath();
      ctx.moveTo((this.width - outsideGateWidth) * 0.5, frameInnerY - 1);
      ctx.lineTo(
        (this.width - outsideGateWidth * 0.975) * 0.5,
        frameInnerY + outsideGateSeparatorSize * 2,
      );
      ctx.lineTo(
        (this.width + outsideGateWidth * 0.975) * 0.5,
        frameInnerY + outsideGateSeparatorSize * 2,
      );
      ctx.lineTo((this.width + outsideGateWidth) * 0.5, frameInnerY - 1);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = upside ? Palette.Player : Palette.Enemey;
      ctx.filter = 'brightness(90%)';

      ctx.fillRect(
        (this.width - outsideGateOuterWidth) * 0.5,
        outsideGateFrameSize,
        outsideGateOuterWidth,
        outsideGateOuterHeight,
      );

      ctx.filter = 'none';

      const innerY =
        outsideGateFrameSize + outsideGateOuterHeight + outsideGateSeparatorSize;

      ctx.beginPath();
      ctx.moveTo((this.width - outsideGateOuterWidth) * 0.5, innerY);
      ctx.lineTo(
        (this.width - outsideGateInnerWidth) * 0.5,
        innerY + outsideGateInnerHeight,
      );
      ctx.lineTo(
        (this.width + outsideGateInnerWidth) * 0.5,
        innerY + outsideGateInnerHeight,
      );
      ctx.lineTo((this.width + outsideGateOuterWidth) * 0.5, innerY);
      ctx.closePath();
      ctx.fill();
    };

    drawGrassStripes();
    drawCenterline();
    drawVerticalMirror(ctx, this.height, drawInsideGate);
    drawFrame();
    drawVerticalMirror(ctx, this.height, drawOutsideGate);
  }

  override clone(): ex.Graphic {
    return new BoardGraphic();
  }
}

class GateNetGraphic extends ex.Raster {
  constructor() {
    super({ width: boardWidth, height: boardHeight });
  }

  override execute(ctx: CanvasRenderingContext2D): void {
    const draw = () => {
      ctx.fillStyle = Palette.Foreground;
      ctx.strokeStyle = Palette.Foreground;

      ctx.fillRect(
        (this.width - outsideGateOuterWidth) * 0.5,
        outsideGateFrameSize + outsideGateOuterHeight,
        outsideGateOuterWidth,
        outsideGateSeparatorSize,
      );

      ctx.lineWidth = 0.5;

      const countX = outsideGateOuterWidth / outsideGateNetTileSize;
      const countY = outsideGateOuterHeight / outsideGateNetTileSize;

      for (let x = 0; x < countX; x++) {
        for (let y = 0; y < countY; y++) {
          const startX = (this.width - outsideGateOuterWidth) * 0.5;
          const startY = outsideGateFrameSize;

          ctx.strokeRect(
            startX + x * outsideGateNetTileSize,
            startY + y * outsideGateNetTileSize,
            outsideGateNetTileSize,
            outsideGateNetTileSize,
          );
        }
      }
    };

    drawVerticalMirror(ctx, this.height, draw);
  }

  override clone(): ex.Graphic {
    return new GateNetGraphic();
  }
}

export class Board extends ex.Entity {
  override onInitialize(engine: ex.Engine): void {
    const board = new ex.Actor({
      pos: engine.screen.center,
      graphic: new BoardGraphic(),
      z: LayerIndex.Board,
    });

    this.addChild(board);

    const gateNet = new ex.Actor({
      pos: engine.screen.center,
      graphic: new GateNetGraphic(),
      z: LayerIndex.GateNet,
    });

    this.addChild(gateNet);

    const bounds = new ex.Actor({
      pos: ex.vec(
        (engine.screen.width - boardWidth) * 0.5,
        (engine.screen.height - boardHeight) * 0.5,
      ),
      anchor: ex.vec(0, 0),
    });

    // Left border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        x: fieldWidth + frameSize,
        y: outsideGateHeight,
        width: frameSize,
        height: fieldHeight + frameSize * 2,
      }),
    );
    // Right border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        y: outsideGateHeight,
        width: frameSize,
        height: fieldHeight + frameSize * 2,
      }),
    );

    // Top left border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        y: outsideGateHeight,
        width: (boardWidth - outsideGateWidth) * 0.5 + outsideGateFrameSize,
        height: frameSize,
      }),
    );
    // Top right border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        x: (boardWidth + outsideGateWidth) * 0.5 - outsideGateFrameSize,
        y: outsideGateHeight,
        width: (boardWidth - outsideGateWidth) * 0.5 + outsideGateFrameSize,
        height: frameSize,
      }),
    );

    // Top left gate border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        x: (boardWidth - outsideGateWidth) * 0.5,
        y: 0,
        width: outsideGateFrameSize,
        height: outsideGateHeight + frameSize,
      }),
    );
    // Top right gate border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        x: (boardWidth + outsideGateWidth) * 0.5 - outsideGateFrameSize,
        y: 0,
        width: outsideGateFrameSize,
        height: outsideGateHeight + frameSize,
      }),
    );

    // Top gate border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        x: (boardWidth - outsideGateWidth) * 0.5,
        y: 0,
        width: outsideGateWidth,
        height: frameSize,
      }),
    );

    // Bottom left border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        y: boardHeight - outsideGateHeight - frameSize,
        width: (boardWidth - outsideGateWidth) * 0.5 + outsideGateFrameSize,
        height: frameSize,
      }),
    );
    // Bottom right border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        x: (boardWidth + outsideGateWidth) * 0.5 - outsideGateFrameSize,
        y: boardHeight - outsideGateHeight - frameSize,
        width: (boardWidth - outsideGateWidth) * 0.5 + outsideGateFrameSize,
        height: frameSize,
      }),
    );

    // Bottom left gate border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        x: (boardWidth - outsideGateWidth) * 0.5,
        y: boardHeight - outsideGateHeight - frameSize,
        width: outsideGateFrameSize,
        height: outsideGateHeight + frameSize,
      }),
    );
    // Bottom right gate border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        x: (boardWidth + outsideGateWidth) * 0.5 - outsideGateFrameSize,
        y: boardHeight - outsideGateHeight - frameSize,
        width: outsideGateFrameSize,
        height: outsideGateHeight + frameSize,
      }),
    );

    // Bottom gate border
    bounds.addChild(
      new ex.Actor({
        collisionType: ex.CollisionType.Fixed,
        anchor: ex.vec(0, 0),
        x: (boardWidth - outsideGateWidth) * 0.5,
        y: boardHeight - frameSize,
        width: outsideGateWidth,
        height: frameSize,
      }),
    );

    engine.add(bounds);
  }
}
