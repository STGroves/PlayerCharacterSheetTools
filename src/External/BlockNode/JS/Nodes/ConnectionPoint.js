class ConnectionPoint extends EventTarget {
  static UPDATE_CONNECTIONPOINT_LAYOUT = "updateConnectionPointLayout";
  static CONNECTIONPOINT_UPDATED = "connectionPointUpdated";

  static get ConnectorTypes() {
    return {
      OUTPUT: -1,
      INPUT: 1
    };
  }

  #node = null;
  #parentNode = null;
  #acceptableConnections = null;
  #connectorType = false;
  
  #acceptableHoveringNode = false;
  #rect = null;

  #defaultHeight = 0;

  #id = null;
  #svg = null;
  #visual = null;
  #area = null;

  constructor(id, rect, acceptableConnections, parent, type) {
    super();

    try {
      this.#rect = rect;
      this.#parentNode = parent;
      this.#defaultHeight = rect.Height;
      this.#acceptableConnections = acceptableConnections;
      this.#connectorType = type;

      id.mainID.then(result => {
        this.#id = `${result}${id.postfix}`;
        this.#svg.setAttributeNS(null, "id", this.#id);
      });

      this.addEventListener(ConnectionPoint.UPDATE_CONNECTIONPOINT_LAYOUT,
                            event => this.#updateRectHeight(event.height < 0 ? this.#defaultHeight : event.height));
      this.#createSVG();
    } catch(e) {
      console.log(e);
    }
  }

  get ID() { return this.#id; }
  get Owner() { return this.#parentNode; }
  get ConnectionType() { return this.#connectorType; }
  get Rect() { return this.#rect; }
  get AcceptableConnections() { return this.#acceptableConnections; }
  get Accepted() { return this.#acceptableHoveringNode; }
  get Node() { return this.#node; }
  get SVG() { return this.#svg; }

  #createSVG() {
    this.#svg = document.createElementNS(SVG_NS, 'g');

    this.#area = document.createElementNS(SVG_NS, 'rect');
    this.#area.setAttributeNS(null, "x", this.#rect.X);
    this.#area.setAttributeNS(null, "y", this.#rect.Y);
    this.#area.setAttributeNS(null, "width", this.#rect.Width);
    this.#area.setAttributeNS(null, "height", this.#rect.Height);
    this.#area.setAttribute("data-transparentElement", true);
    this.#area.setAttributeNS(null, "fill", "red");
    this.#area.setAttributeNS(null, "fill-opacity", 0);

    this.#visual = document.createElementNS(SVG_NS, 'rect');
    this.#visual.setAttributeNS(null, "x", this.#rect.X);
    this.#visual.setAttributeNS(null, "y", this.#rect.Y);
    this.#visual.setAttributeNS(null, "width", this.#rect.Width);
    this.#visual.setAttributeNS(null, "height", 0);
    this.#visual.setAttributeNS(null, "fill", "rgba(235, 210, 52)");
    this.#visual.setAttributeNS(null, "fill-opacity", 0);
    this.#visual.style.pointerEvents = "none";

    this.#svg.appendChild(this.#area);
    this.#svg.appendChild(this.#visual);

    this.#area.addEventListener("pt-mouseenter", event => this.#checkPotentialConnection(event));
    this.#area.addEventListener("pt-mouseleave", event => this.#resetPotentialConnection(event));
    this.#area.addEventListener("pt-mousedown", event => this.#removeNode(event));
    this.#area.addEventListener("pt-mouseup", event => this.#addNode(event));

    this.#area.addEventListener("mousedown",
                                event => document.elementsFromPoint(event.clientX, event.clientY)[1]
                                                .dispatchEvent(new MouseEvent("mousedown", event)));

    this.#parentNode.SVG.appendChild(this.#svg);
  }

  static #isNodeAcceptable(connectionPoint, node, acceptableConnections) {
    const nodeOK = acceptableConnections & node.ReturnType;

    switch(connectionPoint.ConnectionType) {
      case ConnectionPoint.ConnectorTypes.OUTPUT:
        return nodeOK;
      
      case ConnectionPoint.ConnectorTypes.INPUT:
        const connectionNode = node.Connection == null ? null : node.Connection.Node;
        const nodeConnectionOK = connectionNode == null ? true :
                                                          ConnectionPoint.#isNodeAcceptable(node.Connection,
                                                                                            connectionNode,
                                                                                            acceptableConnections);
        return nodeOK && nodeConnectionOK;
    }
  }

  updatePosition(height) {
    const RECT = this.#rect;

    RECT.setPosition(new Vector(RECT.X, RECT.Y + height));
    this.#area.setAttributeNS(null, "y", RECT.Y);
    this.#visual.setAttributeNS(null, "y", RECT.Y);
    
    if (this.#node != null)
      this.#node.updatePosition(Vector.add(new Vector(RECT.Left, RECT.Bottom),
                                            Vector.multiply(Vector.Up, this.#node.BoundingRect.Height)));
  }

  #updateRectHeight(height) {
    const RECT = this.#rect;

    RECT.setDimensions(new Vector(RECT.Width, height));

    if (this.#connectorType == ConnectionPoint.ConnectorTypes.OUTPUT) {
      if (height == this.#defaultHeight)
        height = 0;

      this.#area.setAttributeNS(null, "height", height + this.#defaultHeight);
      this.#visual.setAttributeNS(null, "height", height);
      
      RECT.setPosition(new Vector(RECT.X, -height));
      
      this.#area.setAttributeNS(null, "y", RECT.Y - (this.#defaultHeight / 2));
      this.#visual.setAttributeNS(null, "y", RECT.Y);
    }
    else {
      this.#area.setAttributeNS(null, "height", height);
      this.#visual.setAttributeNS(null, "height", height);
    }
  }

  #checkPotentialConnection(evt) {
    if (evt.hoveringTarget == null || this.#node != null)
      return;

    this.#acceptableHoveringNode = ConnectionPoint.#isNodeAcceptable(this, evt.hoveringTarget, this.#acceptableConnections);

    if (!this.#acceptableHoveringNode)
      return;
    
    this.#visual.setAttributeNS(null, "fill-opacity", 0.5);
    this.#visual.setAttributeNS(null, "rx", evt.hoveringTarget.Style.cornerRadius);

    this.#parentNode.dispatchEvent(new ConnectionPointLayoutEvent({
                                      rootConnectionPoint: this,
                                      height: evt.hoveringTarget.getTotalHeight(),
                                      targetNode: evt.hoveringTarget
                                    })); 
  }

  #resetPotentialConnection(evt) {
    if (evt.hoveringTarget == null || this.#node != null)
      return;

    const RECT = this.#rect;

    this.#acceptableHoveringNode = false;

    if (RECT.Height != this.#defaultHeight) {
      this.#parentNode.dispatchEvent(new ConnectionPointLayoutEvent({
                                        rootConnectionPoint: this,
                                        height: this.#defaultHeight,
                                        targetNode: evt.hoveringTarget
                                      }));
    }

    this.#visual.setAttributeNS(null, "fill-opacity", 0);

  }

  #addNode(evt) {
    if (!this.#acceptableHoveringNode)
      return;

    this.#node = evt.hoveringTarget;

    this.#node.setNodeMode(BlockNode.NodeMode.INPUT);
    this.#node.setParent(this.#parentNode);
    this.#visual.setAttributeNS(null, "fill-opacity", 0);

    this.#acceptableHoveringNode = false;

    this.#parentNode.dispatchEvent(new ConnectionPointUpdatedEvent({
                                      rootConnectionPoint: this,
                                      updateType: ConnectionPointUpdatedEvent.UpdateType.NODE_ADDED,
                                      targetNode: this.#node
                                    }));
  }

  #removeNode(evt) {
    this.#node = null;

    const POS = evt.hoveringTarget.getGlobalPosition();

    evt.hoveringTarget.setNodeMode(BlockNode.NodeMode.STANDARD);
    evt.hoveringTarget.setParent(null);

    this.#parentNode.dispatchEvent(new ConnectionPointUpdatedEvent({
                                      rootConnectionPoint: this,
                                      updateType: ConnectionPointUpdatedEvent.UpdateType.NODE_REMOVED,
                                      targetNode: evt.hoveringTarget
                                    }));

    if (document.elementsFromPoint(evt.clientX, evt.clientY).includes(this.#area)) {
      this.#checkPotentialConnection(evt);
    }

    evt.hoveringTarget.dispatchEvent(new CustomEvent(BlockNode.NODE_UPDATED, {
      detail: {
        position: POS,
        recalculateOffset: true,
        cursorPos: new Vector(evt.clientX, evt.clientY)
      }
    }));
  }
}