import { Vector3, Matrix4 } from 'three';
import GeometryBuffer from '../../buffer/geometry-buffer';
import { EllipsoidBufferData } from '../../buffer/ellipsoid-buffer';
export declare const EllipsoidExBufferDefaultParameters: {
    sphereDetail: number;
    vScale: number;
} & {
    opaqueBack: boolean;
    side: import("../../buffer/buffer").BufferSide;
    opacity: number;
    depthWrite: boolean;
    clipNear: number;
    clipRadius: number;
    clipCenter: Vector3;
    flatShaded: boolean;
    wireframe: boolean;
    roughness: number;
    metalness: number;
    diffuse: number;
    diffuseInterior: boolean;
    useInteriorColor: boolean;
    interiorColor: number;
    interiorDarkening: number;
    forceTransparent: boolean;
    matrix: Matrix4;
    disablePicking: boolean;
    sortParticles: boolean;
    background: boolean;
};
export declare type EllipsoidExBufferParameters = typeof EllipsoidExBufferDefaultParameters;
declare class EllipsoidExBuffer extends GeometryBuffer {
    updateNormals: boolean;
    get defaultParameters(): {
        sphereDetail: number;
        vScale: number;
    } & {
        opaqueBack: boolean;
        side: import("../../buffer/buffer").BufferSide;
        opacity: number;
        depthWrite: boolean;
        clipNear: number;
        clipRadius: number;
        clipCenter: Vector3;
        flatShaded: boolean;
        wireframe: boolean;
        roughness: number;
        metalness: number;
        diffuse: number;
        diffuseInterior: boolean;
        useInteriorColor: boolean;
        interiorColor: number;
        interiorDarkening: number;
        forceTransparent: boolean;
        matrix: Matrix4;
        disablePicking: boolean;
        sortParticles: boolean;
        background: boolean;
    };
    parameters: EllipsoidExBufferParameters;
    _majorAxis: Float32Array;
    _minorAxis: Float32Array;
    _radius: Float32Array;
    _vScale: number;
    constructor(data: EllipsoidBufferData, params?: Partial<EllipsoidExBufferParameters>);
    applyPositionTransform(matrix: Matrix4, i: number, i3: number): void;
    setAttributes(data?: Partial<EllipsoidBufferData>, initNormals?: boolean): void;
}
export default EllipsoidExBuffer;
