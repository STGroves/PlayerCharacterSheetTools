import ClassExtension from '../../../ClassExtension/ClassExtension.js';
import CMElement from './CMElement.js';

export default class CMSeparator extends CMElement {
  #protObj = null;

  constructor() {
    ClassExtension.enforceFinalClass(new.target, CMSeparator);

    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, CMSeparator, {});

    super('hr', PROT_OBJ);
    this.#protObj = PROT_OBJ.set('setCSS', () => this.#setCSS(), false);

    this.#protObj.get('finalise').next();
  }

  #setCSS() {
    this.HTML.classList.add('contextSeparator');
  }
}
