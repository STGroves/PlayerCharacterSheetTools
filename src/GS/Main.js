const FIRST_TIME = "FirstTime";
const HUB = "Hub";
const BACKEND = "Backend";

const TRUE = "true";
const FALSE = "false";

const UI = SpreadsheetApp.getUi();
const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
const ID = SPREADSHEET.getId();

let ERROR = false;
let ERROR_MSG = "";

const onOpen = () => {
  if (isFirstTime_())
    showPopupBox_();  

  let adminMenu = UI.createMenu("Admin");

  adminMenu.addItem("Dice Roller", "showDiceRoller_")
           .addItem("Force Sync", "forceSync")
           .addItem("Macro Editor", "macroEditor_")
           .addItem("Reset Character Sheet", "resetCharacterSheet")
           .addToUi();

  createTriggers_();
}

function showDiceRoller_() {
  var widget = HtmlService.createTemplateFromFile("DiceRoller").evaluate();
  widget.setTitle("Dice Roller");
  UI.showSidebar(widget);
}

function macroEditor_() {
  var html = HtmlService.createTemplateFromFile('ME_Index')
      .evaluate()
      .setWidth(1000)
      .setHeight(1000)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  SpreadsheetApp.getUi().showModalDialog(html, 'Macro Editor');
}

function include(filename){
  return HtmlService.createTemplateFromFile(filename)
    .evaluate()
    .getContent();
};

function createTriggers_() {
  const triggers = ScriptApp.getProjectTriggers();

  if (triggers.findIndex(x => x.getEventType() === ScriptApp.EventType.ON_EDIT) < 0)
    ScriptApp.newTrigger("sendUpdate_").forSpreadsheet(SPREADSHEET).onEdit().create();
}

function isFirstTime_() {
  const docProperties = PropertiesService.getDocumentProperties();

  try {
    const firstTime = docProperties.getProperty(FIRST_TIME);
    
    if (firstTime !== null)
      return firstTime === TRUE;

    docProperties.setProperty(FIRST_TIME, TRUE);
    return true;
  }
  catch(err) {
    docProperties.setProperty(FIRST_TIME, TRUE);
    return true;
  }
}