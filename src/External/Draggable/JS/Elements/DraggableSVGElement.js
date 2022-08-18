import ClassExtension from '../../../ClassExtension/ClassExtension.js';
import Vector from '../../../Vector.js';
import DraggableElement from './DraggableElement.js';

export default class DraggableSVGElement extends DraggableElement {
  #protObj = null;

  constructor(rect, rootElement, options, prot = {}) {
    const PROT = ClassExtension.enforceProtectedObject(new.target, DraggableSVGElement, prot);

    super(rect, rootElement, options, PROT);

    this.#protObj = PROT.set('offset', Vector.Zero)
      .set('updatePosition', (_, pos) => this.updatePosition(pos), false)
      .set('calculateOffset', (_, pos) => this.#calculateOffset(pos), false)
      .set('startDrag', (_, evt) => this.#startDrag(evt), false)
      .set('drag', (_, evt) => this.#drag(evt), false)
      .set('endDrag', (_, evt) => this.#endDrag(evt), false);

    this.#protObj.get('rootElement').setAttributeNS(null, 'transform', `translate(0, 0)`);
    this.#protObj.set('transform', this.#protObj.get('rootElement').transform.baseVal.getItem(0));
  }

  #calculateOffset(pos) {
    const DRAG_AREA = this.#protObj.get('draggableArea');

    this.#protObj.set('offset', DRAG_AREA.calculateOffset(DRAG_AREA.screenToSVG(pos), this.#protObj.get('transform')));
  }

  #startDrag(evt) {
    const POS = new Vector(evt.clientX, evt.clientY);

    this.#protObj.get('calculateOffset').next(POS);
    this.#protObj.set('isDragging', true);

    this.#protObj.get('draggableArea').setTarget(this);
  }

  #calculatePosition(pos) {
    const PROT_GET = this.#protObj.get;

    const CO_ORDS = PROT_GET('draggableArea').screenToSVG(pos);
    const NEW_POS = Vector.subtract(CO_ORDS, PROT_GET('offset'));

    this.#protObj.get('updatePosition').next(NEW_POS);

    return NEW_POS;
  }

  updatePosition(pos) {
    const PROT_GET = this.#protObj.get;
    PROT_GET('transform').setTranslate(pos.x, pos.y);
    PROT_GET('rect').setPosition(pos);
  }

  #drag(evt) {
    if (!this.#protObj.get('isDragging')) {
      return null;
    }

    evt.preventDefault();

    const NEW_POS = this.#calculatePosition(new Vector(evt.clientX, evt.clientY));

    return NEW_POS;
  }

  #endDrag(evt) {
    evt.preventDefault();

    this.#protObj.set('isDragging', false);
    this.#protObj.get('draggableArea').setTarget(null);
  }
}
