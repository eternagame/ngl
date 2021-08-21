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
import { WideLineBufferData } from '../buffer/wideline-buffer'
import AtomProxy from '../proxy/atom-proxy';

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

      var data = this.getBondData(sview);
      // console.log(data);
      var pos1 = data.position1;
      var pos2 = data.position2;
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
          if (data.picking && rawBondData.picking) {
            var atomIndex2 = data.picking.bondStore.atomIndex2;
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
            let ap1 = new AtomProxy(data.picking.structure);
            ap1.index = id;
            let ap2 = new AtomProxy(data.picking.structure);
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
        const dataParam: EllipsoidBufferData = this.getBondData(sview) as EllipsoidBufferData;
        dataParam.position = position;
        dataParam.color = data.color;
        dataParam.radius = radius;
        dataParam.vScale = this.vScale;
        dataParam.majorAxis = new Float32Array(majorAxis);
        dataParam.minorAxis = new Float32Array(minorAxis);
        const elilipsoidBuffer = new EllipsoidBuffer(dataParam)

        bufferList.push(elilipsoidBuffer as EllipsoidBuffer)
      }

      // const cylinderBuffer = new CylinderBuffer(
      //   (this.getBondData(sview) as CylinderBufferData),
      //   this.getBufferParams({
      //     openEnded: this.openEnded,
      //     radialSegments: this.radialSegments,
      //     disableImpostor: this.disableImpostor,
      //     dullInterior: true
      //   })
      // )

      // bufferList.push(cylinderBuffer as CylinderGeometryBuffer)

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

  updateData(what: BondDataFields | AtomDataFields, data: StructureRepresentationData) {
    if (this.multipleBond !== 'off' && what && what.radius) {
      what.position = true
    }
    if (data.bufferList == null) return;

    const bondData = this.getBondData(data.sview as StructureView, what)

    if (this.lineOnly) {
      const lineData: Partial<WideLineBufferData> = {}

      if (!what || what.position) {
        Object.assign(lineData, {
          position1: bondData.position1,
          position2: bondData.position2
        })
      }

      if (!what || what.color) {
        Object.assign(lineData, {
          color: bondData.color,
          color2: bondData.color2
        })
      }

      data.bufferList[0].setAttributes(lineData)
    } else {
      var cylinderData: Partial<EllipsoidBufferData> = {}

      if (!what || what.position) {
        Object.assign(cylinderData, {
          position1: bondData.position1,
          position2: bondData.position2
        })
      }

      if (!what || what.color) {
        Object.assign(cylinderData, {
          color: bondData.color,
          color2: bondData.color2
        })
      }

      if (!what || what.radius) {
        Object.assign(cylinderData, {
          radius: bondData.radius
        })
      }

      data.bufferList[0].setAttributes(cylinderData)

      if (!this.cylinderOnly) {
        // var atomData = this.getAtomData(data.sview as StructureView, what)

        // var sphereData: Partial<EllipsoidBufferData> = {}

        // if (!what || what.position) {
        //   Object.assign(sphereData, {
        //     position: atomData.position
        //   })
        // }

        // if (!what || what.color) {
        //   Object.assign(sphereData, {
        //     color: atomData.color
        //   })
        // }

        // if (!what || what.radius) {
        //   Object.assign(sphereData, {
        //     radius: atomData.radius
        //   })
        // }

        // data.bufferList[1].setAttributes(sphereData)
      }
    }
  }

  attach(callback: () => void) {
    const viewer = this.viewer
    const bufferList = this.bufferList

    this.dataList.forEach(function (data) {
      data.bufferList.forEach(function (buffer) {
        buffer.geometry.name = 'ebase'; //kkk // set geometry name for outline highlighting
        bufferList.push(buffer)
        viewer.add(buffer, data.instanceList)
      })
    })

    this.setVisibility(this.visible)
    callback()
  }

}

RepresentationRegistry.add('ebase', EBaseRepresentation)

export default EBaseRepresentation
