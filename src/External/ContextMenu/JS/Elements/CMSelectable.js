class CMSelectable extends CMTextElement {
  #protObj = null;

  constructor(title, prot = {}) {
    let protObj = ClassExtension.enforceProtectedObject(new.target, CMSelectable, prot);
    
    super(title, protObj);
    this.#protObj = protObj.set("setCSS", (it) => this.#setCSS(it))
                            .set("setupEvents", (it) => this.#setupEvents(it));
  }

  #setCSS(it) {
    it.next();

    this.#protObj.get("html").classList.add("contextSelectable");
  }

  #setupEvents(it) {
    it.next();

    this.#protObj.get("html").addEventListener("mouseover", event => this.#onEnter(event));
  }

  #onEnter(evt) {
    this.#protObj.get("parentMenu").setHoveredItem(this);
  }

  onHover() {
    return true;
  }

  onLeave() {
    return true;
  }
}