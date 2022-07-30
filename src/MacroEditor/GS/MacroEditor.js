function getStats() {
  const ranges = SpreadsheetApp.getActiveSpreadsheet().getNamedRanges();

  let results = ranges.map(element => {
    const usableValue = convertToUsable_(element.getRange().getValue());

    return {
      name: removeSheetName_(element.getName()),
      value: usableValue,
      valueType: getValueType_(usableValue),
      testType: element.getRange().getNumberFormat() == "" ? "Text" : "Number"
    };
  }).sort((a, b) => (a.name > b.name) ? 1 : -1);
  
  return results;
}

function removeSheetName_(value) {
  const eulav = value.split("").reverse().join("");
  const idx = eulav.length - eulav.indexOf("!");

  return value.substring(idx);
}

function convertToUsable_(value) {
  const parsed = Number.parseInt(value);

  return Number.isNaN(parsed) ? value : parsed;
}

function getValueType_(value) {
  if (!Number.isNaN(Number.parseInt(value)) || new RegExp(/^\d+d\d+([+\-/\*]{1}\d+)*$/).test(value))
    return "Number";

  return "Text";
}