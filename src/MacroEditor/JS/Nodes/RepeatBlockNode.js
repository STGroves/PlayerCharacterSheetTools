import FunctionBlockNode from '../../../External/BlockNode/JS/Nodes/FunctionBlockNode';
import ClassExtension from '../../../External/ClassExtension/ClassExtension';
import BlockNode from '../../../External/BlockNode/JS/Nodes/BlockNode';

export default class RepeatBlockNode extends FunctionBlockNode {
  #protObj = null;

  constructor() {
    ClassExtension.enforceFinalClass(new.target, RepeatBlockNode);

    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, RepeatBlockNode, {});

    super('Repeat', BlockNode.ValueTypes.NULL, null, [BlockNode.ValueTypes.ALL], PROT_OBJ);

    this.#protObj = PROT_OBJ;
  }
}
