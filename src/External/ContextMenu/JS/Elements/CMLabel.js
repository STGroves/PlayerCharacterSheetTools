class CMLabel extends CMTextElement {
  static get Alignment() {
    return {
      LEFT: -1,
      MIDDLE: 0,
      RIGHT: 1
    }
  };

  #alignment = null;
  #protObj = null;

  constructor(title, alignment = CMLabel.Alignment.LEFT) {
    ClassExtension.enforceFinalClass(new.target, CMLabel);

    let protObj = ClassExtension.enforceProtectedObject(new.target, CMLabel, {});

    super(title, protObj);
    this.#protObj = protObj.set("setCSS", (it) => this.#setCSS(it));

    this.#alignment = alignment;

    this.#protObj.get("finalise").next();
  }

  #setCSS(it) {
    it.next();

    switch (this.#alignment) {
      case CMLabel.Alignment.MIDDLE: {
        this.#protObj.get("html").classList.add("contextLabelMiddle");
        
        break;
      }

      case CMLabel.Alignment.MIDDLE: {
        this.#protObj.get("html").classList.add("contextLabelRight");
        
        break;
      }
    }
  }
}