const LOG_FOLDER = "LogFolder";

function getSidebarProperty(property) {
  return PropertiesService.getUserProperties().getProperty(property);   
}

function setSidebarProperty(property, value) {
  return PropertiesService.getUserProperties().setProperty(property, value);   
}

function checkForLogs() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const folderID = scriptProperties.getProperty(LOG_FOLDER);

  try {
    let files = DriveApp.getFilesByName("logs.xml");

    console.log(files);

    while (files.hasNext()) {
      let file = files.next();
      let fileParents = file.getParents();

      while (fileParents.hasNext()) {
        let parent = fileParents.next();

        console.log(parent.getId());
        console.log(folderID);

        if (parent.getId() === folderID)
          return true;
      }
    }

    return false;
  }
  catch(error) {
    console.log(error);
    return false;
  }
}

function createXml() {
  let root = XmlService.createElement('logs');

  let document = XmlService.createDocument(root);
  let xml = XmlService.getPrettyFormat().format(document);

  const scriptProperties = PropertiesService.getScriptProperties();
  const folderID = scriptProperties.getProperty(LOG_FOLDER);

  try {
    let file = DriveApp.getFolderById(folderID).createFile('logs.xml', xml);

    scriptProperties.setProperty("LogID", file.getId());
  }
  catch(error) {
    console.log(error);
  }
}

function createLogEntry(raw, results) {
    const scriptProperties = PropertiesService.getScriptProperties();
    const file = DriveApp.getFileById(scriptProperties.getProperty("LogID"),);

    let document = XmlService.parse(file.getBlob().getDataAsString());
    let root = document.getRootElement();

    let child = XmlService.createElement('log')
        .setAttribute('raw', raw)
        .setAttribute('results', results)
        .setAttribute('date', new Date().toUTCString());
    root.addContent(child);

    let xml = XmlService.getPrettyFormat().format(document);

    file.setContent(xml);
}