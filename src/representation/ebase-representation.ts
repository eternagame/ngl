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

  private fullBondData: BondData;

  createData(sview: StructureView) {
    const bufferList: any[] = []

    if (this.lineOnly) {
      this.lineBuffer = new WideLineBuffer(
        this.getBondData(sview, { position: true, color: true, picking: true }),
        this.getBufferParams({ linewidth: this.linewidth })
      )

      bufferList.push(this.lineBuffer)
    } else {
      let p = this.getBondParams({ position: true })
      let rawBondData = sview.getBondData(p);

      var bondData = this.getBondData(sview);
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

        var pairsData = this.getPairData(bondData);
        if (pairsData !== undefined) {
          const cylinderBuffer = new CylinderBuffer(
            (pairsData as CylinderBufferData),
            this.getBufferParams({
              openEnded: false,//this.openEnded,
              radialSegments: this.radialSegments,
              disableImpostor: this.disableImpostor,
              dullInterior: true
            })
          )
          bufferList.push(cylinderBuffer as CylinderGeometryBuffer)
        }
      }

      if (!this.cylinderOnly) {
        // const sphereBuffer = new SphereBuffer(
        //   (this.getAtomData(sview) as SphereBufferData),
        //   (this.getBufferParams({
        //     sphereDetail: this.sphereDetail,
        //     disableImpostor: this.disableImpostor,
        //     dullInterior: true
        //   }) as SphereBufferParameters)
        // )

        // bufferList.push(sphereBuffer as SphereGeometryBuffer)
      }
    }

    return {
      bufferList: bufferList
    }
  }

  getPairData(data: BondData) {
    // console.log(data.picking);
    if (this.viewer.etherna_pairs !== undefined && data.position2 !== undefined) {
      const bondData: BondData = {}
      var pos1 = [];
      var pos2 = [];
      var colors: number[] = [];
      var radius: number[] = [];
      var pairMap = new Map();
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
        if (strength == 0) continue;
        var x1 = data.position2[i * 3], y1 = data.position2[i * 3 + 1], z1 = data.position2[i * 3 + 2];
        var x2 = data.position2[pairNum * 3], y2 = data.position2[pairNum * 3 + 1], z2 = data.position2[pairNum * 3 + 2];
        var dx = x2 - x1;
        x1 = x1 + dx / 20;
        x2 = x2 - dx / 20;
        var dy = y2 - y1;
        y1 = y1 + dy / 20;
        y2 = y2 - dy / 20;
        var dz = z2 - z1;
        z1 = z1 + dz / 20;
        z2 = z2 - dz / 20;
        pos1.push(x1);
        pos1.push(y1);
        pos1.push(z1);
        pos2.push(x2);
        pos2.push(y2);
        pos2.push(z2);

        radius.push(0.2 * strength);
        if (strength == 3) {
          colors.push(1);
          colors.push(1);
          colors.push(1);
        }
        else if (strength == 2) {
          colors.push(0.85);
          colors.push(0.85);
          colors.push(0.85);
        }
        else {
          colors.push(0.7);
          colors.push(0.7);
          colors.push(0.7);
        }
      }
      bondData.position1 = new Float32Array(pos1)
      bondData.position2 = new Float32Array(pos2)
      bondData.radius = new Float32Array(radius);
      bondData.color = new Float32Array(colors);
      bondData.color2 = new Float32Array(colors);
      return bondData;
    }
    return undefined;
  }


  // update(what: BondDataFields | AtomDataFields) {
  //   super.update(what);
  //   this.dataList.forEach((data) => {
  //     if (data.bufferList.length > 0) {
  //       this.updateData(what, data)
  //     }
  //   }, this)
  // }
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

    if (data.bufferList[1]) {
      var pairsData = this.getPairData(this.fullBondData);
      if (pairsData !== undefined) {
        data.bufferList[1].setAttributes(pairsData);
      }
    }
  }

}

RepresentationRegistry.add('ebase', EBaseRepresentation)

export default EBaseRepresentation
