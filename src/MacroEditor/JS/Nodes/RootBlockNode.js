
  class RootBlockNode extends FunctionBlockNode {
    #protObj = null;

    constructor() {
      ClassExtension.enforceFinalClass(new.target, RootBlockNode);

      let protObj = ClassExtension.enforceProtectedObject(new.target, RootBlockNode, {});

      super("Root",
            null,
            null,
            [BlockNode.ValueTypes.ALL],
            protObj);
            
      this.#protObj = protObj;
    }
  }
