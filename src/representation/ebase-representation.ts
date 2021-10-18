/**
 * @file Extended Base Representation for Eterna game
 * @author KKK
 * @private
 */

import { RepresentationRegistry } from '../globals'
import { defaults } from '../utils'
import BallAndStickRepresentation, { BallAndStickRepresentationParameters } from './ballandstick-representation'
import { Structure } from '../ngl';
import Viewer from '../viewer/viewer';
import StructureView from '../structure/structure-view';
import { AtomDataFields, AtomDataParams, BondDataFields, BondDataParams, BondData, AtomData } from '../structure/structure-data';
import EllipsoidBuffer, { EllipsoidBufferData } from '../buffer/ellipsoid-buffer'
import WideLineBuffer from '../buffer/wideline-buffer'
import { StructureRepresentationData } from './structure-representation';
import AtomProxy from '../proxy/atom-proxy';
import CylinderBuffer, { CylinderBufferData } from '../buffer/cylinder-buffer'
import CylinderGeometryBuffer from '../buffer/cylindergeometry-buffer'
import ConeBuffer, { ConeBufferData } from '../buffer/cone-buffer'


/**
 * Base representation. Show cylinders for RNA/DNA ladders.
 *
 * __Name:__ _base_
 *
 * @example
 * stage.loadFile( "rcsb://1d66" ).then( function( o ){
 *     o.addRepresentation( "cartoon", { sele: "nucleic" } );
 *     o.addRepresentation( "base", { color: "resname" } );
 *     o.autoView( "nucleic" );
 * } );
 */
class EBaseRepresentation extends BallAndStickRepresentation {
    /**
     * @param  {Structure} structure - the structure object
     * @param  {Viewer} viewer - the viewer object
     * @param  {BallAndStickRepresentationParameters} params - parameters object
     */
    constructor(structure: Structure, viewer: Viewer, params: Partial<BallAndStickRepresentationParameters>) {
        super(structure, viewer, params)

        this.type = 'ebase'

        this.parameters = Object.assign({

        }, this.parameters, {

            multipleBond: null,
            bondSpacing: null

        })
    }

    init(params: Partial<BallAndStickRepresentationParameters>) {
        let p = params || {}
        p.aspectRatio = defaults(p.aspectRatio, 1.0)
        p.radiusSize = defaults(p.radiusSize, 0.3)
        this.vScale = defaults(p.vScale, 1)

        super.init(p)
    }

    getAtomData(sview: StructureView, what?: AtomDataFields, params?: AtomDataParams): AtomData {
        return sview.getRungAtomData(this.getAtomParams(what, params))
    }

    getBondData(sview: StructureView, what?: BondDataFields, params?: BondDataParams): BondData {
        let p = this.getBondParams(what, params)
        Object.assign(p.colorParams, { rung: true })

        return sview.getRungBondData(p)
    }

    fullBondData: BondData;

    createData(sview: StructureView) {
        const bufferList: any[] = []

        let p = this.getBondParams({ position: true, picking: true })
        let rawBondData = sview.getBondData(p);

        var bondData = this.getBondData(sview);
        // console.log(bondData, rawBondData);
        // console.log(bondData.picking, rawBondData.picking);
        this.fullBondData = bondData;

        var pos1 = bondData.position1;
        var pos2 = bondData.position2;
        var majorAxis = new Array();
        var minorAxis = new Array();
        if (pos1 && pos2) {
            var position = new Float32Array(pos1.length);
            var radius = new Float32Array(pos1.length / 3);
            for (var i = 0; i < pos1.length / 3; i++) {
                var i3 = i * 3;
                position[i3] = (pos1[i3] + pos2[i3]) / 2;
                position[i3 + 1] = (pos1[i3 + 1] + pos2[i3 + 1]) / 2;
                position[i3 + 2] = (pos1[i3 + 2] + pos2[i3 + 2]) / 2;

                var r = 0;
                r += (pos1[i3] - position[i3]) * (pos1[i3] - position[i3]);
                r += (pos1[i3 + 1] - position[i3 + 1]) * (pos1[i3 + 1] - position[i3 + 1]);
                r += (pos1[i3 + 2] - position[i3 + 2]) * (pos1[i3 + 2] - position[i3 + 2]);
                radius[i] = Math.sqrt(r);

                var x = (pos2[i3] - position[i3]);
                var y = (pos2[i3 + 1] - position[i3 + 1]);
                var z = (pos2[i3 + 2] - position[i3 + 2]);
                majorAxis.push(x);
                majorAxis.push(y);
                majorAxis.push(z);
                // console.log('major', x, y, z); 

                const annotation = {x:position[i3], y:position[i3+1], z:position[i3+2], num:i, label: (i+1)+''};
                this.divAnnotations.push(annotation); 

                var x1, y1, z1, d1;
                if (bondData.picking && rawBondData.picking) {
                    var atomIndex2 = bondData.picking.bondStore.atomIndex2;
                    let id = atomIndex2[i];
                    var id2;
                    var n1;
                    if (n1 = rawBondData.picking.bondStore.atomIndex1.indexOf(id), n1 >= 0) {
                        id2 = rawBondData.picking.bondStore.atomIndex2[n1];
                    }
                    else if (n1 = rawBondData.picking.bondStore.atomIndex2.indexOf(id), n1 >= 0) {
                        id2 = rawBondData.picking.bondStore.atomIndex1[n1];
                    }
                    else id2 = id + 1;
                    let ap1 = new AtomProxy(bondData.picking.structure);
                    ap1.index = id;
                    let ap2 = new AtomProxy(bondData.picking.structure);
                    ap2.index = id2;
                    var dx, dy, dz;
                    dx = ap2.x - ap1.x;
                    dy = ap2.y - ap1.y;
                    dz = ap2.z - ap1.z;
                    x1 = y * dz - z * dy;
                    y1 = z * dx - x * dz;
                    z1 = x * dy - y * dx;
                }
                else {
                    if (z != 0) {
                        x1 = 1, y1 = 1;
                        z1 = -(x1 * x + y1 * y) / z;
                    }
                    else if (y != 0) {
                        x1 = 1, z1 = 1;
                        y1 = -(x1 * x + z1 * z) / y;

                    }
                    else {
                        y1 = 1, z1 = 1;
                        x1 = -(y1 * y + z1 * z) / x;
                    }
                }
                d1 = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1);
                x1 /= d1;
                y1 /= d1;
                z1 /= d1;
                // console.log('minor', x1, y1, z1);
                const wScale = 0.05;
                minorAxis.push(x1 * r * wScale);
                minorAxis.push(y1 * r * wScale);
                minorAxis.push(z1 * r * wScale);
            }
            // console.log(bondData);
            const dataParam: EllipsoidBufferData = bondData as EllipsoidBufferData;
            dataParam.position = position;
            dataParam.color = bondData.color;
            dataParam.radius = radius;
            dataParam.vScale = this.vScale;
            dataParam.majorAxis = new Float32Array(majorAxis);
            dataParam.minorAxis = new Float32Array(minorAxis);
            const elilipsoidBuffer = new EllipsoidBuffer(dataParam)
            elilipsoidBuffer.geometry.name = 'ebase';

            bufferList.push(elilipsoidBuffer as EllipsoidBuffer)

            var pairsDatas = this.getPairData(bondData);
            if (pairsDatas !== null) {
                if (pairsDatas.length == 1) {
                    const cylinderBuffer = new CylinderBuffer(
                        (pairsDatas[0] as CylinderBufferData),
                        this.getBufferParams({
                            openEnded: false,//this.openEnded,
                            radialSegments: this.radialSegments,
                            disableImpostor: this.disableImpostor,
                            dullInterior: true
                        })
                    )
                    bufferList.push(cylinderBuffer as CylinderGeometryBuffer);
                }
                else {
                    const coneBuffer = new ConeBuffer(
                        (pairsDatas[0] as ConeBufferData),
                        this.getBufferParams({
                            openEnded: false,//this.openEnded,
                            radialSegments: this.radialSegments,
                            disableImpostor: this.disableImpostor,
                            dullInterior: true
                        })
                    )
                    bufferList.push(coneBuffer);

                    const coneBuffer2 = new ConeBuffer(
                        (pairsDatas[1] as ConeBufferData),
                        this.getBufferParams({
                            openEnded: false,//this.openEnded,
                            radialSegments: this.radialSegments,
                            disableImpostor: this.disableImpostor,
                            dullInterior: true
                        })
                    )
                    bufferList.push(coneBuffer2);

                    const lineBuffer = new WideLineBuffer(
                        pairsDatas[2],
                        this.getBufferParams({ linewidth: 1 })
                    )
                    bufferList.push(lineBuffer);
                }
            }
        }
        return {
            bufferList: bufferList
        }
    }

    getPairData(data: BondData) {
        if (this.viewer.etherna_pairs !== undefined && data.position2 !== undefined) {
            var pos01 = [];
            var pos02 = [];
            var colors0: number[] = [];
            var pos1 = [];
            var pos2 = [];
            var colors: number[] = [];
            var radius: number[] = [];
            var pairMap = new Map();
            var strengthArrray = [];
            for (var i = 0; i < this.viewer.etherna_pairs.length; i++) {
                var pairNum = this.viewer.etherna_pairs[i];
                if (pairNum < 0) continue;
                if (pairMap.get(i) === pairNum || pairMap.get(pairNum) === i) continue;
                pairMap.set(i, pairNum);

                let strength = 0;
                if (this.viewer.etherna_sequence.length > 0) {
                    var seq = this.viewer.etherna_sequence;
                    if (seq[i] == 'G' && seq[pairNum] == 'C' || seq[i] == 'C' && seq[pairNum] == 'G')
                        strength = 3;
                    else if (seq[i] == 'A' && seq[pairNum] == 'U' || seq[i] == 'U' && seq[pairNum] == 'A')
                        strength = 2;
                    else if (seq[i] == 'U' && seq[pairNum] == 'G' || seq[i] == 'G' && seq[pairNum] == 'U')
                        strength = 1;
                }
                else if (data.picking) {
                    var atomIndex2 = data.picking.bondStore.atomIndex2;
                    let id1 = atomIndex2[i];
                    let id2 = atomIndex2[pairNum];
                    let ap1 = new AtomProxy(data.picking.structure);
                    ap1.index = id1;
                    let ap2 = new AtomProxy(data.picking.structure);
                    ap2.index = id2;
                    if (ap1.resname == 'G' && ap2.resname == 'C' || ap1.resname == 'C' && ap2.resname == 'G')
                        strength = 3;
                    else if (ap1.resname == 'A' && ap2.resname == 'U' || ap1.resname == 'U' && ap2.resname == 'A')
                        strength = 2;
                    else if (ap1.resname == 'U' && ap2.resname == 'G' || ap1.resname == 'G' && ap2.resname == 'U')
                        strength = 1;
                }
                // if (strength == 0) continue;

                var x1 = data.position2[i * 3], y1 = data.position2[i * 3 + 1], z1 = data.position2[i * 3 + 2];
                var x2 = data.position2[pairNum * 3], y2 = data.position2[pairNum * 3 + 1], z2 = data.position2[pairNum * 3 + 2];
                var dx = x2 - x1;
                x1 = x1 + dx / 40;
                x2 = x2 - dx / 40;
                var dy = y2 - y1;
                y1 = y1 + dy / 40;
                y2 = y2 - dy / 40;
                var dz = z2 - z1;
                z1 = z1 + dz / 40;
                z2 = z2 - dz / 40;
                if(strength>0) {
                    pos1.push(x1);
                    pos1.push(y1);
                    pos1.push(z1);
                    pos2.push(x2);
                    pos2.push(y2);
                    pos2.push(z2);

                    radius.push(0.2 * strength);
                    strengthArrray.push(strength);
                }
                else {
                    pos01.push(x1);
                    pos01.push(y1);
                    pos01.push(z1);
                    pos02.push(x2);
                    pos02.push(y2);
                    pos02.push(z2);
                }

                if (strength == 3) {
                    var color:number = this.viewer.ethernaMode.highColor;
                    var r = color >> 16 & 255
                    var g = color >> 8 & 255
                    var b = color & 255
                    colors.push(r/255.0);
                    colors.push(g/255.0);
                    colors.push(b/255.0);
                }
                else if (strength == 2) {
                    var color:number = this.viewer.ethernaMode.mediumColor;
                    var r = color >> 16 & 255
                    var g = color >> 8 & 255
                    var b = color & 255
                    colors.push(r/255.0);
                    colors.push(g/255.0);
                    colors.push(b/255.0);
                }
                else if (strength == 1) {
                    var color:number = this.viewer.ethernaMode.weakColor;
                    var r = color >> 16 & 255
                    var g = color >> 8 & 255
                    var b = color & 255
                    colors.push(r/255.0);
                    colors.push(g/255.0);
                    colors.push(b/255.0);
                }
                else {
                    var color:number = this.viewer.ethernaMode.zeroColor;
                    var r = color >> 16 & 255
                    var g = color >> 8 & 255
                    var b = color & 255
                    colors0.push(r/255.0);
                    colors0.push(g/255.0);
                    colors0.push(b/255.0);
                }
            }
            const bondData: BondData = {}
            bondData.position1 = new Float32Array(pos1)
            bondData.position2 = new Float32Array(pos2)
            bondData.radius = new Float32Array(radius);
            bondData.color = new Float32Array(colors);
            bondData.color2 = new Float32Array(colors);

            var weight = [0.0, 0.55, 0.8, 1.0];
            var rweight = [0, 4, 4, 4];
            var pos1 = [];
            if (bondData.position1 && bondData.position2) {
                for (var i = 0; i < bondData.position1.length / 3; i++) {
                    var strength = strengthArrray[i];
                    pos1.push(bondData.position1[3 * i] * (1 - weight[strength]) + bondData.position2[3 * i] * weight[strength]);
                    pos1.push(bondData.position1[3 * i + 1] * (1 - weight[strength]) + bondData.position2[3 * i + 1] * weight[strength]);
                    pos1.push(bondData.position1[3 * i + 2] * (1 - weight[strength]) + bondData.position2[3 * i + 2] * weight[strength]);
                    bondData.radius[i] = 0.2 * rweight[strength];
                }
            }
            const bondData1: BondData = {};
            bondData1.position1 = bondData.position1;
            bondData1.position2 = new Float32Array(pos1);
            bondData1.radius = bondData.radius;
            bondData1.color = bondData.color;
            bondData1.color2 = bondData.color2;

            var pos2 = [];
            if (bondData.position1 && bondData.position2) {
                for (var i = 0; i < bondData.position1.length / 3; i++) {
                    var strength = strengthArrray[i];
                    pos2.push(bondData.position2[3 * i] * (1 - weight[strength]) + bondData.position1[3 * i] * weight[strength]);
                    pos2.push(bondData.position2[3 * i + 1] * (1 - weight[strength]) + bondData.position1[3 * i + 1] * weight[strength]);
                    pos2.push(bondData.position2[3 * i + 2] * (1 - weight[strength]) + bondData.position1[3 * i + 2] * weight[strength]);
                    bondData.radius[i] = 0.2 * rweight[strength];
                }
            }
            const bondData2: BondData = {};
            bondData2.position1 = bondData.position2;
            bondData2.position2 = new Float32Array(pos2);
            bondData2.radius = bondData.radius;
            bondData2.color = bondData.color;
            bondData2.color2 = bondData.color2;

            const bondData3: BondData = {};
            bondData3.position1 = new Float32Array(pos01)
            bondData3.position2 = new Float32Array(pos02)
            bondData3.color = new Float32Array(colors0);
            bondData3.color2 = new Float32Array(colors0);

            return [bondData1, bondData2, bondData3];
        }
        return null;
    }

    updateData(what: BondDataFields | AtomDataFields, data: StructureRepresentationData) {
        if (this.multipleBond !== 'off' && what && what.radius) {
            what.position = true
        }
        if (data.bufferList == null) return;

        const bondData = this.getBondData(data.sview as StructureView, what)

        var ellipsoidData: Partial<EllipsoidBufferData> = {}

        if (!what || what.color) {
            Object.assign(ellipsoidData, {
                color: bondData.color,
                color2: bondData.color2
            })
        }
        data.bufferList[0].setAttributes(ellipsoidData)

        var pairsDatas = this.getPairData(this.fullBondData);
        if (pairsDatas !== null) {
            data.bufferList[1].setAttributes(pairsDatas[0]);
            data.bufferList[2].setAttributes(pairsDatas[1]);
            data.bufferList[3].setAttributes(pairsDatas[2]);
        }
        this.build();
    }
}

RepresentationRegistry.add('ebase', EBaseRepresentation)

export default EBaseRepresentation
