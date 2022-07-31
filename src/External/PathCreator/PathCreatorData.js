export default class PathCreatorData {
  #cmd = '';
  #params = [];

  /**
   * @constructor
   * @param {string} command
   * @param {any[]} args
   */
  constructor(command, args) {
    this.#cmd = command;
    this.#params = args;
  }

  get Command() {
    return this.#cmd;
  }

  get Parameters() {
    return this.#params;
  }
}
