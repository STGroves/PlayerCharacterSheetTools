import ValueBlockNode from '../../../External/BlockNode/JS/Nodes/ValueBlockNode.js';
import ClassExtension from '../../../External/ClassExtension/ClassExtension.js';
import BlockNode from '../../../External/BlockNode/JS/Nodes/BlockNode.js';

export default class TextBlockNode extends ValueBlockNode {
  #protObj = null;

  constructor() {
    ClassExtension.enforceFinalClass(new.target, TextBlockNode);

    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, TextBlockNode, {});

    super(
      'Text',
      BlockNode.ValueTypes.TEXT,
      BlockNode.ValueTypes.ALL,
      {
        type: 'Text',
        valueSelection: ValueBlockNode.STAT_SELECTION.then((result) => {
          return result.filter((x) => x.valueType === 'Text');
        }),
      },
      PROT_OBJ
    );
    this.#protObj = PROT_OBJ.set('createStaticHTML', (_it, base) => this.#createStaticHTML(base)).set(
      'createStyle',
      (it) => this.#createStyle(it)
    );
  }

  #createStyle(it) {
    it.next();

    this.#protObj.get('style').cssClass = 'TEXT';
  }

  #createStaticHTML(base) {
    const PROT_GET = this.#protObj.get;
    const STYLE = PROT_GET('style');

    base.setAttribute('x', STYLE.leftOffset);
    base.setAttribute('y', STYLE.headerHeight);
    base.setAttribute('height', 20);
    base.setAttribute('width', STYLE.minWidth - STYLE.padding - STYLE.leftOffset);

    const TEXT_INPUT = document.createElement('input');

    TEXT_INPUT.setAttribute('type', 'text');
    TEXT_INPUT.setAttribute('placeholder', 'Insert text here...');
    TEXT_INPUT.classList.add(`${STYLE.cssClass}_Input`);

    base.appendChild(TEXT_INPUT);
  }
}
