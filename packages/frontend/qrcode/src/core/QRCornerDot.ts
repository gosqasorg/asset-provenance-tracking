/* eslint-disable @typescript-eslint/unbound-method */
import cornerDotTypes from "../constants/cornerDotTypes";
import type { CornerDotType } from "../types";

type DrawArgs = {
  x: number;
  y: number;
  size: number;
  context: CanvasRenderingContext2D;
  rotation: number;
};


type RotateFigureArgs = {
  x: number;
  y: number;
  size: number;
  context: CanvasRenderingContext2D;
  rotation: number;
  draw: () => void;
};

export default class QRCornerDot {
  _context: CanvasRenderingContext2D;
  _type: CornerDotType;

  constructor({ context, type }: { context: CanvasRenderingContext2D; type: CornerDotType }) {
    this._context = context;
    this._type = type;
  }

  draw(x: number, y: number, size: number, rotation: number): void {
    const context = this._context;
    const type = this._type;
    switch (type) {
      case cornerDotTypes.square:
        this._drawSquare({ x, y, size, context, rotation });
        break;
      case cornerDotTypes.dot:
      default:
        this._drawDot({ x, y, size, context, rotation });
        //this._drawDot({ x, y, size, context, rotation });;
    }  
  }

  _rotateFigure({ x, y, size, context, rotation, draw }: RotateFigureArgs): void {
    const cx = x + size / 2;
    const cy = y + size / 2;
    context.moveTo(0, 0)
    context.translate(cx, cy);
    rotation && context.rotate(rotation);
    draw();
    context.closePath();
    rotation && context.rotate(-rotation);
    context.translate(-cx, -cy);
  }

  _drawDot(args: DrawArgs): void {
    const { size, context } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        context.moveTo(0, 0)
        context.arc(0, 0, size / 2, 0, Math.PI * 2);
      }
    });
  }

  _drawSquare(args: DrawArgs): void {
    const { size, context } = args;

    this._rotateFigure({
      ...args,
      draw: () => {
        context.moveTo(0, 0)
        context.rect(-size / 2, -size / 2, size, size);
      }
    });
  }

}
