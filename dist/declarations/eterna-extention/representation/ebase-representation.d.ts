/**
 * @file Extended Base Representation for Eterna game
 * @author KKK
 * @private
 */
import BallAndStickRepresentation, { BallAndStickRepresentationParameters } from '../../representation/ballandstick-representation';
import { Structure } from '../../ngl';
import Viewer from '../../viewer/viewer';
import StructureView from '../../structure/structure-view';
import { AtomDataFields, AtomDataParams, BondDataFields, BondDataParams, BondData, AtomData } from '../../structure/structure-data';
import { StructureRepresentationData } from '../../representation/structure-representation';
export interface DivAnnotation {
    x: number;
    y: number;
    z: number;
    num: number;
    label: string;
}
export interface EBaseRepresentationParameters extends BallAndStickRepresentationParameters {
    vScale: number;
}
declare class EBaseRepresentation extends BallAndStickRepresentation {
    static divAnnotations: DivAnnotation[];
    constructor(structure: Structure, viewer: Viewer, params: Partial<EBaseRepresentationParameters>);
    init(params: Partial<EBaseRepresentationParameters>): void;
    getAtomData(sview: StructureView, what?: AtomDataFields, params?: AtomDataParams): AtomData;
    getBondData(sview: StructureView, what?: BondDataFields, params?: BondDataParams): BondData;
    fullBondData: BondData;
    createData(sview: StructureView): {
        bufferList: any[];
    };
    getAnnotations(): DivAnnotation[];
    resetAnnotations(): void;
    getPairData(data: BondData): BondData[] | null;
    updateData(what: BondDataFields | AtomDataFields, data: StructureRepresentationData): void;
}
export default EBaseRepresentation;
