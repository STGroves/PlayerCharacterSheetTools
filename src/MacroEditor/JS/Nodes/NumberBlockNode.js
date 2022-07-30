
  class NumberBlockNode extends ValueBlockNode {
    #protObj = null;

    constructor() {
      ClassExtension.enforceFinalClass(new.target, NumberBlockNode);

      let protObj = ClassExtension.enforceProtectedObject(new.target, NumberBlockNode, {});

      super("Number",
            BlockNode.ValueTypes.NUMBER,
            BlockNode.ValueTypes.TEXT,
            {
              type: "Number",
              valueSelection: statSelection
            },
            protObj);
      this.#protObj = protObj.set("createStaticHTML", (it, base) => this.#createStaticHTML(base))
                             .set("createStyle", (it) => this.#createStyle(it));
    }

    #createStyle(it) {
      it.next();

      this.#protObj.get("style").cssClass = "NUMBER";
    }

    #createStaticHTML(base) {
      const PROT_GET = this.#protObj.get;
      const STYLE = PROT_GET("style");

      base.setAttribute("x", STYLE.leftOffset);
      base.setAttribute("y", STYLE.headerHeight);
      base.setAttribute("height", 20);
      base.setAttribute("width", STYLE.minWidth - STYLE.padding - STYLE.leftOffset);
      
      const NUM_INPUT = document.createElement("input");

      NUM_INPUT.setAttribute("type", "number");
      NUM_INPUT.setAttribute("placeholder", "Insert number here...");
      NUM_INPUT.classList.add(`${STYLE.cssClass}_Input`);

      base.appendChild(NUM_INPUT);
    }
  }
