
import { StageEx, ViewerEx } from "../../ngl";
import ViewerControls from "../../controls/viewer-controls";

export default class ViewerControlsEx extends ViewerControls {
    constructor (readonly stage: StageEx) {
        super(stage)
    }
    changed () {
        var viewer = <ViewerEx>this.viewer;
        viewer.extendHighlightTimer();
        super.changed();
    }
}