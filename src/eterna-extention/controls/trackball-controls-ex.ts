
import { Matrix4, Quaternion, StageEx, Vector3 } from "../../ngl";
import TrackballControls, { TrackballControlsParams } from "../../controls/trackball-controls";

const tmpRotateMatrix = new Matrix4()
const tmpRotateVector = new Vector3()
const tmpRotateQuaternion = new Quaternion()
const tmpRotateQuaternion2 = new Quaternion()
const tmpPanVector = new Vector3()

export default class TrackballControlsEx extends TrackballControls {
    constructor (readonly stage: StageEx, params: TrackballControlsParams = {}) {
        super(stage, params);
    }
    protected _setPanVector (x: number, y: number, z = 0) {
        const scaleFactor = this.controls.getCanvasScaleFactor(z)
        tmpPanVector.set(x, y, 0)
        tmpPanVector.multiplyScalar(this.panSpeed * scaleFactor)
    }
    pan (x: number, y: number) {
        this._setPanVector(x, y)
    
        this.controls.translate(tmpPanVector)
    }
    rotate (x: number, y: number) {
        const [ dx, dy ] = this._getRotateXY(x, y)
    
        // rotate around screen X then screen Y
        this._getCameraRotation(tmpRotateMatrix)
        tmpRotateVector.set(1, 0, 0) // X axis
        // tmpRotateVector.applyMatrix4(tmpRotateMatrix) // screen X 
        tmpRotateQuaternion.setFromAxisAngle(tmpRotateVector, dy)
    
        tmpRotateVector.set(0, 1, 0) // Y axis
        // tmpRotateVector.applyMatrix4(tmpRotateMatrix) // screen Y 
        tmpRotateQuaternion2.setFromAxisAngle(tmpRotateVector, dx)
    
        tmpRotateQuaternion.multiply(tmpRotateQuaternion2)
        tmpRotateMatrix.makeRotationFromQuaternion(tmpRotateQuaternion)
    
        this.controls.applyRotateMatrix(tmpRotateMatrix);
    }
    
}