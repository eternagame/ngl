import { StageEx } from "../../ngl";
import ViewerControls from "../../controls/viewer-controls";
export default class ViewerControlsEx extends ViewerControls {
    readonly stage: StageEx;
    constructor(stage: StageEx);
    changed(): void;
}
