import { Component, Vector3 } from "../../ngl";
import Annotation, { AnnotationParams } from "../../component/annotation";
export default class AnnotationEx extends Annotation {
    readonly component: Component;
    readonly position: Vector3;
    text: string;
    constructor(component: Component, position: Vector3, content: string, params?: AnnotationParams);
    getCanvasPosition(): import("three/src/math/Vector2").Vector2;
    getContent(): string;
    _update(): void;
}
