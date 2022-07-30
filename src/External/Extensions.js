const SVG_NS = 'http://www.w3.org/2000/svg';

function getDialogSize() {
  const BODY = document.body;
  const HTML = document.documentElement;
  
  let HEIGHT = Math.max(BODY.scrollHeight, BODY.offsetHeight, HTML.clientHeight, HTML.scrollHeight, HTML.offsetHeight);
  let WIDTH = Math.max(BODY.scrollWidth, BODY.offsetWidth, HTML.clientWidth, HTML.scrollWidth, HTML.offsetWidth);

  return {width: WIDTH, height: HEIGHT};
}

function findTypeInParents(target, targetType, root = null) {
  while (target != root) {
    target = target.parentNode;

    if (target == null)
      break;

    if (target.nodeName == targetType)
      return true;
  }

  return false;
}

function deepClone(obj) {
  let clone = {}; // the new empty object

  // let's copy all user properties into it
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = user[obj];
    }
  }
}

function createDropdownHTML(options, includeDefault = true) {
  let dropdown = document.createElement('select');

  if (includeDefault) {
    let defaultOption = document.createElement('option');

    defaultOption.setAttribute("default", true);
    defaultOption.setAttribute("selected", true);
    defaultOption.setAttribute("hidden", true);
    defaultOption.innerHTML = "Choose an Option...";

    dropdown.appendChild(defaultOption);
  }

  if (options instanceof Object) {
    options.promiseObj.then((results) => {
      results = options.callback(results);

      results.forEach((x) => {
        let option = document.createElement('option');
    
        option.value = x;
        option.innerHTML = x;
    
        dropdown.appendChild(option);
      });
    });

    return dropdown;
  }

  options.forEach((x) => {
    let option = document.createElement('option');
    
    option.value = x;
    option.innerHTML = x;
    
    dropdown.appendChild(option);
  });

  return dropdown;
}

function isWithinScope(pos, scope, html) {
  const SCOPE_RECT = scope.getBoundingClientRect();
  const HTML_RECT = html.getBoundingClientRect();

  const SCOPE_OFFSET = new Vector(SCOPE_RECT.left, SCOPE_RECT.top);
  const SCOPE_POS = Vector.subtract(pos, SCOPE_OFFSET);
  const HTML_DIMS = new Vector(HTML_RECT.width, HTML_RECT.height);
  const OOB = Vector.add(SCOPE_POS, HTML_DIMS);

  return OOB;
}

const CREATOR = (allParts, part) => part(allParts);
const Extender = (base, ...parts) => parts.reduce(CREATOR, base);

function promiseRun(func) {
  let runArgs = Array.prototype.slice.call(arguments).slice(1);

  return new Promise (function (resolve, reject) {
    google.script.run
    .withSuccessHandler (function (result) {
      resolve (result);
    })
    .withFailureHandler (function (error) {
      reject (error);
    }) [func].apply (this, runArgs) ;
  });
}