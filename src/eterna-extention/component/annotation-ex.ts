
import { Component, Vector3 } from "../../ngl";
import Annotation, { AnnotationParams } from "../../component/annotation";

export default class AnnotationEx extends Annotation {
    text: string 
    constructor (readonly component: Component, readonly position: Vector3, content: string, params: AnnotationParams = {}) {
        super(component, position, content, params);
        this.text = content; 
    }
  getCanvasPosition() {
    return this._canvasPosition;
  }
  getContent() {
    return this.text;
  }

  _update () {
    const cp = this._canvasPosition
    const vp = this._viewerPosition
    if (!this.getVisibility()) {
      cp.x = -10000;
      return;
    } 

    this._cameraPosition.copy(vp)
      .add(this.viewer.translationGroup.position)
      .applyMatrix4(this.viewer.rotationGroup.matrix)
      .sub(this.viewer.camera.position)

    this.stage.viewerControls.getPositionOnCanvas(vp, cp)

    if (this._cameraPosition.z < 0) {
      cp.x = -10000;
    } 
  }
}