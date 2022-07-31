import Vector from './Vector.js';

export default class PathCreator {
  /**
   * @constructor
   * @param {string} command
   * @param {any[]} args
   */
  static PathCreatorData(command, args) {
    const cmd = command;
    const params = args;

    return {
      Command: cmd,
      Params: params,
    };
  }

  #position = null;
  #lastDirection = null;
  #instructions = [];

  /**
   * @constructor
   * @param {Vector} position
   * @param {Vector} direction
   */
  constructor(position = null, direction = null) {
    this.reset();

    if (position != null && !position.equals(Vector.Zero)) this.offset(position.x, position.y);
    if (direction != null) this.setDirection(direction.x, direction.y);
  }

  get Position() {
    return this.#position;
  }
  get Direction() {
    return this.#lastDirection;
  }
  get Instructions() {
    return this.#instructions;
  }

  static #degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  #cacheDirection(lastPos) {
    const DIR_VECTOR = Vector.getDirectionVector(lastPos, this.#position);

    if (DIR_VECTOR.magnitude !== 0) this.#lastDirection = DIR_VECTOR.normalize();
  }

  reset() {
    this.#position = Vector.Zero;
    this.#lastDirection = null;
    this.#instructions = [];

    return this;
  }

  #handleAxisUpdate(cmd, value) {
    const INSTRUCTIONS = this.#instructions;

    if (INSTRUCTIONS.length === 0) {
      INSTRUCTIONS.push(new PathCreator.PathCreatorData(cmd, [value]));
      return;
    }

    const LAST = INSTRUCTIONS[INSTRUCTIONS.length - 1];

    if (LAST.Command === cmd) {
      LAST.Parameters[0] += value;

      if (LAST.Parameters[0] === 0) INSTRUCTIONS.pop();
    } else INSTRUCTIONS.push(new PathCreator.PathCreatorData(cmd, [value]));
  }

  #handleStaticVectorUpdate(cmd, x, y) {
    const INSTRUCTIONS = this.#instructions;

    if (INSTRUCTIONS.length === 0) {
      INSTRUCTIONS.push(new PathCreator.PathCreatorData(cmd, [x, y]));
      return;
    }

    const LAST = INSTRUCTIONS[INSTRUCTIONS.length - 1];

    if (LAST.Command === cmd) {
      LAST.Parameters[0] = x;
      LAST.Parameters[1] = y;
    } else INSTRUCTIONS.push(new PathCreator.PathCreatorData(cmd, [x, y]));
  }

  moveTo(x, y) {
    this.#handleStaticVectorUpdate('moveTo', x, y);
    return this;
  }

  offset(x, y) {
    if (x === 0 && y === 0) return this;

    const CMD = 'offset';
    const INSTRUCTIONS = this.#instructions;

    if (INSTRUCTIONS.length === 0) {
      INSTRUCTIONS.push(new PathCreator.PathCreatorData(CMD, [x, y]));
      return this;
    }

    const LAST = INSTRUCTIONS[INSTRUCTIONS.length - 1];

    if (LAST.Command === CMD) {
      LAST.Parameters[0] += x;
      LAST.Parameters[1] += y;
    } else INSTRUCTIONS.push(new PathCreator.PathCreatorData(CMD, [x, y]));

    return this;
  }

  setDirection(x, y) {
    this.#handleStaticVectorUpdate('setDirection', x, y);
    return this;
  }

  drawLocalX(value) {
    this.#handleAxisUpdate('drawLocalX', value);
    return this;
  }

  drawLocalY(value) {
    this.#handleAxisUpdate('drawLocalY', value);
    return this;
  }

  drawGlobalX(value) {
    this.#handleAxisUpdate('drawGlobalX', value);
    return this;
  }

  drawGlobalY(value) {
    this.#handleAxisUpdate('drawGlobalY', value);
    return this;
  }

  drawLine(x, y) {
    const CMD = 'drawLine';
    const INSTRUCTIONS = this.#instructions;

    if (INSTRUCTIONS.length === 0) {
      INSTRUCTIONS.push(new PathCreator.PathCreatorData(CMD, [x, y]));

      return this;
    }

    const LAST = INSTRUCTIONS[INSTRUCTIONS.length - 1];

    if (LAST.Command === CMD) {
      const VEC_OLD = new Vector(LAST.Parameters[0], LAST.Parameters[1]).normalize();
      const VEC_NEW = new Vector(x, y).normalize();

      if (VEC_OLD.equals(VEC_NEW) || VEC_OLD.equals(VEC_NEW.inverse())) {
        INSTRUCTIONS.Parameters[0] += x;
        INSTRUCTIONS.Parameters[1] += y;
      }
    } else INSTRUCTIONS.push(new PathCreator.PathCreatorData(CMD, [x, y]));

    return this;
  }

  drawRadialCurve(radius, angle) {
    if (angle === 0) return this;

    const CMD = 'drawRadialCurve';
    const INSTRUCTIONS = this.#instructions;

    if (INSTRUCTIONS.length === 0) {
      INSTRUCTIONS.push(new PathCreator.PathCreatorData(CMD, [radius, angle]));

      return this;
    }

    const LAST = INSTRUCTIONS[INSTRUCTIONS.length - 1];

    if (LAST.Command === CMD && LAST.Parameters[0] === radius) {
      LAST.Parameters[1] += angle;

      if (LAST.Parameters[1] === 0) INSTRUCTIONS.pop();
    } else INSTRUCTIONS.push(new PathCreator.PathCreatorData(CMD, [radius, angle]));

    return this;
  }

  complete() {
    this.#instructions.push(new PathCreator.PathCreatorData('complete', []));
    return this;
  }

  appendInstructions(data) {
    data.forEach((command) => {
      this.#instructions.push(command);
    });

    return this;
  }

  appendPath(pathCreator) {
    const INSTRUCTIONS = pathCreator.Instructions;
    const IDX = INSTRUCTIONS[0].Command === 'setDirection' ? 1 : 0;

    for (let i = IDX; i < INSTRUCTIONS.length; i++) {
      this[`${INSTRUCTIONS[i].Command}`](...INSTRUCTIONS[i].Parameters);
    }

    return this;
  }

  finalisePath() {
    return this.finalisePathWithOffset(0, 0);
  }

  finalisePathWithOffset(x, y) {
    this.#position = new Vector(x, y);

    return this.#instructions
      .map((instruction) => {
        const LAST_POS = this.#position;

        let pathSegment = '';

        switch (instruction.Command) {
          case 'moveTo': {
            this.#position = new Vector(instruction.Parameters[0], instruction.Parameters[1]);
            this.#lastDirection = null;

            pathSegment = `M${this.#position.toPathString()}`;

            break;
          }

          case 'offset': {
            this.#position = Vector.add(
              new Vector(instruction.Parameters[0], instruction.Parameters[1]),
              this.#position
            );
            this.#lastDirection = null;

            pathSegment = `M${this.#position.toPathString()}`;

            break;
          }

          case 'setDirection': {
            this.#lastDirection = new Vector(instruction.Parameters[0], instruction.Parameters[1]).normalize();

            break;
          }

          case 'drawLocalY': {
            this.#position = Vector.add(
              Vector.multiply(this.#lastDirection, instruction.Parameters[0]),
              this.#position
            );

            pathSegment = `L${this.#position.toPathString()}`;

            break;
          }

          case 'drawLocalX': {
            this.#position = Vector.add(
              Vector.multiply(this.#lastDirection.right, instruction.Parameters[0]),
              this.#position
            );

            pathSegment = `L${this.#position.toPathString()}`;

            break;
          }

          case 'drawGlobalY': {
            this.#position = Vector.add(Vector.multiply(Vector.Down, instruction.Parameters[0]), this.#position);

            pathSegment = `L${this.#position.toPathString()}`;

            break;
          }

          case 'drawGlobalX': {
            this.#position = Vector.add(Vector.multiply(Vector.Right, instruction.Parameters[0]), this.#position);

            pathSegment = `L${this.#position.toPathString()}`;

            break;
          }

          case 'drawLine': {
            this.#position = Vector.add(
              new Vector(instruction.Parameters[0], instruction.Parameters[1]),
              this.#position
            );

            pathSegment = `L${this.#position.toPathString()}`;

            break;
          }

          case 'drawRadialCurve': {
            const ANGLE = instruction.Parameters[1] % 360;

            if (this.#lastDirection == null) this.#lastDirection = ANGLE > 0 ? Vector.Right : Vector.Left;

            const LOCAL_ORIGIN = Vector.add(
              this.#position,
              Vector.multiply(this.#lastDirection, instruction.Parameters[0])
            );

            const THETA = this.#degToRad(-ANGLE);
            const COS = Math.cos(THETA);
            const SIN = Math.sin(THETA);

            const LOCAL_POS = Vector.multiply(this.#lastDirection.inverse, instruction.Parameters[0]);

            const ROT_LOCAL_POS = new Vector(
              LOCAL_POS.x * COS - LOCAL_POS.y * SIN,
              LOCAL_POS.x * SIN + LOCAL_POS.y * COS
            );

            this.#position = Vector.add(LOCAL_ORIGIN, ROT_LOCAL_POS);

            pathSegment = `Q${LOCAL_ORIGIN.toPathString()} ${this.#position.toPathString()}`;

            break;
          }

          case 'complete': {
            return 'Z';
          }

          default:
        }

        this.#cacheDirection(LAST_POS);

        return pathSegment;
      })
      .filter((entry) => entry !== '')
      .join(' ');
  }
}
