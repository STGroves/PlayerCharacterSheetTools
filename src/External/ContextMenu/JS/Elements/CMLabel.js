import ClassExtension from '../../../ClassExtension/ClassExtension.js';
import CMTextElement from './CMTextElement.js';

export default class CMLabel extends CMTextElement {
  static get Alignment() {
    return {
      LEFT: -1,
      MIDDLE: 0,
      RIGHT: 1,
    };
  }

  #alignment = null;
  #protObj = null;

  constructor(title, alignment = CMLabel.Alignment.LEFT) {
    ClassExtension.enforceFinalClass(new.target, CMLabel);

    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, CMLabel, {});

    super(title, PROT_OBJ);
    this.#protObj = PROT_OBJ.set('setCSS', (it) => this.#setCSS(it));

    this.#alignment = alignment;

    this.#protObj.get('finalise').next();
  }

  #setCSS(it) {
    it.next();

    switch (this.#alignment) {
      case CMLabel.Alignment.LEFT:
        this.#protObj.get('html').classList.add('contextLabelLeft');
        break;

      case CMLabel.Alignment.MIDDLE:
        this.#protObj.get('html').classList.add('contextLabelMiddle');
        break;

      case CMLabel.Alignment.RIGHT:
        this.#protObj.get('html').classList.add('contextLabelRight');
        break;

      default:
    }
  }
}
