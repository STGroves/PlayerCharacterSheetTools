class Vector {
  /**
   * @constructor
   * @param {number} x 
   * @param {number} y 
   */
  constructor(x, y) {
    this.x = Math.abs(x) < 0.000001 ? 0 : x;
    this.y = Math.abs(y) < 0.000001 ? 0 : y;
  }

  /**
   * Creates a deep clone of the vector.
   * @param {Vector} vector The vector to be cloned.
   * @returns {Vector} The cloned vector.
   */
  static clone(vector) {
    return new Vector(vector.x, vector.y);
  }

  /**
   *Returns the inverse of the vector.
   *
   * @readonly
   * @memberof Vector
   */
  get inverse() {
    return new Vector(-this.x, -this.y);
  }

  /**
   *Returns the magnitude of the vector.
   *
   * @readonly
   * @memberof Vector
   */
  get magnitude() {
    return Math.sqrt((this.x * this.x) + (this.y * this.y));
  }

  /**
   *Equivalent to 'new Vector(1, 1);'.
   *
   * @readonly
   * @static
   * @memberof Vector
   */
  static get One() { return new Vector(1, 1); }
  static get Zero() { return new Vector(0, 0); }
  static get Left() { return new Vector(-1, 0); }
  static get Right() { return new Vector(1, 0); }
  static get Up() { return new Vector(0, -1); }
  static get Down() { return new Vector(0, 1); }

  get back() { return Vector.multiply(this, -1); }
  get left() { return new Vector(this.y * -1, this.x); }
  get right() { return new Vector(this.y, this.x); }

  normalize() {
    let length = this.magnitude;
    return new Vector(this.x / length, this.y / length);
  }

  equals(other) {
    return other.x === this.x && other.y === this.y;
  }

  toString() {
    return `X: ${this.x}, Y: ${this.y}`;
  }

  toPathString() {
    return `${this.x} ${this.y}`;
  }

  static getDirectionVector(last, current) {
    return new Vector(current.x - last.x, current.y - last.y);
  }

  static add(vec1, vec2) {
    return new Vector(vec1.x + vec2.x, vec1.y + vec2.y);
  }

  static multiply(vec, multiplier) {
    return new Vector(vec.x * multiplier, vec.y * multiplier);
  }

  static subtract(vec1, vec2) {
    return new Vector(vec1.x - vec2.x, vec1.y - vec2.y);
  }

  static divide(vec, divisor) {
    return new Vector(vec.x / divisor, vec.y / divisor);
  }
}