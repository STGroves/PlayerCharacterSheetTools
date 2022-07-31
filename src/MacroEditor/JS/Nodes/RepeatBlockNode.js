import FunctionBlockNode from '../../../External/BlockNode/JS/Nodes/FunctionBlockNode.js';
import ClassExtension from '../../../External/ClassExtension/ClassExtension.js';
import BlockNode from '../../../External/BlockNode/JS/Nodes/BlockNode.js';

export default class RepeatBlockNode extends FunctionBlockNode {
  #protObj = null;

  constructor(canvas) {
    ClassExtension.enforceFinalClass(new.target, RepeatBlockNode);

    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, RepeatBlockNode, {});

    super(canvas, 'Repeat', BlockNode.ValueTypes.NULL, null, [BlockNode.ValueTypes.ALL], PROT_OBJ);

    this.#protObj = PROT_OBJ;
  }
}
