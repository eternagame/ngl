/**
 * @file Annotation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector2, Vector3 } from 'three'

import { defaults } from '../utils'
import Stage from '../stage/stage'
import Viewer from '../viewer/viewer'
import Component from './component'

export interface AnnotationParams {
  offsetX?: number
  offsetY?: number
  visible?: boolean
}

/**
 * Annotation 
 */
export default class Annotation {
  offsetX: number
  offsetY: number
  visible: boolean

  stage: Stage
  viewer: Viewer
  text: string //kkk

  private _viewerPosition: Vector3
  private _canvasPosition: Vector2
  private _cameraPosition: Vector3

  /**
   * @param {Component} component - the associated component
   * @param {Vector3} position - position in 3d
   * @param {String|Element} content - HTML content
   * @param {Object} [params] - parameters
   * @param {Integer} params.offsetX - 2d offset in x direction
   * @param {Integer} params.offsetY - 2d offset in y direction
   * @param {Boolean} params.visible - visibility flag
   */
  constructor (readonly component: Component, readonly position: Vector3, content: string, params: AnnotationParams = {}) {
    this.offsetX = defaults(params.offsetX, 0)
    this.offsetY = defaults(params.offsetY, 0)
    this.visible = defaults(params.visible, true)

    this.stage = component.stage
    this.viewer = component.stage.viewer

    this._viewerPosition = new Vector3()
    this._updateViewerPosition()
    this._canvasPosition = new Vector2()
    this._cameraPosition = new Vector3()

    this.text = content; //kkk
    this.viewer.signals.rendered.add(this._update, this)
    this.component.signals.matrixChanged.add(this._updateViewerPosition, this)
  }

  /**
   * Set HTML content of the annotation
   * @param {String|Element} value - HTML content
   * @return {undefined}
   */
  //kkk
  getCanvasPosition() {
    return this._canvasPosition;
  }
  getContent() {
    return this.text;
  }

  /**
   * Set visibility of the annotation
   * @param {Boolean} value - visibility flag
   * @return {undefined}
   */
  setVisibility (value: boolean) {
    this.visible = value
  }

  getVisibility () {
    return this.visible && this.component.parameters.visible
  }

  _updateViewerPosition () {
    this._viewerPosition
      .copy(this.position)
      .applyMatrix4(this.component.matrix)
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

  /**
   * Safely remove the annotation
   * @return {undefined}
   */
  dispose () {
    this.viewer.signals.ticked.remove(this._update, this)
    this.component.signals.matrixChanged.remove(this._updateViewerPosition, this)
  }
}