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
 * Annotation HTML element floating on top of a position rendered in 3d
 */
export default class Annotation {
    readonly component: Component;
    readonly position: Vector3;
    offsetX: number;
    offsetY: number;
    visible: boolean;
    stage: Stage;
    viewer: Viewer;
    element: HTMLElement;
    protected _viewerPosition: Vector3;
    protected _canvasPosition: Vector2;
    protected _cameraPosition: Vector3;
    protected _clientRect: ClientRect;
    /**
     * @param {Component} component - the associated component
     * @param {Vector3} position - position in 3d
     * @param {String|Element} content - HTML content
     * @param {Object} [params] - parameters
     * @param {Integer} params.offsetX - 2d offset in x direction
     * @param {Integer} params.offsetY - 2d offset in y direction
     * @param {Boolean} params.visible - visibility flag
     */
    constructor(component: Component, position: Vector3, content: string | HTMLElement, params?: AnnotationParams);
    /**
     * Set HTML content of the annotation
     * @param {String|Element} value - HTML content
     * @return {undefined}
     */
    setContent(value: string | HTMLElement): void;
    /**
     * Set visibility of the annotation
     * @param {Boolean} value - visibility flag
     * @return {undefined}
     */
    setVisibility(value: boolean): void;
    getVisibility(): boolean;
    updateVisibility(): void;
    _updateViewerPosition(): void;
    _update(): void;
    /**
     * Safely remove the annotation
     * @return {undefined}
     */
    dispose(): void;
}
