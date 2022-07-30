import FunctionBlockNode from '../../../External/BlockNode/JS/Nodes/FunctionBlockNode';
import ClassExtension from '../../../External/ClassExtension/ClassExtension';
import BlockNode from '../../../External/BlockNode/JS/Nodes/BlockNode';

export default class RootBlockNode extends FunctionBlockNode {
  #protObj = null;

  constructor() {
    ClassExtension.enforceFinalClass(new.target, RootBlockNode);

    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, RootBlockNode, {});

    super('Root', null, null, [BlockNode.ValueTypes.ALL], PROT_OBJ);

    this.#protObj = PROT_OBJ;
  }
}
