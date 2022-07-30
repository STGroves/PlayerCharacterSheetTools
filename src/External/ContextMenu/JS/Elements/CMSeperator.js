class CMSeparator extends CMElement {
  #protObj = null;

  constructor() {
    ClassExtension.enforceFinalClass(new.target, CMSeparator);

    let protObj = ClassExtension.enforceProtectedObject(new.target, CMSeparator, {});

    super("hr", protObj);
    this.#protObj = protObj.set("setCSS", () => this.#setCSS(), false);

    this.#protObj.get("finalise").next();
  }

  #setCSS() {
    this.HTML.classList.add("contextSeparator");
  }
}