
  class MacroEditorCanvas extends NodeCanvas {
    #protObj = null;

    constructor(rect, prot = {}) {
      ClassExtension.enforceFinalClass(new.target, MacroEditorCanvas);

      let protObj = ClassExtension.enforceProtectedObject(new.target, MacroEditorCanvas, prot);

      super(rect, protObj);

      this.#protObj = protObj.set("setupEvents", (it) => this.#setupEvents(), false)
                             .set("createContextMenuElements",
                                  (it) => this.#createContextMenuElements());
      
      this.#protObj.get("setupEvents").next();
    }

    #setupEvents() {
      this.#protObj.get("rootElement")
                   .addEventListener(NodeCanvas.CANVAS_CREATED,
                                     (event) => {
                                       const NODE = this.#protObj.get("spawnNode").next(RootBlockNode, Vector.Zero).value;
                                       NODE.updatePosition(new Vector((width - NODE.BoundingRect.Width) / 2,
                                                                      (height - NODE.BoundingRect.Height) / 2));
                                     });
    }

    #createContextMenuElements() {
      const FUNCTIONS = new CMSubMenu("Functions",
                                      new ContextMenu().addElement(new CMButton("Calculation",
                                                                                (position) => {
                                                                                  this.#protObj.get("spawnNode")
                                                                                               .next(CalculationBlockNode, position);
                                                                                }))
                                                       .addElement(new CMButton("Repeat", 
                                                                                (position) => {
                                                                                  this.#protObj.get("spawnNode")
                                                                                               .next(RepeatBlockNode, position);
                                                                                }))
                                                       .addElement(new CMButton("Roll", () => { console.log("Roll"); })));

      const VALUES = new CMSubMenu("Values",
                                   new ContextMenu().addElement(new CMButton("Number",
                                                                             (position) => {
                                                                               this.#protObj.get("spawnNode")
                                                                                            .next(NumberBlockNode, position);
                                                                             }))
                                                    .addElement(new CMButton("Text",
                                                                             (position) => {
                                                                               this.#protObj.get("spawnNode")
                                                                                            .next(TextBlockNode, position);
                                                                             })));
      return [FUNCTIONS, VALUES];
    }
  }

  /****************************
   *          Global          *
   ****************************/
  ({width, height} = getDialogSize());
  const PADDING = 10;
  const CANVAS = new MacroEditorCanvas(new Rect(0,0, width - PADDING, height - PADDING));
  CANVAS.Canvas.dispatchEvent(new CustomEvent(NodeCanvas.CANVAS_CREATED, {}));
