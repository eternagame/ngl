import Stage, {StageParameters} from "../../stage/stage";
import { Box3, Vector3 } from '../../ngl'
import { degToRad } from '../../math/math-utils'
import TrackballControlsEx from '../controls/trackball-controls-ex'
      
class StageEx extends Stage {
    constructor(idOrElement: HTMLElement, params: Partial<StageParameters> = {}) {
        super(idOrElement, params as StageParameters);

        this.trackballControls = new TrackballControlsEx(this)
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
