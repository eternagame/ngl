import Stage, { StageParameters } from "../../stage/stage";
import { Box3 } from '../../ngl';
declare class StageEx extends Stage {
    constructor(idOrElement: HTMLElement, params?: Partial<StageParameters>);
    getZoomForBox(boundingBox: Box3): number;
}
export default StageEx;
