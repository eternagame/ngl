/**
 * @file Ellipsoid Geometry Buffer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { IcosahedronBufferGeometry, Vector3, Matrix4 } from 'three'

import { BufferRegistry } from '../globals'
import { defaults } from '../utils'
import GeometryBuffer from './geometry-buffer'
import { BufferData, BufferDefaultParameters } from './buffer'

const scale = new Vector3()
const target = new Vector3()
const up = new Vector3()
const eye = new Vector3(0, 0, 0)

export interface EllipsoidBufferData extends BufferData {
  majorAxis: Float32Array
  minorAxis: Float32Array
  radius: Float32Array
  vScale: number
}

export const EllipsoidBufferDefaultParameters = Object.assign({
  sphereDetail: 2,
}, BufferDefaultParameters)
export type EllipsoidBufferParameters = typeof EllipsoidBufferDefaultParameters

/**
 * Ellipsoid buffer. Draws ellipsoids.
 *
 * @example
 * var ellipsoidBuffer = new EllipsoidBuffer({
 *   position: new Float32Array([ 0, 0, 0 ]),
 *   color: new Float32Array([ 1, 0, 0 ]),
 *   radius: new Float32Array([ 1 ]),
 *   majorAxis: new Float32Array([ 1, 1, 0 ]),
 *   minorAxis: new Float32Array([ 0.5, 0, 0.5 ]),
 * });
 */
class EllipsoidBuffer extends GeometryBuffer {
  updateNormals = true

  get defaultParameters() { return EllipsoidBufferDefaultParameters }
  parameters: EllipsoidBufferParameters

  _majorAxis: Float32Array
  _minorAxis: Float32Array
  _radius: Float32Array
  _vScale: number

  constructor(data: EllipsoidBufferData, params: Partial<EllipsoidBufferParameters> = {}) {
    super(data, params, new IcosahedronBufferGeometry(1, defaults(params.sphereDetail, 2)))

    this.setAttributes(data, true)
  }

  applyPositionTransform(matrix: Matrix4, i: number, i3: number) {
    target.fromArray(this._majorAxis as any, i3)
    up.fromArray(this._minorAxis as any, i3)
    matrix.lookAt(eye, target, up)

    // console.log(this._vScale);
    scale.set(this._radius[i] * this._vScale, up.length(), target.length()) //kkk
    matrix.scale(scale)
  }

  setAttributes(data: Partial<EllipsoidBufferData> = {}, initNormals?: boolean) {
    if (data.radius) this._radius = data.radius
    if (data.majorAxis) this._majorAxis = data.majorAxis
    if (data.minorAxis) this._minorAxis = data.minorAxis
    this._vScale = defaults(data.vScale, 1)

    super.setAttributes(data, initNormals)
  }
}

BufferRegistry.add('ellipsoid', EllipsoidBuffer)

export default EllipsoidBuffer
