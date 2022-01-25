/// <reference types="node" />
import Stage from '../../stage/stage';
import { Vector3, Group, SpriteMaterial, Sprite } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import Viewer from "../../viewer/viewer";
declare class Spark {
    sparkArray: Sprite[];
    textSprite: Sprite | null;
    size: number;
    counter: number;
    period: number;
    polling: NodeJS.Timeout;
    unit: Vector3[];
    material: SpriteMaterial;
    center: Vector3;
    reset(): void;
    setURL(url1: string): void;
    makeTextSprite(message: string): void;
}
export default class ViewerEx extends Viewer {
    protected hoverBaseGroup: Group;
    protected selectBaseGroup: Group;
    protected markGroup: Group;
    protected sparkGroup: Group;
    protected sparkSpriteGroup: Group;
    spark: Spark;
    composer: EffectComposer;
    selectOutlinePass: OutlinePass;
    effectFXAA: ShaderPass;
    flashCount: number;
    ethernaMode: any;
    highlightTimer: NodeJS.Timeout;
    highlightTimeout: number;
    protected stage: Stage;
    etherna_pairs: number[] | undefined;
    etherna_sequence: string;
    constructor(idOrElement: HTMLElement, stage: Stage);
    protected _initScene(): void;
}
export {};
