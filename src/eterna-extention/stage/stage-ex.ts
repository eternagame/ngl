import {
  ParserRegistry
} from '../../globals'
import { defaults, createParams } from '../../utils'
import ViewerEx from '../viewer/viewer-ex'
import MouseObserver from '../../stage/mouse-observer'

import PickingControlsEx from '../controls/picking-controls-ex'
import AnimationControls from '../../controls/animation-controls'
import MouseControls from '../../controls/mouse-controls'
import KeyControls from '../../controls/key-controls'

import PickingBehavior from '../../stage/picking-behavior'
import MouseBehavior from '../../stage/mouse-behavior'
import AnimationBehavior from '../../stage/animation-behavior'
import KeyBehavior from '../../stage/key-behavior'

import { autoLoad, getFileInfo } from '../../loader/loader-utils'
// import AtomProxy from '../proxy/atom-proxy'
// import Animation from '../animation/animation'
// import Selection from '../selection/selection'

import Structure from '../../structure/structure'
import Surface from '../../surface/surface'
import Volume from '../../surface/volume'

import Stage, {StageDefaultParameters, StageParameters, StageLoadFileParams} from "../../stage/stage";
import ViewerControlsEx from '../controls/viewer-controls-ex'
import { Box3, Vector3 } from '../../ngl'
import { degToRad } from '../../math/math-utils'
import TrackballControlsEx from '../controls/trackball-controls-ex'

export interface PixiRenderCallback {
    (imgData: HTMLCanvasElement, width:number, height:number): void;
}
  
export interface ModelCheckCallback {
    (component: Structure | null): void;
}

StageDefaultParameters.lightColor = 0xffffff;
StageDefaultParameters.ambientColor = 0xffffff;
      
class StageEx extends Stage {

    static checkModelFile(path: string | File | Blob, callback: ModelCheckCallback) {
        var params: Partial<StageLoadFileParams> = {};
        const p = Object.assign({}, {}, params)
        // const name = getFileInfo(path).name

        const onLoadFn = (object: Structure | Surface | Volume) => {
        if(object instanceof Structure)
            callback(object);
        else 
            callback(null);
        }

        const onErrorFn = (e: Error | string) => {
        callback(null);
        }

        const ext = defaults(p.ext, getFileInfo(path).ext)
        let promise: Promise<any>

        if (ParserRegistry.isTrajectory(ext)) {
        promise = Promise.reject(
            new Error(`loadFile: ext '${ext}' is a trajectory and must be loaded into a structure component`)
        )
        } else {
        promise = autoLoad(path, p)
        }

        return promise.then(onLoadFn, onErrorFn)
    }

    constructor(idOrElement: HTMLElement, params: Partial<StageParameters> = {}, 
        pixiCallback:PixiRenderCallback|undefined = undefined) {
        super(idOrElement, params as StageParameters);
        this.viewer.dispose();

        this.viewer = new ViewerEx(idOrElement, this, pixiCallback) 
        if (!this.viewer.renderer) return

        this.viewer.container.appendChild(this.tooltip)

        this.mouseObserver = new MouseObserver(this.viewer.renderer.domElement)
        this.mouseObserver.viewer = this.viewer; 
        this.viewerControls = new ViewerControlsEx(this)
        this.trackballControls = new TrackballControlsEx(this)
        this.pickingControls = new PickingControlsEx(this)
        this.animationControls = new AnimationControls(this)
        this.mouseControls = new MouseControls(this)
        this.keyControls = new KeyControls(this)

        this.pickingBehavior = new PickingBehavior(this)
        this.mouseBehavior = new MouseBehavior(this)
        this.animationBehavior = new AnimationBehavior(this)
        this.keyBehavior = new KeyBehavior(this)

        this.spinAnimation = this.animationControls.spin([0, 1, 0], 0.005)
        this.spinAnimation.pause(true)
        this.rockAnimation = this.animationControls.rock([0, 1, 0], 0.005)
        this.rockAnimation.pause(true)

        // must come after the viewer has been instantiated
        this.parameters = createParams(params, StageDefaultParameters)
        this.setParameters(this.parameters)

        this.viewer.animate()
    }
    loadFile(path: string | File | Blob, params: Partial<StageLoadFileParams> = {}, etherna_pairs: number[] = []) {
        (<ViewerEx>this.viewer).setEthernaPairs(etherna_pairs);
        return super.loadFile(path, params); 
    }
    getZoomForBox(boundingBox: Box3) {
        const tmpZoomVector = new Vector3()
        const bbSize = boundingBox.getSize(tmpZoomVector)
        const maxSize = Math.max(bbSize.x, bbSize.y, bbSize.z)
        const minSize = Math.min(bbSize.x, bbSize.y, bbSize.z)
        let distance = maxSize + Math.sqrt(minSize)
    
        const fov = degToRad(this.viewer.perspectiveCamera.fov)
        const width = this.viewer.width
        const height = this.viewer.height
        const aspect = width / height
        const aspectFactor = (height < width ? 1 : aspect)
    
        distance = Math.abs(
          ((distance * 0.5) / aspectFactor) / Math.sin(fov / 2) 
        )
        distance += this.parameters.clipDist
        return -distance
    }
}

export default StageEx
