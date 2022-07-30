
  class RepeatBlockNode extends FunctionBlockNode {
    #protObj = null;

    constructor() {
      ClassExtension.enforceFinalClass(new.target, RepeatBlockNode);

      let protObj = ClassExtension.enforceProtectedObject(new.target, RepeatBlockNode, {});

      super("Repeat",
            BlockNode.ValueTypes.NULL,
            null,
            [BlockNode.ValueTypes.ALL],
            protObj);
            
      this.#protObj = protObj;
    }
  }
