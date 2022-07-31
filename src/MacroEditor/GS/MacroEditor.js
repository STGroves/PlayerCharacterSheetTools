function getStats() {
  const RANGES = SpreadsheetApp.getActiveSpreadsheet().getNamedRanges();

  const RESULTS = RANGES.map((element) => {
    const USABLE_VALUE = convertToUsable_(element.getRange().getValue());
    const NUMBER_FORMAT = element.getRange().getNumberFormat() === '';

    return {
      name: removeSheetName_(element.getName()),
      value: USABLE_VALUE,
      valueType: getValueType_(USABLE_VALUE),
      testType: NUMBER_FORMAT ? 'Text' : 'Number',
    };
  }).sort((a, b) => (a.name > b.name ? 1 : -1));

  return RESULTS;
}

function removeSheetName_(value) {
  const EULAV = value.split('').reverse().join('');
  const IDX = EULAV.length - EULAV.indexOf('!');

  return value.substring(IDX);
}

function convertToUsable_(value) {
  const PARSED = Number.parseInt(value, 10);

  return Number.isNaN(PARSED) ? value : PARSED;
}

function getValueType_(value) {
  if (!Number.isNaN(Number.parseInt(value, 10)) || /^\d+d\d+([+\-/\\*]{1}\d+)*$/.test(value)) return 'Number';

  return 'Text';
}

export default { getStats, removeSheetName_, convertToUsable_, getValueType_ };
