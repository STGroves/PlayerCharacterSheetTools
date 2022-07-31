import CMLabel from './Elements/CMLabel.js';
import CMSeparator from './Elements/CMSeparator.js';
import CMSubMenu from './Elements/CMSubMenu.js';
import Vector from '../../Vector.js';

export default class ContextMenu {
  static DisplayDirection = {
    LEFT: -1,
    RIGHT: 1,
  };

  #html = null;
  #zIndex = null;

  #elements = [];
  #open = false;
  #hoveredItem = null;
  #title = null;
  #direction = null;
  #parentElement = null;
  #position = null;

  static #scope = null;

  get Open() {
    return this.#open;
  }
  get Title() {
    return this.#title;
  }
  get ZIndex() {
    return this.#zIndex;
  }
  get Direction() {
    return this.#direction;
  }
  get Parent() {
    return this.#parentElement == null ? null : this.#parentElement.Menu;
  }
  get Position() {
    return this.#position;
  }

  static set Scope(scope) {
    ContextMenu.#scope = scope;
  }

  constructor(title = null) {
    this.#initialiseHTML();

    this.#direction = ContextMenu.DisplayDirection.RIGHT;

    this.#title = title;

    if (title != null) this.addElement(new CMLabel(title, CMLabel.Alignment.MIDDLE)).addElement(new CMSeparator());
  }

  #initialiseHTML() {
    this.#html = document.createElement('div');
    this.#html.classList.add('contextMenu');

    document.body.appendChild(this.#html);
  }

  setParentElement(parent) {
    this.#parentElement = parent;
  }

  addElement(element) {
    this.#elements.push(element);
    element.setMenu(this);
    this.#html.appendChild(element.HTML);

    return this;
  }

  setHoveredItem(item) {
    if (item === this.#hoveredItem) return;

    const PREV_ITEM = this.#hoveredItem;

    if (PREV_ITEM != null) PREV_ITEM.onLeave();

    this.#hoveredItem = item;

    if (this.#hoveredItem != null) this.#hoveredItem.onHover();
  }

  static #checkBoundary(pos, scopeRect, htmlDims) {
    const SCOPE_POS = Vector.subtract(pos, new Vector(scopeRect.left, scopeRect.top));
    const OOB = Vector.add(SCOPE_POS, htmlDims);

    return {
      x: OOB.x <= scopeRect.width && OOB.x >= 0,
      y: OOB.y <= scopeRect.height && OOB.y >= 0,
    };
  }

  limitPosition(pos, root = false) {
    const SCOPE_RECT = ContextMenu.#scope.getBoundingClientRect();
    const HTML_RECT = this.#html.getBoundingClientRect();

    const HTML_DIMS = new Vector(HTML_RECT.width, HTML_RECT.height);
    const LIMITED = Vector.clone(pos);

    const BR_BOUNDS = ContextMenu.#checkBoundary(pos, SCOPE_RECT, HTML_DIMS);

    if (root) {
      if (!BR_BOUNDS.x) LIMITED.x = SCOPE_RECT.left + SCOPE_RECT.width - HTML_RECT.width;

      if (!BR_BOUNDS.y) LIMITED.y = SCOPE_RECT.top + SCOPE_RECT.height - HTML_RECT.height;

      return LIMITED;
    }

    const LEFT_X = pos.x - HTML_RECT.width * 2;

    const TL_BOUNDS = ContextMenu.#checkBoundary(new Vector(LEFT_X, pos.y), SCOPE_RECT, HTML_DIMS);

    switch (this.#parentElement.Menu.Direction) {
      case ContextMenu.DisplayDirection.RIGHT: {
        if (!BR_BOUNDS.x) {
          LIMITED.x = LEFT_X;
          this.#direction = ContextMenu.DisplayDirection.LEFT;
        } else {
          this.#direction = ContextMenu.DisplayDirection.RIGHT;
        }

        break;
      }

      case ContextMenu.DisplayDirection.LEFT: {
        if (!TL_BOUNDS.x) {
          this.#direction = ContextMenu.DisplayDirection.RIGHT;
        } else {
          LIMITED.x = LEFT_X;
          this.#direction = ContextMenu.DisplayDirection.LEFT;
        }

        break;
      }

      default:
    }

    if (!BR_BOUNDS.y) LIMITED.y = SCOPE_RECT.top + SCOPE_RECT.height - HTML_RECT.height;

    return LIMITED;
  }

  show(pos, zIndex) {
    this.#html.style.top = `${pos.y}px`;
    this.#html.style.left = `${pos.x}px`;

    this.#html.classList.add('visible');
    this.#html.style.zIndex = zIndex;
    this.#zIndex = zIndex;

    this.#position = pos;

    this.#open = true;
  }

  close() {
    if (this.#hoveredItem != null && this.#hoveredItem instanceof CMSubMenu) this.#hoveredItem.Target.close();

    this.#html.classList.remove('visible');
    this.#html.style.zIndex = null;
    this.#hoveredItem = null;
    this.#open = false;
  }

  static findRoot(element) {
    let target = element.Menu;

    while (target.Parent != null) {
      target = target.Parent;
    }

    return target;
  }
}
