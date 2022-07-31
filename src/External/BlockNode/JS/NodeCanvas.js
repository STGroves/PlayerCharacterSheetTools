import DraggableElement from '../../Draggable/JS/Elements/DraggableElement.js';
import DraggableArea from '../../Draggable/JS/Elements/DraggableArea.js';
import ClassExtension from '../../ClassExtension/ClassExtension.js';
import Vector from '../../Vector.js';
import Extensions from '../../Extensions.js';
import BlockNode from './Nodes/BlockNode.js';
import { ContextMenu } from '../../ContextMenu/index.js';

// TO-DO: Create Menu Window (Window class?)
export default class NodeCanvas extends DraggableElement {
  static get CANVAS_CREATED() {
    return 'onCanvasCreated';
  }

  #nodes = {};

  #nodeParent = null;
  #grid = null;

  #protObj = null;

  get Canvas() {
    return this.#protObj.get('rootElement');
  }
  get NodeBase() {
    return this.#nodeParent;
  }
  get DraggableArea() {
    return this.#protObj.get('draggableArea');
  }
  get Nodes() {
    return this.#nodes;
  }
  get ContextMenu() {
    return this.#protObj.get('contextMenu');
  }

  constructor(rect, prot = {}) {
    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, NodeCanvas, prot);

    super(rect, document.createElementNS(Extensions.SVG_NS, 'svg'), { allowPassThroughEvents: false }, PROT_OBJ);
    this.#protObj = PROT_OBJ;

    this.#initialiseSVG();

    this.#protObj
      .set('setupEvents', (it, evt) => this.#setupEvents(it, evt))
      .set('determineMouseDown', (_it, evt) => this.#determineMouseDown(evt), false)
      .set('drag', (it, evt) => this.#drag(it, evt))
      .set('draggableArea', new DraggableArea(this.#protObj.get('rootElement'), NodeCanvas.convertDOMToCanvasSpace))
      .set('transform', this.#nodeParent.transform.baseVal.getItem(0))
      .set('contextMenu', null)
      .set('createContextMenu', () => NodeCanvas.#createContextMenu())
      .set('createContextMenuElements', () => NodeCanvas.#createContextMenuElements())
      .set('spawnNode', (_it, nodeType, position) => this.#spawnNode(nodeType, position));

    this.#protObj.get('setupEvents').next();
  }

  /* ************************* *
   *           Setup           *
   * ************************* */

  #initialiseSVG() {
    const PROT_GET = this.#protObj.get;
    const CANVAS = PROT_GET('rootElement');
    const RECT = PROT_GET('rect');

    CANVAS.setAttribute('data-transparentElement', true);
    CANVAS.setAttribute('x', RECT.X);
    CANVAS.setAttribute('y', RECT.Y);
    CANVAS.setAttribute('width', RECT.Width);
    CANVAS.setAttribute('height', RECT.Height);
    CANVAS.classList.add('canvas');

    const DEFS = document.createElementNS(Extensions.SVG_NS, 'defs');

    const SMALL_PATTERN = NodeCanvas.#createPattern({
      id: 'smallPattern',
      size: 10,
      colour: 'gray',
      thickness: 1,
    });

    this.#grid = NodeCanvas.#createPattern({
      id: 'largePattern',
      size: 100,
      colour: 'gray',
      thickness: 2,
    });

    this.#grid.insertBefore(NodeCanvas.#createPatternedRect('smallPattern'), this.#grid.lastElementChild);

    DEFS.appendChild(SMALL_PATTERN);
    DEFS.appendChild(this.#grid);

    CANVAS.appendChild(DEFS);
    CANVAS.appendChild(NodeCanvas.#createPatternedRect('largePattern'));

    this.#nodeParent = document.createElementNS(Extensions.SVG_NS, 'g');
    this.#nodeParent.setAttributeNS(null, 'transform', 'translate(0, 0)');
    CANVAS.appendChild(this.#nodeParent);

    document.body.appendChild(CANVAS);
  }

  static #createPatternedRect(pattern) {
    const RECT = document.createElementNS(Extensions.SVG_NS, 'rect');

    RECT.setAttributeNS(null, 'height', '100%');
    RECT.setAttributeNS(null, 'width', '100%');
    RECT.setAttributeNS(null, 'fill', `url(#${pattern})`);
    RECT.setAttribute('data-ignoreElement', true);

    return RECT;
  }

  static #createPattern(patternDetails) {
    const PATTERN = document.createElementNS(Extensions.SVG_NS, 'pattern');
    const SIZE = patternDetails.size;

    PATTERN.id = patternDetails.id;
    PATTERN.setAttributeNS(null, 'height', SIZE);
    PATTERN.setAttributeNS(null, 'width', SIZE);
    PATTERN.setAttributeNS(null, 'patternUnits', 'userSpaceOnUse');

    const PATH = document.createElementNS(Extensions.SVG_NS, 'path');

    PATH.setAttributeNS(null, 'd', `M${SIZE} 0 h-${SIZE} v${SIZE}`);
    PATH.setAttributeNS(null, 'fill', 'none');
    PATH.setAttributeNS(null, 'stroke', patternDetails.colour);
    PATH.setAttributeNS(null, 'stroke-width', patternDetails.thickness);

    PATTERN.appendChild(PATH);

    return PATTERN;
  }

  #setupEvents(it) {
    it.next();

    const PROT_GET = this.#protObj.get;

    this.#protObj
      .get('rootElement')
      .addEventListener(NodeCanvas.CANVAS_CREATED, (_event) => PROT_GET('createContextMenu').next());
    this.#protObj
      .get('rootElement')
      .addEventListener('contextmenu', (event) => PROT_GET('determineMouseDown').next(event));
  }

  /* ************************** *
   *           Canvas           *
   * ************************** */

  static convertDOMToCanvasSpace(position, transform) {
    return Vector.subtract(position, new Vector(transform.matrix.e, transform.matrix.f));
  }

  addNode(node, position) {
    this.#nodes[node.ID] = node;

    this.#nodeParent.appendChild(node.SVG);

    node.dispatchEvent(new CustomEvent(BlockNode.NODE_ADDED, { detail: position }));
  }

  /* ******************************** *
   *           Context Menu           *
   * ******************************** */

  #spawnNode(NodeType, position) {
    const TRUE_POS = this.#protObj.get('draggableArea').screenToSVG(position);

    const NEW_NODE = new NodeType();

    NEW_NODE.dispatchEvent(new CustomEvent(BlockNode.NODE_CREATED, null));

    this.addNode(NEW_NODE, TRUE_POS);

    return NEW_NODE;
  }

  static #createContextMenuElements() {
    ClassExtension.enforceAbstractMethod('createContextMenuElements', 'NodeCanvas');
  }

  static #createContextMenu() {
    const PROT_GET = this.#protObj.get;
    const ELEMENTS = PROT_GET('createContextMenuElements').next().value;

    this.#protObj.set('contextMenu', new ContextMenu('Nodes'));

    ELEMENTS.forEach((elem) => {
      PROT_GET('contextMenu').addElement(elem);
    });

    ContextMenu.Scope = PROT_GET('rootElement');
  }

  #createMenu(evt) {
    evt.preventDefault();

    const CONTEXT_MENU = this.#protObj.get('contextMenu');
    const SCOPED_POS = CONTEXT_MENU.limitPosition(new Vector(evt.clientX, evt.clientY), true);

    CONTEXT_MENU.show(SCOPED_POS, 10000);
  }

  /* ************************************* *
   *           Draggable Element           *
   * ************************************* */

  #determineMouseDown(evt) {
    const PROT_GET = this.#protObj.get;
    const CONTEXT_MENU = PROT_GET('contextMenu');

    if (evt.target.parentNode !== PROT_GET('rootElement')) return;

    if (CONTEXT_MENU.Open) CONTEXT_MENU.close();

    switch (evt.which) {
      case 1:
        PROT_GET('startDrag').next(evt);
        break;

      case 3:
        this.#createMenu(evt);
        break;

      default:
    }
  }

  #drag(it, evt) {
    const NEW_POS = it.next(evt).value;

    if (NEW_POS == null) return;

    this.#grid.setAttributeNS(null, 'x', NEW_POS.x);
    this.#grid.setAttributeNS(null, 'y', NEW_POS.y);
  }
}
