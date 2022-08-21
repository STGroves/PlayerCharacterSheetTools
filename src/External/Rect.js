import Vector from './Vector.js';

export default class Rect {
  static get LimitType() {
    return {
      All: 3,
      X: 1,
      Y: 2,
    };
  }

  #x = 0;
  #y = 0;
  #width = 0;
  #height = 0;

  /**
   * @constructor
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  constructor(x, y, width, height) {
    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
  }

  static createFromHTMLRect(rect) {
    return new Rect(rect.x, rect.y, rect.width, rect.height);
  }

  get Top() {
    return this.#y;
  }
  get Left() {
    return this.#x;
  }
  get Bottom() {
    return this.#y + this.#height;
  }
  get Right() {
    return this.#x + this.#width;
  }

  get TopLeft() {
    return new Vector(this.#x, this.#y);
  }
  get BottomRight() {
    return new Vector(this.Right, this.Bottom);
  }

  get Position() {
    return new Vector(this.#x, this.#y);
  }
  get Dimensions() {
    return new Vector(this.#width, this.#height);
  }

  get X() {
    return this.#x;
  }
  get Y() {
    return this.#y;
  }
  get Width() {
    return this.#width;
  }
  get Height() {
    return this.#height;
  }

  static equals(rect, otherRect) {
    return Vector.equals(rect.Position, otherRect.Position) && Vector.equals(rect.Dimensions, otherRect.Dimensions);
  }

  static limit(bounds, target, limitType = Rect.LimitType.All) {
    const VALID_X = bounds.Width >= target.Width;
    const VALID_Y = bounds.Height >= target.Height;

    switch (limitType) {
      case Rect.LimitType.All:
        if (!(VALID_X && VALID_Y)) throw new Error('Target is too big for the Bounds!');
        break;

      case Rect.LimitType.X:
        if (!VALID_X) throw new Error('Target is too big for the Bounds!');
        break;

      case Rect.LimitType.Y:
        if (!VALID_Y) throw new Error('Target is too big for the Bounds!');
        break;

      default:
    }

    const LEFT_DIFF = target.Left - bounds.Left;
    const TOP_DIFF = target.Top - bounds.Top;
    const RIGHT_DIFF = bounds.Right - target.Right;
    const BOTTOM_DIFF = bounds.Bottom - target.Bottom;

    let x;
    let y;

    if (limitType & Rect.LimitType.X) {
      if (LEFT_DIFF < 0) x = bounds.Left;
      else if (RIGHT_DIFF < 0) x = bounds.Right + RIGHT_DIFF;
    }

    if (limitType & Rect.LimitType.Y) {
      if (TOP_DIFF < 0) y = bounds.Top;
      else if (BOTTOM_DIFF < 0) y = bounds.Bottom + BOTTOM_DIFF;
    }

    return new Vector(x, y);
  }

  static contains(bounds, target) {
    return (
      target.Left >= bounds.Left &&
      target.Top >= bounds.Top &&
      target.Right <= bounds.Right &&
      target.Bottom <= bounds.Bottom
    );
  }

  static overlaps(bounds, target, allowContains = true) {
    if (allowContains && Rect.contains(bounds, target)) return true;

    const LEFT = target.Left > bounds.Left && target.Left < bounds.Right;
    const TOP = target.Top > bounds.Top && target.Top < bounds.Bottom;
    const RIGHT = target.Right > bounds.Left && target.Right < bounds.Right;
    const BOTTOM = target.Bottom > bounds.Top && target.Bottom < bounds.Bottom;

    return (LEFT && TOP) || (RIGHT && TOP) || (LEFT && BOTTOM) || (RIGHT && BOTTOM);
  }

  setPosition(pos) {
    this.#x = pos.x;
    this.#y = pos.y;
  }

  setDimensions(dims) {
    this.#width = dims.x;
    this.#height = dims.y;
  }
}
