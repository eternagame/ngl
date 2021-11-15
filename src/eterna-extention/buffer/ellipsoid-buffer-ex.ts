
 import { IcosahedronBufferGeometry, Vector3, Matrix4 } from 'three'

 import { BufferRegistry } from '../../globals'
 import { defaults } from '../../utils'
 import GeometryBuffer from '../../buffer/geometry-buffer'
 import { BufferDefaultParameters } from '../../buffer/buffer'
import { EllipsoidBufferData } from '../../buffer/ellipsoid-buffer'
 
 const scale = new Vector3()
 const target = new Vector3()
 const up = new Vector3()
 const eye = new Vector3(0, 0, 0)
 
export const EllipsoidExBufferDefaultParameters = Object.assign({
   sphereDetail: 2,
   vScale: 1, 
 }, BufferDefaultParameters)
 export type EllipsoidExBufferParameters = typeof EllipsoidExBufferDefaultParameters
 
 class EllipsoidExBuffer extends GeometryBuffer {
   updateNormals = true
 
   get defaultParameters() { return EllipsoidExBufferDefaultParameters }
   parameters: EllipsoidExBufferParameters
 
   _majorAxis: Float32Array
   _minorAxis: Float32Array
   _radius: Float32Array
   _vScale: number 
 
   constructor(data: EllipsoidBufferData, params: Partial<EllipsoidExBufferParameters> = {}) {
     super(data, params, new IcosahedronBufferGeometry(1, defaults(params.sphereDetail, 2)))
 
     this._vScale = defaults(params.vScale, 1)
     this.setAttributes(data, true)
   }
 
   applyPositionTransform(matrix: Matrix4, i: number, i3: number) {
     target.fromArray(this._majorAxis as any, i3)
     up.fromArray(this._minorAxis as any, i3)
     matrix.lookAt(eye, target, up)
 
     //scale sphere in 3 axises to make ellipsoid
     scale.set(this._radius[i] * this._vScale, up.length(), target.length())
     matrix.scale(scale)
   }
 
   setAttributes(data: Partial<EllipsoidBufferData> = {}, initNormals?: boolean) {
     if (data.radius) this._radius = data.radius
     if (data.majorAxis) this._majorAxis = data.majorAxis
     if (data.minorAxis) this._minorAxis = data.minorAxis
 
     super.setAttributes(data, initNormals)
   }
 }
 
 BufferRegistry.add('ellipsoidex', EllipsoidExBuffer)
 
 export default EllipsoidExBuffer
 