import ClassExtension from '../../../ClassExtension/ClassExtension';
import CMTextElement from './CMTextElement';

export default class CMSelectable extends CMTextElement {
  #protObj = null;

  constructor(title, prot = {}) {
    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, CMSelectable, prot);

    super(title, PROT_OBJ);
    this.#protObj = PROT_OBJ.set('setCSS', (it) => this.#setCSS(it)).set('setupEvents', (it) => this.#setupEvents(it));
  }

  #setCSS(it) {
    it.next();

    this.#protObj.get('html').classList.add('contextSelectable');
  }

  #setupEvents(it) {
    it.next();

    this.#protObj.get('html').addEventListener('mouseover', (event) => this.#onEnter(event));
  }

  #onEnter() {
    this.#protObj.get('parentMenu').setHoveredItem(this);
  }

  // eslint-disable-next-line class-methods-use-this
  onHover() {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  onLeave() {
    return true;
  }
}
