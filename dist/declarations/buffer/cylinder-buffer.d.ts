/**
 * @file Cylinder Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */
import { Vector3, Matrix4 } from 'three';
import CylinderGeometryBuffer from './cylindergeometry-buffer';
import CylinderImpostorBuffer from './cylinderimpostor-buffer';
import { BufferData } from './buffer';
export interface CylinderBufferData extends BufferData {
    position1: Float32Array;
    position2: Float32Array;
    color2: Float32Array;
    radius: Float32Array;
}
export declare const CylinderBufferDefaultParameters: {
    disableImpostor: boolean;
} & {
    radialSegments: number;
    openEnded: boolean;
} & {
    opaqueBack: boolean;
    side: import("./buffer").BufferSide;
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
} & {
    openEnded: boolean;
};
export declare type CylinderBufferParameters = typeof CylinderBufferDefaultParameters;
declare const CylinderBuffer: {
    new (data: CylinderBufferData, params: Partial<CylinderBufferParameters>): CylinderGeometryBuffer | CylinderImpostorBuffer;
};
declare type CylinderBuffer = CylinderGeometryBuffer | CylinderImpostorBuffer;
export default CylinderBuffer;
