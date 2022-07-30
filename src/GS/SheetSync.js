function resetCharacterSheet() {
  let result = UI.alert("Warning!", "Are you sure you want to reset this file?", UI.ButtonSet.YES_NO);
  
  if (result === UI.Button.NO)
    return;

  const docProperties = PropertiesService.getDocumentProperties();
  docProperties.deleteAllProperties();

  //Homuli.resetCharacterSheet();
}

function showPopupBox_() {
  while (true) {
    let result = UI.prompt("Welcome to Homuli: End of Days!", "Please enter your name:", UI.ButtonSet.OK);

    let button = result.getSelectedButton();
    let text = result.getResponseText();
 
    if (button !== UI.Button.OK)
      continue;
    
    sendData_({ID: ID, Job: "newPlayer", Contents: text});

    if (ERROR) {
      UI.alert("New Sync Failed", text + " already exists!", UI.ButtonSet.OK);
      UI.alert(ERROR_MSG, UI.ButtonSet.OK);
      continue;
    }

    const docProperties = PropertiesService.getDocumentProperties();
    docProperties.setProperty(FIRST_TIME, FALSE);
    

    UI.alert('Thank you, ' + text + '.');
    return;
  }
}

function sendUpdate_(event) {
  const range = event.range;
  const value = Homuli.getCompleteRangeData(range);

  if (Homuli.getRangeFromName("Player", range.getSheet()).getA1Notation() === range.getMergedRanges()[0].getA1Notation())
  {
    updateCharacterName_(event.oldValue, value);
    return;
  }

  const scriptProperties = PropertiesService.getScriptProperties();

  sendData_({ID: ID, Job: "updateValues", Contents: value});
}

function changeTest(event) {
  console.log(event);
}

function updateCharacterName_(oldName, value)
{
  sendData_({ID: ID, Job: "updatePlayerName", Contents: value});

  const name = value.Values.flat()[0];

  if (ERROR) {
    UI.alert("Rename Failed", name + " already exists!", UI.ButtonSet.OK);
    UI.alert(ERROR_MSG.stack, UI.ButtonSet.OK);
    SPREADSHEET.getActiveCell().setValue(oldName);
    return;
  }
  
  SPREADSHEET.renameActiveSheet(name);
  SPREADSHEET.rename(name + "'" + (name.slice(-1) == "s" ? "" : "s") + " Sheet");
}

function handleData(data) {
  const id = data.ID;
  const job = data.Job;
  const contents = data.Contents;

  switch (job)
  {
    case "error":
      ERROR = true;
      ERROR_MSG = contents;
      break;

    case "updatePlayerName":
      updatePlayerName_(id, contents);
      break;
    
    case "forceUpdate":
      forceUpdate_(id, contents);
      break;
    
    case "updateValues":
      updateValues_(id, contents);
  }
}

function sendData_(data) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const hub = scriptProperties.getProperty(HUB);

  const spreadsheet = SpreadsheetApp.openById(hub);
  SpreadsheetApp.setActiveSpreadsheet(spreadsheet);

  Homuli.handleData(data);
}