import DraggableArea from '../../Draggable/JS/Elements/DraggableArea.js';
import ClassExtension from '../../ClassExtension/ClassExtension.js';

export default class UIWindowArea extends DraggableArea {
  #protObj = null;

  constructor(prot = {}) {
    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, UIWindowArea, prot);
    super(PROT_OBJ);
  }
}
