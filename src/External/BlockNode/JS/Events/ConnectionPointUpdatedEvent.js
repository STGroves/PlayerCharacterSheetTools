import ConnectionPoint from '../Nodes/ConnectionPoint.js';

export default class ConnectionPointUpdatedEvent extends Event {
  static get UpdateType() {
    return {
      NODE_ADDED: 0,
      NODE_REMOVED: 1,
      LAYOUT_CHANGE: -1,
    };
  }

  rootConnectionPoint = null;
  sourceConnectionPoint = null;
  updateType = null;
  targetNode = null;

  /**
   * @constructor
   * @param {{
   * rootConnectionPoint: ConnectionPoint,
   * sourceConnectionPoint: ?ConnectionPoint,
   * updateType: ConnectionPointUpdatedEvent.UpdateType,
   * targetNode: BlockNode
   * }} options
   */
  constructor(options) {
    super(ConnectionPoint.CONNECTIONPOINT_UPDATED);

    this.rootConnectionPoint = options.rootConnectionPoint;
    this.sourceConnectionPoint = options.sourceConnectionPoint || options.rootConnectionPoint;
    this.updateType = options.updateType;

    if (this.updateType != null && this.updateType !== ConnectionPointUpdatedEvent.UpdateType.LAYOUT_CHANGE)
      this.targetNode = options.targetNode || null;
  }
}
