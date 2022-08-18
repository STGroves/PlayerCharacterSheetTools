import ClassExtension from '../../ClassExtension/ClassExtension.js';
import DraggableElement from '../../Draggable/JS/Elements/DraggableElement.js';

export default class UIWindow extends DraggableElement {
  #protObj = null;

  constuctor(rect, screenArea, options, prot = {}) {
    ClassExtension.enforceAbstractClass(new.target, UIWindow);

    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, UIWindow, prot);
    const BASE = document.createElement('div');
    super(
      rect,
      BASE,
      {
        allowPassThroughEvents: true,
        manualPositionUpdate: false,
        baseVisualElement: BASE,
      },
      PROT_OBJ
    );

    this.#protObj = PROT_OBJ.set('rect', rect)
      .set('draggableArea', screenArea)
      .set('draggable', options.draggable)
      .set('canResize', options.canResize)
      .set('canClose', options.canClose)
      .set('canMinimise', options.canMinimise)
      .set('canMaximise', options.canMaximise);
    this.#createWindow();
  }

  #createWindow() {
    const PROT_GET = this.#protObj.get;
    const RECT = PROT_GET('rect');

    const WINDOW = document.createElement('div');
    WINDOW.setAttribute('x', RECT.X);
    WINDOW.setAttribute('y', RECT.Y);
    WINDOW.setAttribute('width', RECT.WIDTH);
    WINDOW.setAttribute('height', RECT.HEIGHT);

    const MENU_HEIGHT = window.getComputedStyle().height;

    const MENU_BAR = document.createElement('div');
    MENU_BAR.setAttribute('height', MENU_HEIGHT);

    const CLOSE_BAR = document.createElement('div');
    CLOSE_BAR.setAttribute('height', MENU_HEIGHT);
    CLOSE_BAR.setAttribute('width', MENU_HEIGHT);

    const MINIMISE_BTN = document.createElement('button');
    MINIMISE_BTN.setAttribute('width', MENU_HEIGHT);
    MINIMISE_BTN.setAttribute('height', MENU_HEIGHT);

    const MAXIMISE_BTN = document.createElement('button');
    MAXIMISE_BTN.setAttribute('width', MENU_HEIGHT);
    MAXIMISE_BTN.setAttribute('height', MENU_HEIGHT);

    const CLOSE_BTN = document.createElement('button');
    CLOSE_BTN.setAttribute('width', MENU_HEIGHT);
    CLOSE_BTN.setAttribute('height', MENU_HEIGHT);

    CLOSE_BAR.appendChild(MINIMISE_BTN);
    CLOSE_BAR.appendChild(MAXIMISE_BTN);
    CLOSE_BAR.appendChild(CLOSE_BTN);

    MENU_BAR.setAttribute('width', RECT.width);
  }
}
