import Structure from '../../structure/structure';
import Stage, { StageParameters, StageLoadFileParams } from "../../stage/stage";
import { Box3 } from '../../ngl';
export interface PixiRenderCallback {
    (imgData: HTMLCanvasElement, width: number, height: number): void;
}
export interface ModelCheckCallback {
    (component: Structure | null): void;
}
declare class StageEx extends Stage {
    static checkModelFile(path: string | File | Blob, callback: ModelCheckCallback): Promise<void>;
    constructor(idOrElement: HTMLElement, params?: Partial<StageParameters>, pixiCallback?: PixiRenderCallback | undefined);
    loadFile(path: string | File | Blob, params?: Partial<StageLoadFileParams>, etherna_pairs?: number[]): Promise<void | import("../../component/component").default>;
    getZoomForBox(boundingBox: Box3): number;
}
export default StageEx;
