import { StageEx } from "../../ngl";
import PickingControls from "../../controls/picking-controls";
import PickingProxyEx from "./picking-proxy-ex";
export default class PickingControlsEX extends PickingControls {
    readonly stage: StageEx;
    constructor(stage: StageEx);
    pick(x: number, y: number): PickingProxyEx | undefined;
}
