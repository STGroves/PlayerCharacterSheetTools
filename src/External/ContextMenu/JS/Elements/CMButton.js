import ClassExtension from '../../../ClassExtension/ClassExtension';
import CMSelectable from './CMSelectable';
import ContextMenu from '../ContextMenu';

export default class CMButton extends CMSelectable {
  #callback = null;
  #protObj = null;

  constructor(title, callback = null) {
    ClassExtension.enforceFinalClass(new.target, CMButton);

    const PROJ_OBJ = ClassExtension.enforceProtectedObject(new.target, CMButton, {});

    super(title, PROJ_OBJ);
    this.#protObj = PROJ_OBJ.set('setupEvents', (it) => this.#setupEvents(it));

    this.#callback = callback;

    this.#protObj.get('finalise').next();
  }

  #setupEvents(it) {
    it.next();

    this.#protObj.get('html').addEventListener('mouseup', (event) => this.#onSelected(event));
  }

  #onSelected() {
    const ROOT = ContextMenu.findRoot(this);

    if (this.#callback != null) this.#callback(ROOT.Position);

    ROOT.close();
  }
}
