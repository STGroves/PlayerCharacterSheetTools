let statSelection = promiseRun("getStats");

class ValueBlockNode extends BlockNode {
  #protObj = null;

  /**
   * @constructor
   * @param {string} title 
   * @param {ValueType} returnType 
   * @param {ValueType[]} connectionTypes 
   * @param {{type: string, valueSelection: object}} typeData 
   * @param {ProtectedObject} prot 
   */
  constructor (title, returnType, connectionTypes, typeData, prot = {}) {
    let protObj = ClassExtension.enforceProtectedObject(new.target, ValueBlockNode, prot);

    super(title, returnType, connectionTypes, protObj);
    this.#protObj = protObj.set("nodeType", typeData.type)
                            .set("valueSelection", typeData.valueSelection)
                            .set("createStyle", (it) => this.#createStyle(it))
                            .set("createSVG", (it) => this.#createSVG(it))
                            .set("handleConnectionPointLayoutChange",
                                (it, event) => this.#handleConnectionPointLayoutChange(it, event))
                            .set("calculateHeight", () => this.#calculateHeight(), false)
                            .set("createStaticHTML", (it, base) => this.#createStaticHTML(base))
                            .set("clearStaticHTML", (it, base) => this.#clearStaticHTML(base))
                            .set("drawMiddle", (it, nodeData) => this.#drawMiddle(nodeData), false);
  }

  #createStyle(it) {
    it.next();

    const STYLE = this.#protObj.get("style");
    
    STYLE.midSection = 15;
  }

  #calculateHeight() {
    const STYLE = this.#protObj.get("style");

    return STYLE.headerHeight + STYLE.midSection + STYLE.footerHeight;
  }

  #createStaticHTML(base) {
    ClassExtension.enforceAbstractMethod("#createStaticHTML", ValueBlockNode);
  }

  #clearStaticHTML(base) {
    for (let i = 0; i < base.childNodes.length; i++) {
      let child = base.childNodes[i];

      if (!child)
        continue;

      switch (child.type) {
        case 'button':
        case 'text':
        case 'submit':
        case 'password':
        case 'file':
        case 'email':
        case 'date':
        case 'number':
          child.value = '';
        case 'checkbox':
        case 'radio':
          child.checked = false;
      }
    }
  }

  #createSVG(it) {
    it.next();

    const PROT_GET = this.#protObj.get;
    const STYLE = PROT_GET("style");
    const SVG = PROT_GET("rootElement");

    const VAR_FOREIGN = document.createElementNS(SVG_NS, "foreignObject");

    VAR_FOREIGN.setAttribute("x", STYLE.leftOffset);
    VAR_FOREIGN.setAttribute("y", STYLE.headerHeight);
    VAR_FOREIGN.setAttribute("height", 20);
    VAR_FOREIGN.setAttribute("width", STYLE.minWidth - STYLE.padding - STYLE.leftOffset);
    VAR_FOREIGN.classList.add("hidden");

    const VARS = createDropdownHTML({
      promiseObj: this.#protObj.get("valueSelection"),
      callback: (results) => {
        return results.filter(x => x.testType == this.#protObj.get("nodeType")).map(x => {
          return x.name;
          });
      }
    });

    VAR_FOREIGN.appendChild(VARS);
    SVG.appendChild(VAR_FOREIGN);

    const STATIC_FOREIGN = document.createElementNS(SVG_NS, "foreignObject");
    this.#protObj.get("createStaticHTML").next(STATIC_FOREIGN);

    SVG.appendChild(STATIC_FOREIGN);

    const SWITCH_FOREIGN = document.createElementNS(SVG_NS, "foreignObject");
    const SWITCH_BTN = document.createElement("button");

    SWITCH_BTN.innerHTML = "V";
    SWITCH_BTN.classList.add("switchBtn");
    SWITCH_BTN.classList.add("node_Text");
    SWITCH_BTN.classList.add(`${STYLE.cssClass}_Darker`);
    SWITCH_BTN.classList.add(`${STYLE.cssClass}_Lighter`);

    const BTN_DIMS = 20;

    SWITCH_FOREIGN.setAttribute("x", STYLE.minWidth - STYLE.padding - BTN_DIMS);
    SWITCH_FOREIGN.setAttribute("y", STYLE.toothDepth + STYLE.padding);
    SWITCH_FOREIGN.setAttribute("height", BTN_DIMS);
    SWITCH_FOREIGN.setAttribute("width", BTN_DIMS);

    SWITCH_FOREIGN.appendChild(SWITCH_BTN);

    SWITCH_BTN.addEventListener("click",() => {
      if (SWITCH_BTN.innerHTML == "V") {
        VAR_FOREIGN.classList.remove("hidden");
        STATIC_FOREIGN.classList.add("hidden");
        this.#protObj.get("clearStaticHTML").next(STATIC_FOREIGN);
        SWITCH_BTN.innerHTML = "S";
      } else {
        VAR_FOREIGN.classList.add("hidden");
        STATIC_FOREIGN.classList.remove("hidden");
        VARS.selectedIndex = 0;
        SWITCH_BTN.innerHTML = "V";
      }
    });

    SVG.appendChild(SWITCH_FOREIGN);
  }

  #handleConnectionPointLayoutChange(it, evt) {
    it.next(evt);
    
    if (this.Parent == null)
      return;

    evt.sourceConnectionPoint = this.Parent.findConnection(this);
    this.Parent.dispatchEvent(new ConnectionPointLayoutEvent(evt));
  }

  #drawMiddle(nodeData) {
    const STYLE = this.#protObj.get("style");
    const NC2 = (STYLE.cornerRadius * 2);

    return {
      outer: nodeData.outer.drawGlobalY(STYLE.midSection + NC2),
      inner: nodeData.inner.drawGlobalY(STYLE.midSection + NC2)
    };
  }
}