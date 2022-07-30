class CMTextElement extends CMElement {
  #protObj = null;

  get Title() { return this.#protObj.get("title"); }

  constructor(title, prot = {}) {
    let protObj = ClassExtension.enforceProtectedObject(new.target, CMTextElement, prot);
    
    super("div", protObj);
    this.#protObj = protObj.set("title", title)
                            .set("setCSS", (it) => this.#setCSS(it));

    this.#protObj.get("html").innerHTML = title;
  }

  #setCSS(it) {
    it.next();

    this.#protObj.get("html").classList.add("contextTitle");
  }
}