class PassThroughEvent extends MouseEvent {
  hoveringTarget = null;

  /**
   * @constructor
   * @param {string} type 
   * @param {object} options
   */
  constructor(type, options) {
    super(type, options);
    this.hoveringTarget = options.hoveringTarget;
  }
}