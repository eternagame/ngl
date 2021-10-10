/**
 * @file Annotation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector2, Vector3 } from 'three';
import Stage from '../stage/stage';
import Viewer from '../viewer/viewer';
import Component from './component';
export interface AnnotationParams {
    offsetX?: number;
    offsetY?: number;
    visible?: boolean;
}
/**
 * Annotation
 */
export default class Annotation {
    readonly component: Component;
    readonly position: Vector3;
    offsetX: number;
    offsetY: number;
    visible: boolean;
    stage: Stage;
    viewer: Viewer;
    text: string;
    private _viewerPosition;
    private _canvasPosition;
    private _cameraPosition;
    /**
     * @param {Component} component - the associated component
     * @param {Vector3} position - position in 3d
     * @param {String|Element} content - HTML content
     * @param {Object} [params] - parameters
     * @param {Integer} params.offsetX - 2d offset in x direction
     * @param {Integer} params.offsetY - 2d offset in y direction
     * @param {Boolean} params.visible - visibility flag
     */
    constructor(component: Component, position: Vector3, content: string, params?: AnnotationParams);
    /**
     * Set HTML content of the annotation
     * @param {String|Element} value - HTML content
     * @return {undefined}
     */
    getCanvasPosition(): Vector2;
    getContent(): string;
    /**
     * Set visibility of the annotation
     * @param {Boolean} value - visibility flag
     * @return {undefined}
     */
    setVisibility(value: boolean): void;
    getVisibility(): boolean;
    _updateViewerPosition(): void;
    _update(): void;
    /**
     * Safely remove the annotation
     * @return {undefined}
     */
    dispose(): void;
}
