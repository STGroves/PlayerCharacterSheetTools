import FunctionBlockNode from '../../../External/BlockNode/JS/Nodes/FunctionBlockNode.js';
import ClassExtension from '../../../External/ClassExtension/ClassExtension.js';
import BlockNode from '../../../External/BlockNode/JS/Nodes/BlockNode.js';

export default class CalculationBlockNode extends FunctionBlockNode {
  #protObj = null;

  constructor() {
    ClassExtension.enforceFinalClass(new.target, CalculationBlockNode);

    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, CalculationBlockNode, {});

    super(
      'Calculation',
      BlockNode.ValueTypes.NUMBER,
      BlockNode.ValueTypes.TEXT,
      [BlockNode.ValueTypes.NUMBER, BlockNode.ValueTypes.NUMBER],
      PROT_OBJ
    );

    this.#protObj = PROT_OBJ.set('createSVG', (it) => CalculationBlockNode.#createSVG(it)).set('createStyle', (it) =>
      this.#createStyle(it)
    );
  }

  #createStyle(it) {
    it.next();

    this.#protObj.get('style').cssClass = 'NUMBER';
  }

  static #createSVG(it) {
    it.next();
  }
}
