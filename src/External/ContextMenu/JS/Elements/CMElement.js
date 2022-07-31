import ClassExtension from '../../../ClassExtension/ClassExtension.js';

export default class CMElement {
  #protObj = null;

  get Menu() {
    return this.#protObj.get('parentMenu');
  }
  get HTML() {
    return this.#protObj.get('html');
  }

  constructor(elementType = 'div', prot = {}) {
    ClassExtension.enforceAbstractClass(new.target, CMElement);

    this.#protObj = ClassExtension.enforceProtectedObject(new.target, CMElement, prot)
      .set('html', document.createElement(elementType))
      .set('parentMenu', null)
      .set('finalise', () => this.#finalise())
      .set('setCSS', () => this.#setCSS())
      .set('setupEvents', () => this.#setupEvents());
  }

  setMenu(menu) {
    this.#protObj.set('parentMenu', menu);
  }

  #finalise() {
    this.#protObj.get('setCSS').next();
    this.#protObj.get('setupEvents').next();
  }

  #setCSS() {
    this.#protObj.get('html').classList.add('contextElement');
  }

  #setupEvents() {
    this.#protObj.get('html').addEventListener('contextmenu', (event) => event.preventDefault());
  }
}
