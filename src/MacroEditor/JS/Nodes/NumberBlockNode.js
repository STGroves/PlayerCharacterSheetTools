import { ValueBlockNode, STAT_SELECTION } from '../../../External/BlockNode/JS/Nodes/ValueBlockNode.js';
import ClassExtension from '../../../External/ClassExtension/ClassExtension.js';
import BlockNode from '../../../External/BlockNode/JS/Nodes/BlockNode.js';

export default class NumberBlockNode extends ValueBlockNode {
  #protObj = null;

  constructor() {
    ClassExtension.enforceFinalClass(new.target, NumberBlockNode);

    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, NumberBlockNode, {});

    super(
      'Number',
      BlockNode.ValueTypes.NUMBER,
      BlockNode.ValueTypes.TEXT,
      {
        type: 'Number',
        valueSelection: STAT_SELECTION,
      },
      PROT_OBJ
    );
    this.#protObj = PROT_OBJ.set('createStaticHTML', (it, base) => this.#createStaticHTML(base)).set(
      'createStyle',
      (it) => this.#createStyle(it)
    );
  }

  #createStyle(it) {
    it.next();

    this.#protObj.get('style').cssClass = 'NUMBER';
  }

  #createStaticHTML(base) {
    const PROT_GET = this.#protObj.get;
    const STYLE = PROT_GET('style');

    base.setAttribute('x', STYLE.leftOffset);
    base.setAttribute('y', STYLE.headerHeight);
    base.setAttribute('height', 20);
    base.setAttribute('width', STYLE.minWidth - STYLE.padding - STYLE.leftOffset);

    const NUM_INPUT = document.createElement('input');

    NUM_INPUT.setAttribute('type', 'number');
    NUM_INPUT.setAttribute('placeholder', 'Insert number here...');
    NUM_INPUT.classList.add(`${STYLE.cssClass}_Input`);

    base.appendChild(NUM_INPUT);
  }
}
