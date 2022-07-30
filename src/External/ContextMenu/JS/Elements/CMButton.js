class CMButton extends CMSelectable {
  #callback = null;
  #protObj = null;

  constructor(title, callback = null) {
    ClassExtension.enforceFinalClass(new.target, CMButton);

    let protObj = ClassExtension.enforceProtectedObject(new.target, CMButton, {});
    
    super(title, protObj);
    this.#protObj = protObj.set("setupEvents", (it) => this.#setupEvents(it));

    this.#callback = callback;

    this.#protObj.get("finalise").next();
  }

  #setupEvents(it) {
    it.next();

    this.#protObj.get("html").addEventListener("mouseup", event => this.#onSelected(event));
  }

  #onSelected(evt) {
    const ROOT = ContextMenu.findRoot(this);

    if (this.#callback != null)
      this.#callback(ROOT.Position);
    
    ROOT.close();
  }
}