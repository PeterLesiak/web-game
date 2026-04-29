import * as ex from 'excalibur';

export const ballRadius = 16;
export const ballBorder = 5;

export const Palette = {
  Background: '#f79976',
  Foreground: '#ffffff',
  Outline: '#000000',

  DragEffect: '#917454',

  GrassPrimary: '#4ea343',
  GrassSecondary: '#53ae46',

  Player: '#fa5e59',
  Enemey: '#05bced',
} as const;

export const LayerIndex = {
  Board: 1,

  BallDragCone: 2,
  BallDragCircle: 3,

  SoccerBall: 4,
  Ball: 5,

  GateNet: 6,
} as const;
