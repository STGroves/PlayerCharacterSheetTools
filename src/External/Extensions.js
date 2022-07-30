const SVG_NS = 'http://www.w3.org/2000/svg';
const Extender = (base, ...parts) => parts.reduce((allParts, part) => part(allParts), base);

function getDialogSize() {
  const BODY = document.body;
  const HTML = document.documentElement;

  const HEIGHT = Math.max(
    BODY.scrollHeight,
    BODY.offsetHeight,
    HTML.clientHeight,
    HTML.scrollHeight,
    HTML.offsetHeight
  );
  const WIDTH = Math.max(BODY.scrollWidth, BODY.offsetWidth, HTML.clientWidth, HTML.scrollWidth, HTML.offsetWidth);

  return { width: WIDTH, height: HEIGHT };
}

function findTypeInParents(target, targetType, root = null) {
  let currentTarget = target;
  while (currentTarget !== root) {
    currentTarget = target.parentNode;

    if (target == null) break;
    if (target.nodeName === targetType) return true;
  }

  return false;
}

function deepClone(obj) {
  const CLONE = {}; // the new empty object
  const KEYS = obj.Keys();

  for (const key in KEYS) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) CLONE[key] = obj[key];
  }
}

function createDropdownHTML(options, includeDefault = true) {
  const DROPDOWN = document.createElement('select');

  if (includeDefault) {
    const DEFAULT_OPTION = document.createElement('option');

    DEFAULT_OPTION.setAttribute('default', true);
    DEFAULT_OPTION.setAttribute('selected', true);
    DEFAULT_OPTION.setAttribute('hidden', true);
    DEFAULT_OPTION.innerHTML = 'Choose an Option...';

    DROPDOWN.appendChild(DEFAULT_OPTION);
  }

  if (options instanceof Object) {
    options.promiseObj.then((results) => {
      const FOUND_RESULTS = options.callback(results);

      FOUND_RESULTS.forEach((x) => {
        const OPTION = document.createElement('option');

        OPTION.value = x;
        OPTION.innerHTML = x;

        DROPDOWN.appendChild(OPTION);
      });
    });

    return DROPDOWN;
  }

  options.forEach((x) => {
    const OPTION = document.createElement('option');

    OPTION.value = x;
    OPTION.innerHTML = x;

    DROPDOWN.appendChild(OPTION);
  });

  return DROPDOWN;
}

function isWithinScope(x, y, scope, html) {
  const SCOPE_RECT = scope.getBoundingClientRect();
  const HTML_RECT = html.getBoundingClientRect();

  const SCOPE_OFFSET = { x: SCOPE_RECT.left, y: SCOPE_RECT.top };
  const SCOPE_POS = { x: x - SCOPE_OFFSET.x, y: y - SCOPE_OFFSET.y };
  const HTML_DIMS = { x: HTML_RECT.width, y: HTML_RECT.height };
  const OOB = { x: SCOPE_POS.x + HTML_DIMS.x, y: SCOPE_POS.y + HTML_DIMS.y };

  return OOB;
}

function promiseRun(func, ...args) {
  const RUN_ARGS = Array.prototype.slice.call(args).slice(1);

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    google.script.run
      .withSuccessHandler((result) => {
        resolve(result);
      })
      .withFailureHandler((error) => {
        reject(error);
      })
      [func].apply(this, RUN_ARGS);
  });
}

export default {
  SVG_NS,
  Extender,
  getDialogSize,
  findTypeInParents,
  deepClone,
  createDropdownHTML,
  isWithinScope,
  promiseRun,
};
