import ClassExtension from '../../../ClassExtension/ClassExtension.js';
import BlockNode from './BlockNode.js';
import ConnectionPointLayoutEvent from '../Events/ConnectionPointLayoutEvent.js';
import Vector from '../../../Vector.js';
import Rect from '../../../Rect.js';
import ConnectionPoint from './ConnectionPoint.js';
import PathCreator from '../../../PathCreator/PathCreator.js';

export default class FunctionBlockNode extends BlockNode {
  #protObj = null;
  #inputFlags = null;

  get Inputs() {
    return this.#protObj.get('connections').slice(1);
  }

  /**
   * @constructor
   * @param {string} title
   * @param {BlockNode.ValueTypes} returnType
   * @param {BlockNode.ValueTypes[]} connectionTypes
   * @param {BlockNode.ValueTypes[]} inputTypes
   * @param {ProtectedObject} prot
   */
  constructor(canvas, title, returnType, connectionTypes, inputTypes, prot = {}) {
    const protObj = ClassExtension.enforceProtectedObject(new.target, FunctionBlockNode, prot);

    super(canvas, title, returnType, connectionTypes, prot);
    this.#protObj = protObj
      .set('onNodeCreated', (it, evt) => this.#onNodeCreated(it, evt))
      .set('handleConnectionPointLayoutChange', (it, event) => this.#handleConnectionPointLayoutChange(it, event))
      .set('createStyle', (it) => this.#createStyle(it))
      .set('calculateHeight', () => this.#calculateHeight())
      .set('drawMiddle', (_it, nodeData) => this.#drawMiddle(nodeData))
      .set('calculatePathConstants', (it) => this.#calculatePathConstants(it));

    this.#inputFlags = inputTypes;
  }

  #onNodeCreated(it, evt) {
    it.next(evt);

    this.#createInputZones();
  }

  #handleConnectionPointLayoutChange(it, evt) {
    it.next(evt);

    const PROT_GET = this.#protObj.get;
    const ID_ARRAY = evt.sourceConnectionPoint.ID.split('#INPUT');
    const EVT = evt;

    if (ID_ARRAY.length === 2) {
      const INPUTS = this.Inputs;
      const RECT = PROT_GET('rect');

      RECT.setDimensions(new Vector(RECT.Width, RECT.Height + evt.offset));
      PROT_GET('drawNode').next();

      for (let i = Number(ID_ARRAY[1]) + 1; i < INPUTS.length; i++) {
        INPUTS[i].updatePosition(evt.offset);
      }
    }

    if (this.Parent == null) return;

    EVT.sourceConnectionPoint = this.Parent.findConnection(this);
    this.Parent.dispatchEvent(new ConnectionPointLayoutEvent(EVT));
  }

  #createStyle(it) {
    it.next();

    const STYLE = this.#protObj.get('style');

    STYLE.midHeight = 35;
    STYLE.emptyInputHeight = 35;
  }

  #createInputZones() {
    const PROT_GET = this.#protObj.get;
    const STYLE = PROT_GET('style');

    const RECT_X = STYLE.leftOffset;
    const RECT_WIDTH = STYLE.minWidth - RECT_X;
    const RECT_HEIGHT = STYLE.emptyInputHeight;

    let rectY = STYLE.headerHeight;

    for (let i = 0; i < this.#inputFlags.length; i++) {
      const INPUT_RECT = new Rect(RECT_X, rectY, RECT_WIDTH, RECT_HEIGHT);

      PROT_GET('connections').push(
        new ConnectionPoint(
          {
            mainID: this.ID,
            postfix: `#INPUT${i}`,
          },
          INPUT_RECT,
          this.#inputFlags[i],
          this,
          ConnectionPoint.ConnectorTypes.INPUT
        )
      );

      rectY += RECT_HEIGHT + STYLE.midHeight;
    }
  }

  #calculateHeight() {
    const STYLE = this.#protObj.get('style');

    let height = STYLE.headerHeight + STYLE.footerHeight;

    const INPUTS = this.Inputs;

    for (let i = 0; i < INPUTS.length; i++) {
      height += INPUTS[i].Rect.Height;
    }

    return height + STYLE.midHeight * (INPUTS.length - 1);
  }

  #calculatePathConstants(it) {
    const STYLE = this.#protObj.get('style');

    it.next();

    const PATH_CONSTANTS = this.#protObj.get('pathConstants');

    PATH_CONSTANTS.upperMiddle = {
      outer: this.#calculateUpperMiddle(new PathCreator(Vector.Zero, Vector.Down), 0),
      inner: this.#calculateUpperMiddle(new PathCreator(Vector.Zero, Vector.Down), STYLE.borderSize),
    };

    PATH_CONSTANTS.lowerMiddle = [];

    for (let i = 0; i < this.Inputs.length; i++) {
      PATH_CONSTANTS.lowerMiddle.push({
        outer: this.#calculateMiddle(new PathCreator(Vector.Zero, Vector.Down), 0, i),
        inner: this.#calculateMiddle(new PathCreator(Vector.Zero, Vector.Down), STYLE.borderSize, i),
      });
    }
  }

  #calculateUpperMiddle(pathObj, offset) {
    const STYLE = this.#protObj.get('style');

    const NC = STYLE.cornerRadius;
    const NC2 = NC * 2;

    const WIDTH = this.#protObj.get('rect').Width;

    return pathObj
      .drawRadialCurve(NC - offset, 90)
      .drawGlobalX(-(WIDTH - NC2 - STYLE.leftOffset))
      .drawRadialCurve(NC + offset, -90);
  }

  #calculateMiddle(pathObj, offset, index) {
    const STYLE = this.#protObj.get('style');
    const NC = STYLE.cornerRadius;
    const WIDTH = this.#protObj.get('rect').Width;

    this.#protObj
      .get('calculateTeeth')
      .next(
        pathObj.drawRadialCurve(NC + offset, -90),
        offset,
        WIDTH - STYLE.leftOffset,
        this.Inputs[index].AcceptableConnections,
        BlockNode.ToothType.INSET
      );

    return pathObj.drawRadialCurve(NC - offset, 90);
  }

  #drawMiddle(nodeData) {
    const STYLE = this.#protObj.get('style');
    const NC2 = STYLE.cornerRadius * 2;
    const PATH_CONSTANTS = this.#protObj.get('pathConstants');

    for (let i = 0; i < this.Inputs.length; i++) {
      nodeData.outer
        .appendPath(PATH_CONSTANTS.upperMiddle.outer)
        .drawGlobalY(this.Inputs[i].Rect.Height - NC2)
        .appendPath(PATH_CONSTANTS.lowerMiddle[i].outer);
      nodeData.inner
        .appendPath(PATH_CONSTANTS.upperMiddle.inner)
        .drawGlobalY(this.Inputs[i].Rect.Height - NC2)
        .appendPath(PATH_CONSTANTS.lowerMiddle[i].inner);

      if (i === this.Inputs.length - 1) return nodeData;

      nodeData.outer.drawGlobalY(STYLE.midHeight - NC2);
      nodeData.inner.drawGlobalY(STYLE.midHeight - NC2);
    }

    return null;
  }
}
