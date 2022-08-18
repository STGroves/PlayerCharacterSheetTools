import ClassExtension from '../../../ClassExtension/ClassExtension.js';
import Vector from '../../../Vector.js';
import Rect from '../../../Rect.js';

export default class DraggableElement extends EventTarget {
  #protObj = null;
  #startPos = Vector.Zero;
  #allowPassThroughEvents = false;

  get RootElement() {
    return this.#protObj.get('rootElement');
  }
  get BaseVisualElement() {
    return this.#protObj.get('baseVisualElement');
  }
  get DraggableArea() {
    return this.#protObj.get('draggableArea');
  }
  get BoundingRect() {
    return this.#protObj.get('rect');
  }
  get AllowPassThroughEvents() {
    return this.#allowPassThroughEvents;
  }

  constructor(rect, rootElement, options, prot = {}) {
    super();

    this.#allowPassThroughEvents = options.allowPassThroughEvents || false;

    this.#protObj = ClassExtension.enforceProtectedObject(new.target, DraggableElement, prot)
      .set('rect', rect)
      .set('rootElement', rootElement)
      .set('baseVisualElement', options.baseVisualElement || rootElement)
      .set('isDragging', null)
      .set('draggableArea', null)
      .set('setupEvents', (it) => this.#setupEvents(it))
      .set('updatePosition', (_, pos) => this.updatePosition(pos))
      .set('determineMouseDown', (_, evt) => this.#determineMouseDown(evt))
      .set('determineMouseUp', (_, evt) => this.#determineMouseUp(evt))
      .set('startDrag', (_, evt) => this.#startDrag(evt))
      .set('drag', (_, evt) => this.#drag(evt))
      .set('endDrag', (_, evt) => this.#endDrag(evt));
  }

  #setupEvents() {
    const ROOT_ELEMENT = this.#protObj.get('rootElement');
    const PROT_GET = this.#protObj.get;

    ROOT_ELEMENT.addEventListener('mousedown', (event) => PROT_GET('determineMouseDown').next(event));
    ROOT_ELEMENT.addEventListener('onDrag', (event) => PROT_GET('drag').next(event.detail));
    ROOT_ELEMENT.addEventListener('onDragEnd', (event) => PROT_GET('endDrag').next(event.detail));
    ROOT_ELEMENT.addEventListener('mouseup', (event) => PROT_GET('determineMouseUp').next(event));
  }

  #determineMouseDown(evt) {
    evt.preventDefault();

    switch (evt.which) {
      case 1:
        this.#protObj.get('startDrag').next(evt);
        break;

      default:
    }
  }

  #determineMouseUp(evt) {
    evt.preventDefault();

    switch (evt.which) {
      case 1:
        this.#protObj.get('endDrag').next(evt);
        break;

      default:
    }
  }

  #startDrag(evt) {
    this.#startPos = new Vector(evt.clientX, evt.clientY);
    this.#protObj.set('isDragging', true);
    this.#protObj.get('draggableArea').setTarget(this);
  }

  #calculatePosition(pos) {
    const PROT_GET = this.#protObj.get;

    const DELTA = Vector.subtract(pos - this.#startPos);
    const DRAG_AREA = PROT_GET('draggableArea');
    const RECT = PROT_GET('rect');

    const LIMITED_POS = Rect.limit(
      DRAG_AREA.getRect(true),
      new Rect(RECT.X + DELTA.x, RECT.Y + DELTA.y, RECT.WIDTH, RECT.HEIGHT)
    );

    PROT_GET.get('updatePosition').next(LIMITED_POS);

    return LIMITED_POS;
  }

  updatePosition(pos) {
    const PROT_GET = this.#protObj.get;
    PROT_GET('rootElement').style.top = pos.y;
    PROT_GET('rootElement').style.left = pos.x;
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
