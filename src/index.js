import main from './GS/Main';
import ME from './MacroEditor/GS/MacroEditor';
import GE from './GS/Extensions';

global.onOpen = main.onOpen;
global.macroEditor_ = main.macroEditor_;
global.include = main.include;
global.getStats = ME.getStats;
global.convertToUsable_ = ME.convertToUsable_;
global.getValueType_ = ME.getValueType_;
global.removeSheetName_ = ME.removeSheetName_;
global.getUUID = GE.getUUID;
