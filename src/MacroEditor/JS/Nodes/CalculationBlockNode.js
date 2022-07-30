
  class CalculationBlockNode extends FunctionBlockNode {
    #protObj = null;

    constructor() {
      ClassExtension.enforceFinalClass(new.target, CalculationBlockNode);

      let protObj = ClassExtension.enforceProtectedObject(new.target, CalculationBlockNode, {});

      super("Calculation",
            BlockNode.ValueTypes.NUMBER,
            BlockNode.ValueTypes.TEXT,
            [BlockNode.ValueTypes.NUMBER, BlockNode.ValueTypes.NUMBER],
            protObj);
            
      this.#protObj = protObj.set("createSVG", (it) => this.#createSVG(it))
                             .set("createStyle", (it) => this.#createStyle(it));
    }

    #createStyle(it) {
      it.next();

      this.#protObj.get("style").cssClass = "NUMBER";
    }

    #createSVG(it) {
      it.next();
    }
  }
