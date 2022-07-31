import BlockNode from './BlockNode.js';
import Extensions from '../../../Extensions.js';
import ClassExtension from '../../../ClassExtension/ClassExtension.js';
import ConnectionPointLayoutEvent from '../Events/ConnectionPointLayoutEvent.js';

const STAT_SELECTION = Extensions.promiseRun('getStats');

class ValueBlockNode extends BlockNode {
  #protObj = null;

  /**
   * @constructor
   * @param {string} title
   * @param {ValueType} returnType
   * @param {ValueType[]} connectionTypes
   * @param {{type: string, valueSelection: object}} typeData
   * @param {ProtectedObject} prot
   */
  constructor(title, returnType, connectionTypes, typeData, prot = {}) {
    const PROT_OBJ = ClassExtension.enforceProtectedObject(new.target, ValueBlockNode, prot);

    super(title, returnType, connectionTypes, PROT_OBJ);
    this.#protObj = PROT_OBJ.set('nodeType', typeData.type)
      .set('valueSelection', typeData.valueSelection)
      .set('createStyle', (it) => this.#createStyle(it))
      .set('createSVG', (it) => this.#createSVG(it))
      .set('handleConnectionPointLayoutChange', (it, event) => this.#handleConnectionPointLayoutChange(it, event))
      .set('calculateHeight', () => this.#calculateHeight(), false)
      .set('createStaticHTML', () => ValueBlockNode.#createStaticHTML())
      .set('clearStaticHTML', (_it, base) => ValueBlockNode.#clearStaticHTML(base))
      .set('drawMiddle', (_it, nodeData) => this.#drawMiddle(nodeData), false);
  }

  #createStyle(it) {
    it.next();

    const STYLE = this.#protObj.get('style');

    STYLE.midSection = 15;
  }

  #calculateHeight() {
    const STYLE = this.#protObj.get('style');

    return STYLE.headerHeight + STYLE.midSection + STYLE.footerHeight;
  }

  static #createStaticHTML() {
    ClassExtension.enforceAbstractMethod('#createStaticHTML', ValueBlockNode);
  }

  static #clearStaticHTML(base) {
    for (let i = 0; i < base.childNodes.length; i++) {
      const CHILD = base.childNodes[i];

      if (CHILD)
        switch (CHILD.type) {
          case 'button':
          case 'text':
          case 'submit':
          case 'password':
          case 'file':
          case 'email':
          case 'date':
          case 'number':
            CHILD.value = '';
            break;
          case 'checkbox':
          case 'radio':
            CHILD.checked = false;
            break;
          default:
        }
    }
  }

  #createSVG(it) {
    it.next();

    const PROT_GET = this.#protObj.get;
    const STYLE = PROT_GET('style');
    const SVG = PROT_GET('rootElement');

    const VAR_FOREIGN = document.createElementNS(Extensions.SVG_NS, 'foreignObject');

    VAR_FOREIGN.setAttribute('x', STYLE.leftOffset);
    VAR_FOREIGN.setAttribute('y', STYLE.headerHeight);
    VAR_FOREIGN.setAttribute('height', 20);
    VAR_FOREIGN.setAttribute('width', STYLE.minWidth - STYLE.padding - STYLE.leftOffset);
    VAR_FOREIGN.classList.add('hidden');

    const VARS = Extensions.createDropdownHTML({
      promiseObj: this.#protObj.get('valueSelection'),
      callback: (results) => {
        return results
          .filter((x) => x.testType === this.#protObj.get('nodeType'))
          .map((x) => {
            return x.name;
          });
      },
    });

    VAR_FOREIGN.appendChild(VARS);
    SVG.appendChild(VAR_FOREIGN);

    const STATIC_FOREIGN = document.createElementNS(Extensions.SVG_NS, 'foreignObject');
    this.#protObj.get('createStaticHTML').next(STATIC_FOREIGN);

    SVG.appendChild(STATIC_FOREIGN);

    const SWITCH_FOREIGN = document.createElementNS(Extensions.SVG_NS, 'foreignObject');
    const SWITCH_BTN = document.createElement('button');

    SWITCH_BTN.innerHTML = 'V';
    SWITCH_BTN.classList.add('switchBtn');
    SWITCH_BTN.classList.add('node_Text');
    SWITCH_BTN.classList.add(`${STYLE.cssClass}_Darker`);
    SWITCH_BTN.classList.add(`${STYLE.cssClass}_Lighter`);

    const BTN_DIMS = 20;

    SWITCH_FOREIGN.setAttribute('x', STYLE.minWidth - STYLE.padding - BTN_DIMS);
    SWITCH_FOREIGN.setAttribute('y', STYLE.toothDepth + STYLE.padding);
    SWITCH_FOREIGN.setAttribute('height', BTN_DIMS);
    SWITCH_FOREIGN.setAttribute('width', BTN_DIMS);

    SWITCH_FOREIGN.appendChild(SWITCH_BTN);

    SWITCH_BTN.addEventListener('click', () => {
      if (SWITCH_BTN.innerHTML === 'V') {
        VAR_FOREIGN.classList.remove('hidden');
        STATIC_FOREIGN.classList.add('hidden');
        this.#protObj.get('clearStaticHTML').next(STATIC_FOREIGN);
        SWITCH_BTN.innerHTML = 'S';
      } else {
        VAR_FOREIGN.classList.add('hidden');
        STATIC_FOREIGN.classList.remove('hidden');
        VARS.selectedIndex = 0;
        SWITCH_BTN.innerHTML = 'V';
      }
    });

    SVG.appendChild(SWITCH_FOREIGN);
  }

  #handleConnectionPointLayoutChange(it, evt) {
    it.next(evt);

    if (this.Parent == null) return;

    const EVT = evt;

    EVT.sourceConnectionPoint = this.Parent.findConnection(this);
    this.Parent.dispatchEvent(new ConnectionPointLayoutEvent(EVT));
  }

  #drawMiddle(nodeData) {
    const STYLE = this.#protObj.get('style');
    const NC2 = STYLE.cornerRadius * 2;

    return {
      outer: nodeData.outer.drawGlobalY(STYLE.midSection + NC2),
      inner: nodeData.inner.drawGlobalY(STYLE.midSection + NC2),
    };
  }
}

export default { ValueBlockNode, STAT_SELECTION };
