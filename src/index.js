import main from './GS/Main';
import ME from './MacroEditor/GS/MacroEditor';

global.onOpen = main.onOpen;
global.macroEditor_ = main.macroEditor_;
global.include = main.include;
global.getStats = ME.getStats;
global.convertToUsable_ = ME.convertToUsable_;
global.getValueType_ = ME.getValueType_;
global.removeSheetName_ = ME.removeSheetName_;
