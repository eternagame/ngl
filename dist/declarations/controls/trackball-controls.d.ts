/**
 * @file Trackball Controls
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Matrix4 } from 'three';
import Stage from '../stage/stage';
import MouseObserver from '../stage/mouse-observer';
import Viewer from '../viewer/viewer';
import ViewerControls from './viewer-controls';
import AtomProxy from '../proxy/atom-proxy';
import Component from '../component/component';
export interface TrackballControlsParams {
    rotateSpeed?: number;
    zoomSpeed?: number;
    panSpeed?: number;
}
/**
 * Trackball controls
 */
declare class TrackballControls {
    readonly stage: Stage;
    viewer: Viewer;
    mouse: MouseObserver;
    controls: ViewerControls;
    rotateSpeed: number;
    zoomSpeed: number;
    panSpeed: number;
    constructor(stage: Stage, params?: TrackballControlsParams);
    get component(): Component | undefined;
    get atom(): AtomProxy | undefined;
    protected _setPanVector(x: number, y: number, z?: number): void;
    protected _getRotateXY(x: number, y: number): number[];
    protected _getCameraRotation(m: Matrix4): Matrix4;
    protected _transformPanVector(): void;
    zoom(delta: number): void;
    pan(x: number, y: number): void;
    panComponent(x: number, y: number): void;
    panAtom(x: number, y: number): void;
    rotate(x: number, y: number): void;
    zRotate(x: number, y: number): void;
    rotateComponent(x: number, y: number): void;
}
export default TrackballControls;
