import { Rect } from '~/Rect';
import { Viewport } from '~/Viewport';
import { Vector2 } from './Vector2';

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d', { colorSpace: 'display-p3' })!;

const viewport = new Viewport(0, 0);

function resizeToViewport(): void {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (viewport.equals(width, height)) return;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  context.scale(dpr, dpr);

  viewport.set(width, height);
}

const Palette = {
  Background: '#f79976',
  Foreground: '#ffffff',
  Outline: '#000000',

  GrassPrimary: '#4ea343',
  GrassSecondary: '#53ae46',

  Player: '#05bced',
  Enemey: '#fa5e59',
} as const;

function drawBackground(board: Rect): void {
  context.fillStyle = Palette.Background;
  context.fillRect(0, 0, viewport.width, viewport.height);

  const grassStripes = 12;
  const stripeHeight = board.height / 12;
  const borderSize = 15;
  const centerlineSize = 5;
  const centerArcRadius = stripeHeight * 0.6;
  const gatePortalHeight = stripeHeight * 1.2;
  const gateWidthRatio = 0.5;
  const gateLineSize = 6;
  const gateArcRadius = stripeHeight * 0.5;

  drawGrassStripes(board);

  context.fillStyle = Palette.Foreground;
  context.strokeStyle = Palette.Foreground;

  drawBorder(board);
  drawCenterline(board);
  drawGates(board);

  function drawGrassStripes(board: Rect): void {
    let accumulatedUnits = 0;

    for (let i = 0; i < grassStripes; i++) {
      const units = i === 0 || i === grassStripes - 1 ? 0.5 : 1;

      const stripeTop = Math.round(
        board.y + (accumulatedUnits / (grassStripes - 1)) * board.height,
      );
      accumulatedUnits += units;
      const stripeBottom = Math.round(
        board.y + (accumulatedUnits / (grassStripes - 1)) * board.height,
      );

      context.fillStyle = i % 2 ? Palette.GrassPrimary : Palette.GrassSecondary;
      context.fillRect(board.x, stripeTop, board.width, stripeBottom - stripeTop);
    }
  }

  function drawBorder(board: Rect): void {
    const frameRects = [
      [
        board.x - borderSize,
        board.y - borderSize,
        board.width + borderSize * 2,
        borderSize,
      ],
      [
        board.x + board.width,
        board.y - borderSize,
        borderSize,
        board.height + borderSize * 2,
      ],
      [
        board.x - borderSize,
        board.y + board.height,
        board.width + borderSize * 2,
        borderSize,
      ],
      [
        board.x - borderSize,
        board.y - borderSize,
        borderSize,
        board.height + borderSize * 2,
      ],
    ];

    frameRects.forEach(([x, y, w, h]) => {
      context.fillRect(x, y, w, h);
    });
  }

  function drawCenterline(board: Rect): void {
    context.lineWidth = centerlineSize;

    context.fillRect(
      board.x,
      board.y + (board.height - centerlineSize) * 0.5,
      board.width,
      centerlineSize,
    );

    context.beginPath();
    context.arc(
      board.x + board.width * 0.5,
      board.y + board.height * 0.5,
      centerArcRadius,
      0,
      Math.PI * 2,
    );
    context.stroke();
  }

  function drawGates(board: Rect): void {
    const gateWidth = board.width * gateWidthRatio;
    const gateX = board.x + (board.width - gateWidth - gateLineSize) * 0.5;

    const drawGatePortal = (upside: boolean) => {
      const gateY = board.y + (upside ? board.height - gatePortalHeight : 0);

      context.fillRect(gateX, gateY, gateLineSize, gatePortalHeight);
      context.fillRect(gateX + gateWidth, gateY, gateLineSize, gatePortalHeight);
      context.fillRect(
        gateX,
        gateY + (upside ? 0 : gatePortalHeight) - gateLineSize * 0.5,
        gateWidth + gateLineSize,
        gateLineSize,
      );

      context.beginPath();
      context.ellipse(
        board.x + board.width * 0.5,
        gateY + (upside ? 0 : gatePortalHeight),
        gateArcRadius,
        gateArcRadius * 0.8,
        0,
        upside ? Math.PI : 0,
        upside ? Math.PI * 2 : Math.PI,
      );
      context.stroke();
    };

    context.lineWidth = gateLineSize;

    drawGatePortal(false);
    drawGatePortal(true);
  }
}

const outsideGateMarginY = 0.07;

function drawOutsideGates(board: Rect): void {
  const gateHeight = viewport.height * outsideGateMarginY;
  const gateWidth = board.width * 0.35;
  const gateLineSize = 8;

  context.fillStyle = Palette.Foreground;

  const drawGatePortal = (upside: boolean) => {
    const gateX = board.x + (board.width - gateWidth - gateLineSize) * 0.5;
    const gateY = board.y + (upside ? board.height : -gateHeight);

    context.fillRect(gateX, gateY, gateLineSize, gateHeight);
    context.fillRect(gateX + gateWidth, gateY, gateLineSize, gateHeight);
    context.fillRect(
      gateX,
      gateY + (upside ? gateHeight : 0),
      gateWidth + gateLineSize,
      gateLineSize,
    );
  };

  drawGatePortal(false);
  drawGatePortal(true);
}

type BallTeam = 'player' | 'enemy';

class Ball {
  team: BallTeam;

  readonly position = Vector2.zero();
  readonly velocity = Vector2.zero();

  constructor(team: BallTeam) {
    this.team = team;
  }
}

const ballsPerTeam = 5;

function generateBalls(team: BallTeam): Ball[] {
  const balls = Array.from({ length: ballsPerTeam }, () => new Ball(team));

  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];

    ball.position.x = Math.random();
    ball.position.y = Math.random();
  }

  return balls;
}

const players = generateBalls('player');
const enemies = generateBalls('enemy');

function drawRoundedStar({
  x,
  y,
  points,
  outerRadius,
  innerRadius,
}: {
  x: number;
  y: number;
  points: number;
  outerRadius: number;
  innerRadius: number;
}): void {
  const step = Math.PI / points;
  const vertices = [];

  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;

    vertices.push({
      x: x + Math.cos(angle) * r,
      y: y + Math.sin(angle) * r,
    });
  }

  context.beginPath();

  for (let i = 0; i < vertices.length; i++) {
    const prev = vertices[(i - 1 + vertices.length) % vertices.length];
    const curr = vertices[i];
    const next = vertices[(i + 1) % vertices.length];

    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;

    const len1 = Math.hypot(v1x, v1y);
    const len2 = Math.hypot(v2x, v2y);

    const r = Math.min(1, len1 / 2, len2 / 2);

    const p1x = curr.x - (v1x / len1) * r;
    const p1y = curr.y - (v1y / len1) * r;

    const p2x = curr.x + (v2x / len2) * r;
    const p2y = curr.y + (v2y / len2) * r;

    if (i === 0) {
      context.moveTo(p1x, p1y);
    } else {
      context.lineTo(p1x, p1y);
    }

    context.quadraticCurveTo(curr.x, curr.y, p2x, p2y);
  }

  context.closePath();
  context.fill();
}

function drawBalls(board: Rect, balls: Ball[]): void {
  const ballRadius = board.height * 0.0275;
  const shadowOffset = ballRadius * 0.5;
  const starOuterRadius = ballRadius * 0.6;
  const starInnerRadius = starOuterRadius * 0.5;

  for (const ball of balls) {
    const x =
      board.x + ballRadius + ball.position.x * (board.width - ballRadius * 2);
    const y =
      board.y + ballRadius + ball.position.y * (board.height - ballRadius * 2);

    context.fillStyle = Palette.Outline;
    context.globalAlpha = 0.2;

    context.beginPath();
    context.ellipse(
      x + shadowOffset,
      y + shadowOffset,
      ballRadius * 0.85,
      ballRadius * 1.0,
      0.6,
      0,
      Math.PI * 2,
    );
    context.fill();

    context.globalAlpha = 1;
    context.fillStyle = ball.team === 'player' ? Palette.Player : Palette.Enemey;

    context.beginPath();
    context.arc(x, y, ballRadius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = Palette.Foreground;

    drawRoundedStar({
      x,
      y,
      points: 5,
      outerRadius: starOuterRadius,
      innerRadius: starInnerRadius,
    });

    context.strokeStyle = Palette.Outline;
    context.lineWidth = 6;

    context.beginPath();
    context.arc(x, y, ballRadius, 0, Math.PI * 2);
    context.stroke();
  }
}

const boardMarginY = 0.05;

function update(): void {
  requestAnimationFrame(update);

  resizeToViewport();

  const board = Rect.responsive({
    viewport,
    aspect: 3 / 5,
    margin: { x: 0, y: viewport.height * (outsideGateMarginY + boardMarginY) },
  });

  drawBackground(board);

  drawBalls(board, players);
  drawBalls(board, enemies);

  drawOutsideGates(board);
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#app')!;
  root.append(canvas);

  update();
});
