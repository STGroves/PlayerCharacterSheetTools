import ClassExtension from '../../../ClassExtension/ClassExtension';
import CMElement from './CMElement';

export default class CMTextElement extends CMElement {
  #protObj = null;

  get Title() {
    return this.#protObj.get('title');
  }

  constructor(title, prot = {}) {
    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, CMTextElement, prot);

    super('div', PROT_OBJ);
    this.#protObj = PROT_OBJ.set('title', title).set('setCSS', (it) => this.#setCSS(it));

    this.#protObj.get('html').innerHTML = title;
  }

  #setCSS(it) {
    it.next();

    this.#protObj.get('html').classList.add('contextTitle');
  }
}
