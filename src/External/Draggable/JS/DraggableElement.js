class DraggableElement extends EventTarget{
  #protObj = null;
  #allowPassThroughEvents = false;

  get RootElement() { return this.#protObj.get("rootElement"); }
  get BaseVisualElement() { return this.#protObj.get("baseVisualElement"); }
  get DraggableArea() { return this.#protObj.get("draggableArea"); }
  get BoundingRect() { return this.#protObj.get("rect"); }
  get AllowPassThroughEvents() { return this.#allowPassThroughEvents; }

  constructor(rect, rootElement, options, prot = {}) {
    super();

    this.#allowPassThroughEvents = options.allowPassThroughEvents || false;
    
    this.#protObj = ClassExtension.enforceProtectedObject(new.target, DraggableElement, prot)
                      .set("rect", rect)
                      .set("rootElement", rootElement)
                      .set("baseVisualElement", options.baseVisualElement || rootElement)
                      .set("offset", Vector.Zero)
                      .set("isDragging", null)
                      .set("draggableArea", null)
                      .set("setupEvents", (it) => this.#setupEvents(it))
                      .set("updatePosition", (it, pos) => this.updatePosition(pos))
                      .set("calculateOffset", (it, pos) => this.#calculateOffset(pos))
                      .set("determineMouseDown", (it, evt) => this.#determineMouseDown(evt))
                      .set("determineMouseUp", (it, evt) => this.#determineMouseUp(evt))
                      .set("startDrag", (it, evt) => this.#startDrag(evt))
                      .set("drag", (it, evt) => this.#drag(evt))
                      .set("endDrag", (it, evt) => this.#endDrag(evt));

    this.#protObj.get("rootElement").setAttributeNS(null, "transform", `translate(0, 0)`);
    this.#protObj.set("transform", this.#protObj.get("rootElement").transform.baseVal.getItem(0));
  }

  #setupEvents(it) {
    const ROOT_ELEMENT = this.#protObj.get("rootElement");
    const PROT_GET = this.#protObj.get;

    ROOT_ELEMENT.addEventListener('mousedown', event => PROT_GET("determineMouseDown").next(event));
    ROOT_ELEMENT.addEventListener('onDrag', event => PROT_GET("drag").next(event.detail));
    ROOT_ELEMENT.addEventListener('onDragEnd', event => PROT_GET("endDrag").next(event.detail));
    ROOT_ELEMENT.addEventListener('mouseup', event => PROT_GET("determineMouseUp").next(event));
  }

  #determineMouseDown(evt) {
    evt.preventDefault();

    switch(evt.which) {
      case 1:
        this.#protObj.get("startDrag").next(evt);
        return;
    }
  }

  #determineMouseUp(evt) {
    evt.preventDefault();

    switch(evt.which) {
      case 1:
        this.#protObj.get("endDrag").next(evt);
        return;
    }
  }

  #calculateOffset(pos) {
    const DRAG_AREA = this.#protObj.get("draggableArea");

    this.#protObj.set("offset",
                          DRAG_AREA.calculateOffset(DRAG_AREA.screenToSVG(pos),
                                                    this.#protObj.get("transform")));
  }

  #startDrag(evt) {
    const POS = new Vector(evt.clientX, evt.clientY);

    this.#protObj.get("calculateOffset").next(POS);
    this.#protObj.set("isDragging", true);
    
    this.#protObj.get("draggableArea").setTarget(this);
  }

  #calculatePosition(pos) {
    const PROT_GET = this.#protObj.get;

    const CO_ORDS = PROT_GET("draggableArea").screenToSVG(pos);
    const NEW_POS = Vector.subtract(CO_ORDS, PROT_GET("offset"));

    this.#protObj.get("updatePosition").next(NEW_POS);

    return NEW_POS;
  }

  updatePosition(pos) {
    const PROT_GET = this.#protObj.get;
    PROT_GET("transform").setTranslate(pos.x, pos.y);
    PROT_GET("rect").setPosition(pos);
  }

  #drag(evt) {
    if (!this.#protObj.get("isDragging")) {
      return null;
    }

    evt.preventDefault();
    
    let newPos = this.#calculatePosition(new Vector(evt.clientX, evt.clientY));

    return newPos;
  }

  #endDrag(evt) {
    evt.preventDefault();

    this.#protObj.set("isDragging", false);
    this.#protObj.get("draggableArea").setTarget(null);
  }
}