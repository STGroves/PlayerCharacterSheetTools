class BlockNode extends DraggableElement {
  static NODE_CREATED = "onNodeCreated";
  static NODE_ADDED = "onNodeAdded";
  static NODE_UPDATED = "onNodeUpdated";

  static get ToothType() {
    return {
      INSET: 1,
      OUTSET: -1
    };
  }

  static get NodeMode() {
    return {
      STANDARD: 0,
      INPUT: 1
    };
  }

  static get ValueTypes() {
    return {
      NULL: 1,
      TEXT: 2,
      NUMBER: 4,
      ARRAY: 8,
      ALL: 15
    };
  }

  #id = null;
  #parent = null;

  #connectionFlags = null;

  #protObj = null;

  get SVG() { return this.#protObj.get("rootElement"); }
  get ID() { return this.#id; }
  get Parent() { return this.#parent; }
  get Connection() { return this.#protObj.get("connections")[0]; }
  get ReturnType() { return this.#protObj.get("returnType"); }
  get Title() { return this.#protObj.get("title"); }
  get Style() { return this.#protObj.get("style"); }

  constructor(title, returnType, connectionTypes, prot = {}) {
    ClassExtension.enforceAbstractClass(new.target, BlockNode);

    let protObj = ClassExtension.enforceProtectedObject(new.target, BlockNode, prot);

    let svg = document.createElementNS(SVG_NS, 'g');

    super(new Rect(0,0,0,0),
          svg,
          {
            allowPassThroughEvents: true,
            manualPositionUpdate: false,
            baseVisualElement: svg.appendChild(document.createElementNS(SVG_NS, 'path'))
          },
          protObj);

    this.#protObj = protObj.set("returnType", returnType)
                            .set("title", title)
                            .set("draggableArea", CANVAS.DraggableArea)
                            .set("connections", [null])
                            .set("createStyle", () => this.#createStyle())
                            .set("createSVG", () => this.#createSVG())
                            .set("startDrag", (it, evt) => this.#startDrag(it, evt))
                            .set("setupEvents", (it) => this.#setupEvents(it))
                            .set("calculateHeight", () => this.#calculateHeight())
                            .set("calculatePathConstants", () => this.#calculatePathConstants())
                            .set("handleConnectionPointUpdate", (it, event) => this.#handleConnectionPointUpdate(event))
                            .set("handleConnectionPointLayoutChange",
                                (it, event) => this.#handleConnectionPointLayoutChange(event))
                            .set("determineMouseDown", (it, evt) => this.#determineMouseDown(it, evt))
                            .set("determineMouseUp", (it, evt) => this.#determineMouseUp(it, evt))
                            .set("drawNode", () => this.#drawNode())
                            .set("drawHeader", () => this.#drawHeader())
                            .set("drawMiddle", (it, nodeData) => this.#drawMiddle(nodeData))
                            .set("drawFooter", (it, nodeData) => this.#drawFooter(nodeData))
                            .set("calculateTeeth", (it,
                                                    pathObj,
                                                    offset,
                                                    width,
                                                    flags,
                                                    toothType) => this.#calculateTeeth(pathObj,
                                                                                      offset,
                                                                                      width,
                                                                                      flags,
                                                                                      toothType))
                            .set(BlockNode.NODE_CREATED, (it, evt) => this.#onNodeCreated(evt));
    
    this.#connectionFlags = connectionTypes;
    this.#mode = BlockNode.NodeMode.STANDARD;
    this.#id = promiseRun("getUUID");

    this.addEventListener(BlockNode.NODE_CREATED, event => this.#protObj.get(BlockNode.NODE_CREATED).next(event));
  }

  /***************************
    *          Setup          *
    ***************************/

  #createSVG() {
    const PROT_GET = this.#protObj.get;

    const NODE_GROUP = PROT_GET("rootElement");

    const OUTER_PATH = NODE_GROUP.firstChild;
    const INNER_PATH = document.createElementNS(SVG_NS, 'path');

    this.#id.then(result => {
      NODE_GROUP.setAttributeNS(null, "id", result);
    })

    const STYLE = PROT_GET("style");

    OUTER_PATH.classList.add(`node_Outer`);
    INNER_PATH.classList.add(`${STYLE.cssClass}_Inner`);

    NODE_GROUP.appendChild(INNER_PATH);

    const DRAG_GROUP = document.createElementNS(SVG_NS, 'g');

    const RADIUS = 2.5;
    const OFFSET = 7.5;

    for (let i = 0; i < 6; i++) {
      const X = STYLE.padding + RADIUS + (OFFSET * (i % 2));
      const Y = STYLE.padding + STYLE.toothDepth + RADIUS + (OFFSET * Math.floor(i / 2));

      const CIRCLE = document.createElementNS(SVG_NS, 'circle');
      
      CIRCLE.setAttribute('transform', `translate(${X},${Y})`);
      CIRCLE.setAttribute('r', RADIUS);
      
      CIRCLE.classList.add(`${STYLE.cssClass}_Darker`);

      DRAG_GROUP.appendChild(CIRCLE);
    }

    NODE_GROUP.appendChild(DRAG_GROUP);

    if (PROT_GET("title") != null) {
      const TEXT = document.createElementNS(SVG_NS, 'text');
      
      const TOP_OFFSET = STYLE.toothDepth + STYLE.padding;

      TEXT.setAttribute("x", STYLE.minWidth / 2);
      TEXT.setAttribute("y", ((STYLE.headerHeight - TOP_OFFSET) / 2) + TOP_OFFSET);
      TEXT.setAttributeNS(null, "alignment-baseline", "middle");
      TEXT.setAttribute("text-anchor", "middle");
      
      TEXT.classList.add(`node_Text`);

      NODE_GROUP.appendChild(TEXT);
    }
  }

  #createStyle() {
    this.#protObj.set("style", {
      borderSize: 1,
      cornerRadius: 5,
      
      cssClass: "ROOT",
      
      headerHeight: 35,
      footerHeight: 20,
      minWidth: 150,
      leftOffset: 22.5,
      
      padding: 5,
      
      toothDepth: 5,
      toothWidth: 10
    });
  }

  #createConnectionZone() {
    if (this.#connectionFlags == null)
      return;
    
    const DEFAULT_HEIGHT = 10;

    const INPUT_RECT = new Rect(0, -(DEFAULT_HEIGHT / 2), this.#protObj.get("style").minWidth, DEFAULT_HEIGHT);

    this.#protObj.set("connections", [new ConnectionPoint({
        mainID: this.#id,
        postfix: "#CONNECTION"
      },
      INPUT_RECT,
      this.#connectionFlags,
      this,
      ConnectionPoint.ConnectorTypes.OUTPUT)]);
  }

  #setupEvents(it) {
    it.next();

    this.#protObj.get("rootElement").addEventListener("contextmenu", event => event.preventDefault());
    this.addEventListener(BlockNode.NODE_ADDED, event => this.#onNodeAdded(event));
    this.addEventListener(BlockNode.NODE_UPDATED, event => this.#onNodeUpdated(event));
    this.addEventListener(ConnectionPoint.CONNECTIONPOINT_UPDATED,
                          event => this.#protObj.get("handleConnectionPointUpdate").next(event))
    this.addEventListener(ConnectionPoint.UPDATE_CONNECTIONPOINT_LAYOUT,
                          event => this.#protObj.get("handleConnectionPointLayoutChange").next(event))
  }

  /****************************
    *          Events          *
    ****************************/
  #handleConnectionPointLayoutChange(evt) {
    if (this == evt.rootConnectionPoint.Owner)
      evt.offset = evt.height - evt.rootConnectionPoint.Rect.Height;
    else
      evt.height = evt.sourceConnectionPoint.Node.getTotalHeight();

    evt.sourceConnectionPoint.dispatchEvent(new ConnectionPointLayoutEvent(evt));
    
    if (evt.sourceConnectionPoint.Node != null)
      evt.sourceConnectionPoint.Node.updatePosition(Vector.add(new Vector(evt.sourceConnectionPoint.Rect.Left,
                                                          evt.sourceConnectionPoint.Rect.Bottom),
                                                Vector.multiply(Vector.Up, evt.sourceConnectionPoint.Node.BoundingRect.Height)));
  }

  findConnection(node) {
    const CONNECTIONS = this.#protObj.get("connections");

    for (let i = 0; i < CONNECTIONS.length; i++) {
      if (CONNECTIONS[i] == null)
        continue;

      if (CONNECTIONS[i].Node == node)
        return CONNECTIONS[i];
    }

    return null;
  }

  #handleConnectionPointUpdate(evt) {
    if (evt.updateType == ConnectionPointUpdatedEvent.UpdateType.NODE_ADDED) {
      evt.targetNode.updatePosition(Vector.add(new Vector(evt.rootConnectionPoint.Rect.Left,
                                                          evt.rootConnectionPoint.Rect.Bottom),
                                                Vector.multiply(Vector.Up, evt.targetNode.BoundingRect.Height)));
    }
  }

  #onNodeCreated(event) {
    const PROT_GET = this.#protObj.get;
    
    PROT_GET("createStyle").next();
    PROT_GET("createSVG").next();

    this.#createConnectionZone();

    PROT_GET("setupEvents").next();
  }

  #onNodeAdded(evt) {
    const PROT_GET = this.#protObj.get;
    const SVG = PROT_GET("rootElement");

    let details = {
      position: evt.detail,
      dimensions: new Vector(PROT_GET("style").minWidth, PROT_GET("calculateHeight").next().value),
      recalculateConstants: true,
      redrawNode: true
    };

    this.dispatchEvent(new CustomEvent(BlockNode.NODE_UPDATED, { detail: details }));
    
    this.#protObj.set("transform", SVG.transform.baseVal.getItem(0));
  }

  #onNodeUpdated(evt) {
    const PROT_GET = this.#protObj.get;

    if (evt.detail.position != null)
      PROT_GET("updatePosition").next(evt.detail.position);

    if (evt.detail.dimensions != null)
      PROT_GET("rect").setDimensions(evt.detail.dimensions);

    if (evt.detail.recalculateOffset)
      PROT_GET("calculateOffset").next(evt.detail.cursorPos);

    if (evt.detail.recalculateConstants)
      PROT_GET("calculatePathConstants").next();

    if (evt.detail.redrawNode)
      PROT_GET("drawNode").next();
  }

  /***************************************
    *          Draggable Element          *
    ***************************************/

  #determineMouseDown(it, evt) {
    const TRANSPARENT = "data-transparentElement";

    if (CANVAS.ContextMenu.Open)
      CANVAS.ContextMenu.close();

    if ((evt.target.hasAttribute(TRANSPARENT) ? evt.srcElement.getAttribute(TRANSPARENT) : false)) {
      return;
    }

    if (!findTypeInParents(evt.target, "foreignObject", this.#protObj.get("rootElement"))) {
      it.next(evt);
      
      return;
    }

    evt.stopPropagation();
  }

  #determineMouseUp(it, evt) {
    if (!findTypeInParents(evt.srcElement, "foreignObject", this.#protObj.get("rootElement"))) {
      it.next(evt);        
      
      return;
    }

    evt.stopPropagation();
  }

  getTotalHeight() {
    const PROT_GET = this.#protObj.get;
    const HEIGHT = PROT_GET("rect").Height;
    const CONNECTION = PROT_GET("connections")[0];

    if (CONNECTION != null) {
      if (CONNECTION.Node != null) {
        return HEIGHT + CONNECTION.Node.getTotalHeight()
      }
      if (CONNECTION.Accepted) {
        return HEIGHT + CONNECTION.Rect.Height;
      }
    }

    return HEIGHT;
  }

  #calculateHeight() {
    ClassExtension.enforceAbstractMethod("#calculateHeight", "BlockNode");
  }

  #startDrag(it, evt) {
    if (this.#protObj.get("draggableArea").CurrentTarget != null)
      return;

    CANVAS.NodeBase.appendChild(this.#protObj.get("rootElement"));

    it.next(evt);
  }

  /**************************
    *          Node          *
    **************************/
  getGlobalPosition() {
    const PROT_GET = this.#protObj.get;

    return this.#parent == null ? PROT_GET("rect").Position :
                                  Vector.add(PROT_GET("rect").Position,
                                              this.#parent.getGlobalPosition());
  }

  setNodeMode(nodeMode) {
    this.#mode = nodeMode;
  }

  setParent(parent) {
    this.#parent = parent;

    if (parent == null) {
      CANVAS.NodeBase.appendChild(this.#protObj.get("rootElement"));
      return;
    }

    this.#parent.SVG.appendChild(this.#protObj.get("rootElement"));
  }

  /*******************************
    *          Draw Node          *
    *******************************/

  #drawNode() {
    const PROT_GET = this.#protObj.get;

    const NC2 = PROT_GET("style").cornerRadius * 2;
    const SVG = PROT_GET("rootElement");

    let outer;
    let inner;

    ({outer, inner} = this.#protObj.get("drawHeader").next().value);
    ({outer, inner} = this.#protObj.get("drawMiddle").next({outer: outer, inner: inner}).value);
    ({outer, inner} = this.#protObj.get("drawFooter").next({outer: outer, inner: inner}).value);

    const SVG_BASE = SVG.children;

    SVG_BASE[0].setAttributeNS(null, "d", outer.finalisePath());
    SVG_BASE[1].setAttributeNS(null, "d", inner.finalisePath());

    if (SVG_BASE.length > 3)
      SVG_BASE[3].innerHTML = PROT_GET("title");  
  }

  #drawHeader() {
    const PATH_CONSTANTS = this.#protObj.get("pathConstants");

    return {
      outer: new PathCreator().appendPath(PATH_CONSTANTS.header.outer),
      inner: new PathCreator().appendPath(PATH_CONSTANTS.header.inner)
    };
  }

  #drawMiddle(nodeData) {
    ClassExtension.enforceAbstractMethod("#drawMiddle", "BlockNode");
  }

  #drawFooter(nodeData) {
    const PATH_CONSTANTS = this.#protObj.get("pathConstants");

    return {
      outer: nodeData.outer.appendPath(PATH_CONSTANTS.footer.outer)
                            .complete(),
      inner: nodeData.inner.appendPath(PATH_CONSTANTS.footer.inner)
                            .complete()
    };
  }

  /************************************
    *          Calculate Node          *
    ************************************/

  #calculatePathConstants() {
    const STYLE = this.#protObj.get("style");

    this.#protObj.set("pathConstants", {
      header: {
        outer: this.#calculateHeader(new PathCreator(new Vector(0,
                                                                STYLE.cornerRadius),
                                                      Vector.Up),
                                      0),
        inner: this.#calculateHeader(new PathCreator(new Vector(STYLE.borderSize,
                                                                STYLE.cornerRadius),
                                                      Vector.Up),
                                      STYLE.borderSize)
      },
      footer: {
        outer: this.#calculateFooter(new PathCreator(Vector.Zero, Vector.Down), 0),
        inner: this.#calculateFooter(new PathCreator(Vector.Zero, Vector.Down), STYLE.borderSize)
      }
    });
  }

  #calculateHeader(pathObj, offset) {
    const PROT_GET = this.#protObj.get;
    const STYLE = PROT_GET("style");

    const NC = STYLE.cornerRadius;
    const NC2 = NC * 2;

    PROT_GET("calculateTeeth").next(pathObj.drawRadialCurve(NC - offset, 90),
                                    offset,
                                    PROT_GET("rect").Width,
                                    PROT_GET("connections")[0] == null ? null :
                                                                          PROT_GET("connections")[0].AcceptableConnections,
                                    BlockNode.ToothType.INSET).value;

    return pathObj.drawRadialCurve(NC - offset, 90)
                  .drawGlobalY(STYLE.headerHeight - NC2);
  }

  #calculateFooter(pathObj, offset) {
    const PROT_GET = this.#protObj.get;
    const STYLE = PROT_GET("style");

    const NC = STYLE.cornerRadius; //Node Curve

    PROT_GET("calculateTeeth").next(pathObj.drawGlobalY(STYLE.footerHeight - (NC * 2))
                                            .drawRadialCurve(NC - offset, 90),
                                    offset,
                                    PROT_GET("rect").Width,
                                    PROT_GET("returnType"),
                                    BlockNode.ToothType.OUTSET).value;
                        
    return pathObj.drawRadialCurve(NC - offset, 90)
  }

  #calculateTeeth(pathObj, offset, width, flags, toothType) {
    const STYLE = this.#protObj.get("style");

    const NC = STYLE.cornerRadius; //Node Curve
    const NC2 = NC * 2;

    if (flags == null)
      return pathObj.drawGlobalX((width - NC2) * toothType);

    let commandArray = this.#findTeethPath(flags);

    let total = 0;
    const GAP = 10;
    let drawCommands = [];

    const INITIAL_GAP = GAP - (offset * toothType);
    const INNER_TOOTH = STYLE.toothWidth + (offset * 2 * toothType);
    const INNER_GAP = INITIAL_GAP - (offset * toothType);

    if (commandArray[0].type == "tooth") {
      drawCommands.push(new PathCreatorData("drawGlobalX", [INITIAL_GAP * toothType])); 
      total += INITIAL_GAP;
    }

    for (let i = 0; i < commandArray.length - 1; i++) {
      switch (commandArray[i].type) {
        case "tooth":
          for (let j = 0; j < commandArray[i].count; j++) {
            drawCommands.push(new PathCreatorData("drawGlobalY", [STYLE.toothDepth * toothType]));
            drawCommands.push(new PathCreatorData("drawGlobalX", [INNER_TOOTH * toothType]));
            drawCommands.push(new PathCreatorData("drawGlobalY", [-(STYLE.toothDepth * toothType)]));
            
            total += INNER_TOOTH;

            if (j < commandArray[i].count - 1) {
              drawCommands.push(new PathCreatorData("drawGlobalX", [INNER_GAP * toothType]));
              total += INNER_GAP;
            }
          }
          break;

        case "flat":
          const HOR_VALUE = (GAP + ((GAP + STYLE.toothWidth) * commandArray[i].count)) -
                          (((offset * toothType) + (i == 0 ? 0 : (offset * toothType)) * toothType));
          drawCommands.push(new PathCreatorData("drawGlobalX", [HOR_VALUE * toothType]));
          total += HOR_VALUE;
          break;
      }
    }

    const LAST_ELEMENT = commandArray[commandArray.length - 1];

    switch (LAST_ELEMENT.type) {
      case "tooth":
        for (let j = 0; j < LAST_ELEMENT.count; j++) {
          drawCommands.push(new PathCreatorData("drawGlobalY", [STYLE.toothDepth * toothType]));
          drawCommands.push(new PathCreatorData("drawGlobalX", [INNER_TOOTH * toothType]));
          drawCommands.push(new PathCreatorData("drawGlobalY", [-(STYLE.toothDepth * toothType)]));
          
          total += INNER_TOOTH;

          if (j < LAST_ELEMENT.count - 1) {
            drawCommands.push(new PathCreatorData("drawGlobalX", [INNER_GAP * toothType]));
            total += INNER_GAP;
          }
        }

      case "flat":
        drawCommands.push(new PathCreatorData("drawGlobalX", [(width - NC2 - total) * toothType]));
        break;
    }
    
    if (toothType == BlockNode.ToothType.OUTSET)
      drawCommands.reverse();

    return pathObj.appendInstructions(drawCommands);
  }

  #findTeethPath(flags) {
    let commandArray = [];
    const KEYS = Object.keys(BlockNode.ValueTypes)
                        .sort((a, b) => BlockNode.ValueTypes[a] - BlockNode.ValueTypes[b]);

    if (flags & BlockNode.ValueTypes.NULL) {
      commandArray.push({type: "tooth", count: 1});
    } else {
      commandArray.push({type: "flat", count: 1});
    }

    for (let i = 1; i < KEYS.length - 1; i++) {
      if (flags & BlockNode.ValueTypes[KEYS[i]]) {
        const ELEMENT = commandArray[commandArray.length - 1]; 
        
        if (ELEMENT.type == "tooth")
          ELEMENT.count++;
        else
          commandArray.push({type: "tooth", count: 1});
      } else {
        const ELEMENT = commandArray[commandArray.length - 1]; 
        
        if (ELEMENT.type == "flat")
          ELEMENT.count++;
        else
          commandArray.push({type: "flat", count: 1});
      }
    }

    return commandArray;
  }
}