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
      .set('canMaximise', options.canMaximise)
      .set('title', options.title)
      .set('createStyle', () => this.#createStyle());
    this.#createWindow();
  }

  #createStyle() {
    this.#protObj.set('style', {
      titlebarHeight: 20,
      closeIcon: 'https://stgroves.github.io/PlayerCharacterSheetTools/resources/UIWindow/Close.png',
      maxIcon: 'https://stgroves.github.io/PlayerCharacterSheetTools/resources/UIWindow/Maximise.png',
      minIcon: 'https://stgroves.github.io/PlayerCharacterSheetTools/resources/UIWindow/Minimise.png',
      restoreIcon: 'https://stgroves.github.io/PlayerCharacterSheetTools/resources/UIWindow/Restore%20Down.png',
    });
  }

  #createWindow() {
    const PROT_GET = this.#protObj.get;
    const RECT = PROT_GET('rect');
    const CAN_CLOSE = PROT_GET('canClose');
    const CAN_MAXIMISE = PROT_GET('canMaximise');
    const CAN_MINIMISE = PROT_GET('canMinimise');
    const MENU_HEIGHT = PROT_GET('style').titlebarHeight;

    const WINDOW = document.createElement('div');
    WINDOW.style.left = RECT.X;
    WINDOW.style.top = RECT.Y;
    WINDOW.style.width = `${RECT.Width}px`;
    WINDOW.style.height = `${RECT.height}px`;

    const MENU_BAR = document.createElement('div');
    MENU_BAR.classList.add('menuBar');
    MENU_BAR.style.height = `${MENU_HEIGHT}px`;
    MENU_BAR.style.width = `${RECT.width}px`;
    WINDOW.appendChild(MENU_BAR);

    const CLOSE_BAR_WIDTH = MENU_HEIGHT * (CAN_CLOSE ? 1 : 0) + (CAN_MAXIMISE ? 1 : 0) + (CAN_MINIMISE ? 1 : 0);

    const CLOSE_BAR = document.createElement('div');
    CLOSE_BAR.style.height = `${MENU_HEIGHT}px`;
    CLOSE_BAR.style.width = `${CLOSE_BAR_WIDTH}px`;
    CLOSE_BAR.classList.add('closeBar');
    MENU_BAR.appendChild(CLOSE_BAR);

    const TITLE = document.createElement('div');
    TITLE.innerHTML = PROT_GET('title');
    TITLE.style.width = `${RECT.Width - CLOSE_BAR_WIDTH}px`;
    TITLE.classList.add('windowTitle');
    MENU_BAR.appendChild(TITLE);

    if (CAN_MINIMISE) {
      const MINIMISE_BTN = document.createElement('button');
      MINIMISE_BTN.style.width = `${MENU_HEIGHT}px`;
      MINIMISE_BTN.style.height = `${MENU_HEIGHT}px`;
      MINIMISE_BTN.classList.add('closeBarBtn');

      const MINIMISE_IMG = document.createElement('img');
      MINIMISE_IMG.style.width = '100%';
      MINIMISE_IMG.style.height = '100%';
      MINIMISE_IMG.style.padding = 0;
      MINIMISE_IMG.style.margin = 0;
      MINIMISE_IMG.classList.add('minimiseBtn');
      MINIMISE_BTN.appendChild(MINIMISE_IMG);

      CLOSE_BAR.appendChild(MINIMISE_BTN);
    }

    if (CAN_MAXIMISE) {
      const MAXIMISE_BTN = document.createElement('button');
      MAXIMISE_BTN.style.width = `${MENU_HEIGHT}px`;
      MAXIMISE_BTN.style.height = `${MENU_HEIGHT}px`;
      MAXIMISE_BTN.classList.add('closeBarBtn');

      const MAXIMISE_IMG = document.createElement('img');
      MAXIMISE_IMG.style.width = '100%';
      MAXIMISE_IMG.style.height = '100%';
      MAXIMISE_IMG.style.padding = 0;
      MAXIMISE_IMG.style.margin = 0;
      MAXIMISE_IMG.classList.add('maximiseBtn');
      MAXIMISE_BTN.appendChild(MAXIMISE_IMG);

      CLOSE_BAR.appendChild(MAXIMISE_BTN);
    }

    if (CAN_CLOSE) {
      const CLOSE_BTN = document.createElement('button');
      CLOSE_BTN.style.width = `${MENU_HEIGHT}px`;
      CLOSE_BTN.style.height = `${MENU_HEIGHT}px`;
      CLOSE_BTN.classList.add('closeBarBtn');

      const CLOSE_IMG = document.createElement('img');
      CLOSE_IMG.style.width = '100%';
      CLOSE_IMG.style.height = '100%';
      CLOSE_IMG.style.padding = 0;
      CLOSE_IMG.style.margin = 0;
      CLOSE_IMG.classList.add('closeBtn');
      CLOSE_BTN.appendChild(CLOSE_IMG);

      CLOSE_BAR.appendChild(CLOSE_BTN);
    }
  }
}
