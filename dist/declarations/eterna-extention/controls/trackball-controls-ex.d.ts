import { StageEx } from "../../ngl";
import TrackballControls, { TrackballControlsParams } from "../../controls/trackball-controls";
export default class TrackballControlsEx extends TrackballControls {
    readonly stage: StageEx;
    constructor(stage: StageEx, params?: TrackballControlsParams);
    protected _setPanVector(x: number, y: number, z?: number): void;
    pan(x: number, y: number): void;
    rotate(x: number, y: number): void;
}
