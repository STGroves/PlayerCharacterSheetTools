import Vector from '../Vector.js';
import PathCreatorData from './PathCreatorData.js';

export default class PathCreator {
  #position = null;
  #lastDirection = null;
  #instructions = [];

  /**
   * @constructor
   * @param {Vector} position
   * @param {Vector} direction
   */
  constructor(position = Vector.Zero, direction = Vector.Right) {
    this.reset();

    if (!(position instanceof Vector) || !(direction instanceof Vector))
      throw new Error('Constructor parameters must be of type Vector');

    if (!Object.is(position, Vector.Zero)) this.offset(position);
    this.setDirection(direction);
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
    this.#lastDirection = Vector.Right;
    this.#instructions = [];

    return this;
  }

  #handleAxisUpdate(cmd, value) {
    const INSTRUCTIONS = this.#instructions;

    if (INSTRUCTIONS.length === 0) {
      INSTRUCTIONS.push(new PathCreatorData(cmd, [value]));
      return;
    }

    const LAST = INSTRUCTIONS[INSTRUCTIONS.length - 1];

    if (LAST.Command === cmd) {
      LAST.Parameters[0] += value;

      if (LAST.Parameters[0] === 0) INSTRUCTIONS.pop();
    } else INSTRUCTIONS.push(new PathCreatorData(cmd, [value]));
  }

  #handleStaticVectorUpdate(cmd, vector) {
    const INSTRUCTIONS = this.#instructions;

    if (INSTRUCTIONS.length === 0) {
      INSTRUCTIONS.push(new PathCreatorData(cmd, [vector]));
      return;
    }

    const LAST = INSTRUCTIONS[INSTRUCTIONS.length - 1];

    if (LAST.Command === cmd) {
      LAST.Parameters[0] = vector;
    } else INSTRUCTIONS.push(new PathCreatorData(cmd, [vector]));
  }

  moveTo(vector) {
    this.#handleStaticVectorUpdate('moveTo', vector);
    return this;
  }

  offset(vector) {
    const CMD = 'offset';
    const INSTRUCTIONS = this.#instructions;

    if (INSTRUCTIONS.length === 0) {
      INSTRUCTIONS.push(new PathCreatorData(CMD, [vector]));
      return this;
    }

    const LAST = INSTRUCTIONS[INSTRUCTIONS.length - 1];

    if (LAST.Command === CMD) {
      LAST.Parameters[0] = Vector.add(LAST.Parameters[0], vector);
    } else INSTRUCTIONS.push(new PathCreatorData(CMD, [vector]));

    return this;
  }

  setDirection(vector) {
    this.#handleStaticVectorUpdate('setDirection', vector);
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

  drawLine(vector) {
    const CMD = 'drawLine';
    const INSTRUCTIONS = this.#instructions;

    if (INSTRUCTIONS.length === 0) {
      INSTRUCTIONS.push(new PathCreatorData(CMD, [vector]));

      return this;
    }

    const LAST = INSTRUCTIONS[INSTRUCTIONS.length - 1];

    if (LAST.Command === CMD) {
      const VEC_OLD = LAST.Parameters[0].normalize();
      const VEC_NEW = vector.normalize();

      if (VEC_OLD.equals(VEC_NEW) || VEC_OLD.equals(VEC_NEW.inverse())) {
        LAST.Parameters[0] = Vector.add(LAST.Parameters[0], vector);
      }
    } else INSTRUCTIONS.push(new PathCreatorData(CMD, [vector]));

    return this;
  }

  drawRadialCurve(radius, angle) {
    if (angle === 0) return this;

    const CMD = 'drawRadialCurve';
    const INSTRUCTIONS = this.#instructions;

    if (INSTRUCTIONS.length === 0) {
      INSTRUCTIONS.push(new PathCreatorData(CMD, [radius, angle]));

      return this;
    }

    const LAST = INSTRUCTIONS[INSTRUCTIONS.length - 1];

    if (LAST.Command === CMD && LAST.Parameters[0] === radius) {
      LAST.Parameters[1] += angle;

      if (LAST.Parameters[1] === 0) INSTRUCTIONS.pop();
    } else INSTRUCTIONS.push(new PathCreatorData(CMD, [radius, angle]));

    return this;
  }

  complete() {
    this.#instructions.push(new PathCreatorData('complete', []));
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
    return this.finalisePathWithOffset(Vector.Zero);
  }

  finalisePathWithOffset(vector) {
    this.#position = vector;

    return this.#instructions
      .map((instruction) => {
        const LAST_POS = this.#position;

        let pathSegment = '';

        switch (instruction.Command) {
          case 'moveTo': {
            [this.#position] = instruction.Parameters;
            this.#lastDirection = Vector.Right;

            pathSegment = `M${this.#position.toPathString()}`;

            break;
          }

          case 'offset': {
            this.#position = Vector.add(instruction.Parameters[0], this.#position);
            this.#lastDirection = Vector.Right;

            pathSegment = `M${this.#position.toPathString()}`;

            break;
          }

          case 'setDirection': {
            this.#lastDirection = instruction.Parameters[0].normalize();

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
            this.#position = Vector.add(instruction.Parameters[0], this.#position);

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

            const THETA = PathCreator.#degToRad(-ANGLE);
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
