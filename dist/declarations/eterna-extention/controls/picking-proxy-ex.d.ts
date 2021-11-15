import { StageEx } from "../../ngl";
import PickingProxy, { PickingData } from "../../controls/picking-proxy";
export default class PickingProxyEx extends PickingProxy {
    readonly stage: StageEx;
    constructor(pickingData: PickingData, stage: StageEx);
    getLabel(): string;
    checkBase(): any;
}
