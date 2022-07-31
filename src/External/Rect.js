import Vector from './Vector.js';

export default class Rect {
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

  static createFromSVGRect(rect) {
    return new Rect(rect.x, rect.y, rect.width, rect.height);
  }

  setPosition(pos) {
    this.#x = pos.x;
    this.#y = pos.y;
  }

  setDimensions(dims) {
    this.#width = dims.x;
    this.#height = dims.y;
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
}
