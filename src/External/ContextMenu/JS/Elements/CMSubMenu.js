class CMSubMenu extends CMSelectable {
  #menu = null;
  #protObj = null;

  get Target() { return this.#menu; }

  constructor(title, menu) {
    ClassExtension.enforceFinalClass(new.target, CMSubMenu);

    let protObj = ClassExtension.enforceProtectedObject(new.target, CMSubMenu, {});
    
    super(title, protObj);
    this.#protObj = protObj.set("setCSS", (it) => this.#setCSS(it));

    this.#menu = menu;
    this.#menu.setParentElement(this);

    this.#protObj.get("finalise").next();
  }

  #setCSS(it) {
    it.next();

    this.#protObj.get("html").classList.add("contextSubMenu");
  }

  onHover() {
    const RECT = this.#protObj.get("html").getBoundingClientRect();
    const SCOPED_POS = this.#menu.limitPosition(new Vector(RECT.right, RECT.top));

    this.#menu.show(SCOPED_POS, this.Menu.ZIndex + 1);
  }

  onLeave() {
    this.#menu.close();
  }
}