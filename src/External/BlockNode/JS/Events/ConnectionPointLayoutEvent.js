export default class ConnectionPointLayoutEvent extends Event {
  height = 0;
  offset = 0;

  static get UPDATE_CONNECTIONPOINT_LAYOUT() {
    return 'updateConnectionPointLayout';
  }

  /**
   * @constructor
   * @param {{
   * height: number,
   * offset: number,
   * rootConnectionPoint: ConnectionPoint,
   * sourceConnectionPoint: ConnectionPoint | null,
   * targetNode: BlockNode
   * }} options
   */
  constructor(options) {
    super(ConnectionPointLayoutEvent.UPDATE_CONNECTIONPOINT_LAYOUT);

    this.height = options.height;
    this.offset = options.offset;
    this.rootConnectionPoint = options.rootConnectionPoint;
    this.sourceConnectionPoint = options.sourceConnectionPoint || options.rootConnectionPoint;
    this.targetNode = options.targetNode;
  }
}
