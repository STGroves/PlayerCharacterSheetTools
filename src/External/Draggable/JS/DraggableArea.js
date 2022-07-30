class DraggableArea {
  #selectedTarget = null;
  #lastTarget = null;
  #dragArea = null;
  #callback = null;
  #oldList = [];
  #currentList = [];
  #updating = false;

  get CurrentTarget() { return this.#selectedTarget; }

  constructor(svg, offsetCalculationCallback) {
    try {
      this.#dragArea = svg;
      this.#callback = offsetCalculationCallback;

      this.#setupEvents(svg);
    } catch(e) {
      console.log(e);
    }
  }

  getRect() {
    return this.#dragArea.getBoundingClientRect();
  }

  calculateOffset(position, transform) {
    return this.#callback(position, transform);
  }

  setTarget(target) {
    this.#lastTarget = this.#selectedTarget;
    this.#selectedTarget = target;
  }

  #setupEvents(svg) {
    svg.addEventListener('mousemove', (event) => {
      if (!this.#handlePassThroughEvent(event, this.#selectedTarget, (evt, target) => {
        this.#updatePassThroughList(evt, target.BaseVisualElement);
        this.#drag(evt);
        this.#oldList = this.#currentList;
      }))
      this.#oldList = [];
      this.#currentList = [];
    });

    svg.addEventListener("mousedown", (event) => {
      this.#handlePassThroughEvent(event, this.#selectedTarget, (evt, target) => this.#handleClick(evt, target, "pt-mousedown"));
    });

    svg.addEventListener("mouseup", (event) => {
      this.#handlePassThroughEvent(event,
                                    this.#selectedTarget || this.#lastTarget,
                                    (evt, target) => {
                                      this.#handleClick(evt, target, "pt-mouseup");

                                      if (target === this.#lastTarget)
                                        this.#lastTarget = null;
                                    });
    });

    svg.addEventListener('mouseleave', event => this.#determineExit(event));
  }

  #handleClick(evt, target, type) {
    if (this.#currentList.length == 0)
      this.#updatePassThroughList(evt, target.BaseVisualElement);

    const PASS_THROUGH_EVENT = new PassThroughEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: evt.detail,
        view: evt.view,
        sourceCapabilities: evt.sourceCapabilities,
        screenX: evt.screenX,
        screenY: evt.screenY,
        clientX: evt.clientX,
        clientY: evt.clientY,
        ctrlKey: evt.ctrlKey,
        altKey: evt.altKey,
        metaKey: evt.metaKey,
        button: evt.button,
        buttons: evt.buttons,
        hoveringTarget: target
      });

    this.#currentList[0].dispatchEvent(PASS_THROUGH_EVENT);
  }

  #handlePassThroughEvent(evt, target, callback) {
    if (this.#updating || target == null)
      return false;
        
    this.#updating = true;

    callback(evt, target);

    this.#updating = false;

    return true;
  }

  #isBehindOtherElement(element, getBaseElementsListCallback = document.elementsFromPoint) {
    const RECT = element.getBoundingClientRect()
    // adjust coordinates to get more accurate results
    const LEFT = RECT.left + 1
    const RIGHT = RECT.right - 1
    const TOP = RECT.top + 1
    const BOTTOM = RECT.bottom - 1

    const TOP_LEFT = getBaseElementsListCallback(LEFT, TOP)
                              .filter(x => x.hasAttribute("data-ignoreElement") ? !x.getAttribute("data-ignoreElement") :
                                                                                  true)
                              .filter(x => x === element ||
                                          (x.hasAttribute("data-transparentElement") ?
                                            !x.getAttribute("data-transparentElement") :
                                            true))[0];
    const TOP_RIGHT = getBaseElementsListCallback(RIGHT, TOP)
                              .filter(x => x.hasAttribute("data-ignoreElement") ? !x.getAttribute("data-ignoreElement") :
                                                                                  true)
                              .filter(x => x === element ||
                                          (x.hasAttribute("data-transparentElement") ?
                                            !x.getAttribute("data-transparentElement") :
                                            true))[0];
    const BOTTOM_LEFT = getBaseElementsListCallback(LEFT, BOTTOM)
                              .filter(x => x.hasAttribute("data-ignoreElement") ? !x.getAttribute("data-ignoreElement") :
                                                                                  true)
                              .filter(x => x === element ||
                                          (x.hasAttribute("data-transparentElement") ?
                                            !x.getAttribute("data-transparentElement") :
                                            true))[0];
    const BOTTOM_RIGHT = getBaseElementsListCallback(RIGHT, BOTTOM)
                              .filter(x => x.hasAttribute("data-ignoreElement") ? !x.getAttribute("data-ignoreElement") :
                                                                                  true)
                              .filter(x => x === element ||
                                          (x.hasAttribute("data-transparentElement") ?
                                            !x.getAttribute("data-transparentElement") :
                                            true))[0];

    return TOP_LEFT !== element &&
            TOP_RIGHT !== element &&
            BOTTOM_LEFT !== element &&
            BOTTOM_RIGHT !== element;
  }

  #updatePassThroughList(evt, root) {
    this.#currentList = this.#getDOMElementsUnderDraggableElement(evt.clientX, evt.clientY, root)
                            .filter(elem => !this.#isBehindOtherElement(elem, (x, y) => {
                              return this.#getDOMElementsUnderDraggableElement(x, y, root);
                            }));
  }

  #getDOMElementsUnderDraggableElement(x, y, elementRoot) {
    const LIST = document.elementsFromPoint(x, y);

    return LIST.splice(LIST.indexOf(elementRoot) + 1);
  }

  #update(evt, target) {
    const ELEMENTS_LEFT = this.#getDifferences(this.#oldList, this.#currentList);
    
    if (ELEMENTS_LEFT.length > 0) {
      const OUT_EVENT = new PassThroughEvent("pt-mouseout", {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: 0,
        view: evt.view,
        sourceCapabilities: evt.sourceCapabilities,
        screenX: evt.screenX,
        screenY: evt.screenY, 
        clientX: evt.clientX,
        clientY: evt.clientY,
        ctrlKey: evt.ctrlKey,
        altKey: evt.altKey,
        metaKey: evt.metaKey,
        button: evt.button,
        buttons: evt.buttons,
        hoveringTarget: target
      });
      
      this.#oldList[0].dispatchEvent(OUT_EVENT);
    }

    const LEAVE_EVENT = new PassThroughEvent("pt-mouseleave", {
      bubbles: false,
      cancelable: false,
      composed: true,
      detail: 0,
      view: evt.view,
      sourceCapabilities: evt.sourceCapabilities,
      screenX: evt.screenX,
      screenY: evt.screenY, 
      clientX: evt.clientX,
      clientY: evt.clientY,
      ctrlKey: evt.ctrlKey,
      altKey: evt.altKey,
      metaKey: evt.metaKey,
      button: evt.button,
      buttons: evt.buttons,
      hoveringTarget: target
    });

    ELEMENTS_LEFT.forEach(x => x.dispatchEvent(LEAVE_EVENT));
    
    const ELEMENTS_ENTERED = this.#getDifferences(this.#currentList, this.#oldList);

    if (ELEMENTS_ENTERED.length > 0) {
      const OVER_EVENT = new PassThroughEvent("pt-mouseover", {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: 0,
        view: evt.view,
        sourceCapabilities: evt.sourceCapabilities,
        screenX: evt.screenX,
        screenY: evt.screenY, 
        clientX: evt.clientX,
        clientY: evt.clientY,
        ctrlKey: evt.ctrlKey,
        altKey: evt.altKey,
        metaKey: evt.metaKey,
        button: evt.button,
        buttons: evt.buttons,
        hoveringTarget: target
      });
      
      this.#currentList[0].dispatchEvent(OVER_EVENT);
    }

    const ENTER_EVENT = new PassThroughEvent("pt-mouseenter", {
        bubbles: false,
        cancelable: false,
        composed: true,
        detail: 0,
        view: evt.view,
        sourceCapabilities: evt.sourceCapabilities,
        screenX: evt.screenX,
        screenY: evt.screenY, 
        clientX: evt.clientX,
        clientY: evt.clientY,
        ctrlKey: evt.ctrlKey,
        altKey: evt.altKey,
        metaKey: evt.metaKey,
        button: evt.button,
        buttons: evt.buttons,
        hoveringTarget: target
      });

    ELEMENTS_ENTERED.forEach(x => x.dispatchEvent(ENTER_EVENT));
    
    if (this.#currentList[0] != this.#dragArea) {
      let MOVE_EVENT = new PassThroughEvent("pt-mousemove", {
          bubbles: evt.bubbles,
          cancelable: evt.cancelable,
          composed: evt.composed,
          detail: evt.detail,
          view: evt.view,
          sourceCapabilities: evt.sourceCapabilities,
          screenX: evt.screenX,
          screenY: evt.screenY, 
          clientX: evt.clientX,
          clientY: evt.clientY,
          ctrlKey: evt.ctrlKey,
          altKey: evt.altKey,
          metaKey: evt.metaKey,
          button: evt.button,
          buttons: evt.buttons,
          relativeTarget: evt.relativeTarget,
          hoveringTarget: target
        });
      
      this.#currentList[0].dispatchEvent(MOVE_EVENT);
    }
  }

  #getDifferences(arr1, arr2) {
    return arr1.filter(x => !arr2.includes(x));
  }

  #drag(evt) {
    if (this.#selectedTarget == null) {
      this.#oldList = [];

      return;
    }

    this.#selectedTarget.RootElement.dispatchEvent(new CustomEvent("onDrag", { detail: evt }));

    if (this.#selectedTarget.AllowPassThroughEvents)
      this.#update(evt, this.#selectedTarget);
  }

  #determineExit(evt) {
    if (this.#selectedTarget == null)
      return;

    const RECT = this.getRect();

    if (evt.clientX >= RECT.left && evt.clientX < RECT.right &&
        evt.clientY >= RECT.top && evt.clientY < RECT.bottom) {
      return;
    }
    
    this.#selectedTarget.RootElement.dispatchEvent(new CustomEvent("onDragEnd", { detail: evt }));
  }

  screenToSVG(pos) {
    const POINT = this.#dragArea.createSVGPoint();
    POINT.x = pos.x;
    POINT.y = pos.y;
    return POINT.matrixTransform(this.#dragArea.getScreenCTM().inverse());
  }

  SVGToScreen(pos) {
    const POINT = this.#dragArea.createSVGPoint();
    POINT.x = pos.x;
    POINT.y = pos.y;
    return POINT.matrixTransform(this.#dragArea.getScreenCTM());
  }
}