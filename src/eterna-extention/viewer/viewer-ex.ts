import Stage from '../../stage/stage' 
import {PixiRenderCallback} from '../stage/stage-ex' 
import {
  PerspectiveCamera, OrthographicCamera, 
  Vector2, Vector3, Matrix4, 
  WebGLRenderTarget,Mesh, Group, 
  SpriteMaterial,Sprite,TextureLoader,Texture,
  BufferGeometry, 
  MeshBasicMaterial, Quaternion, Scene, Fog, SpotLight, AmbientLight
} from 'three'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

import Viewer from "../../viewer/viewer";
import PickingProxyEx from '../controls/picking-proxy-ex';
import { PickingProxy } from '../../ngl';

class Spark {
    sparkArray: Sprite[] = [];
    textSprite: Sprite | null = null;
    size: number = 0;
    counter:number = 0;
    period: number = 0;
    polling: NodeJS.Timeout;
    unit:Vector3[] = [
      new Vector3(1,0,0), new Vector3(-1,0,0), 
      new Vector3(0,1,0), new Vector3(0,-1,0)
    ];
    material:SpriteMaterial;
    center:Vector3;
    reset() {
      this.sparkArray.forEach((m)=>{
        m.geometry.dispose();
      });
      this.sparkArray = [];
      this.material.opacity = 1.0;
      this.counter = 0;
      this.period = 0;
      this.center = new Vector3(0,0,0);
      this.size = 0;
      this.unit = [
        new Vector3(1,0,0), new Vector3(-1,0,0), 
        new Vector3(0,1,0), new Vector3(0,-1,0)
      ];
      var tmpRotateVector = new Vector3();
      tmpRotateVector.set(1, 0, 0) // X axis
      // tmpRotateVector.applyMatrix4(tmpRotateMatrix) // screen X 
      var tmpRotateQuaternion = new Quaternion();
      tmpRotateQuaternion.setFromAxisAngle(tmpRotateVector, Math.random()*Math.PI)
  
      tmpRotateVector.set(0, 1, 0) // Y axis
      // tmpRotateVector.applyMatrix4(tmpRotateMatrix) // screen Y 
      var tmpRotateQuaternion2 = new Quaternion();
      tmpRotateQuaternion2.setFromAxisAngle(tmpRotateVector, Math.random()*Math.PI)
  
      tmpRotateQuaternion.multiply(tmpRotateQuaternion2)
      var tmpRotateMatrix = new Matrix4().identity();
      tmpRotateMatrix.makeRotationFromQuaternion(tmpRotateQuaternion)
      this.unit.forEach((u)=>{
        u.applyMatrix4(tmpRotateMatrix);
      })
      
      this.textSprite = null;
    }
    setURL(url1:string) {
      const textureLoader = new TextureLoader();
      const map1 = textureLoader.load(url1);
          this.material = new SpriteMaterial( { map: map1, color: 0xffffff, fog: true } );
    }
    makeTextSprite(message:string) {
      var fontface = "Arial";
      var fontsize = 100;
  
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      if(!context) return;
  
      context.font = "Bold " + fontsize + "px " + fontface;
      context.fillStyle = "white";
      context.fillText( message, 0, fontsize);
  
      var texture = new Texture(canvas) 
      texture.needsUpdate = true;
  
      var spriteMaterial = new SpriteMaterial( { map: texture, color: 0xFFFFFF, fog: true} );
      var sprite = new Sprite( spriteMaterial );
      var scale = 1;//10/metrics.width;
      sprite.scale.set(10, 2, 1*scale);
      this.textSprite = sprite;  
    }
  }
  
  
export default class ViewerEx extends Viewer {
    protected hoverBaseGroup: Group 
    protected selectBaseGroup: Group 
    protected markGroup: Group 
    protected sparkGroup: Group 
    protected sparkSpriteGroup: Group 
    spark: Spark = new Spark();
    
    composer: EffectComposer
    selectOutlinePass: OutlinePass
    effectFXAA: ShaderPass
    flashCount: number = 0
    ethernaMode:any = {
        ethernaPickingMode:true, 
        ethernaNucleotideBase: 1,
        highColor: 0xFFFFFF,
        mediumColor: 0x8F9DB0,
        weakColor: 0x546986,
        zeroColor: 0xC0C0C0,
    } 
    highlightTimer: NodeJS.Timeout;
    highlightTimeout: number = 3000;

    protected stage: Stage;
    etherna_pairs: number[] | undefined = undefined;
    etherna_sequence: string = '';
    fromOuter: boolean = false;

    pixiCallback: PixiRenderCallback | undefined = undefined;

    constructor(idOrElement: HTMLElement, stage: Stage, pixiCallback: PixiRenderCallback | undefined) {
        super(idOrElement)

        this.stage = stage;

        this.wrapper.removeChild(this.renderer.domElement)
        this.container.removeChild(this.wrapper)
        this.wrapper = document.createElement('div');
        this.pixiCallback = pixiCallback;

        this.signals.nextFrame.add(this.updateSpark, this)
    }
    protected _initRenderer():boolean {
        if(!super._initRenderer()) return false;

        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
    
        this.selectOutlinePass = new OutlinePass(new Vector2(this.width, this.height), this.scene, this.camera);
        this.selectOutlinePass.edgeStrength = 5;
        this.selectOutlinePass.edgeGlow = 0.5;
        this.selectOutlinePass.edgeThickness = 2;
        this.composer.addPass(this.selectOutlinePass);
    
        // this.markOutlinePass = new OutlinePass(new Vector2(this.width, this.height), this.scene, this.camera);
        // this.markOutlinePass.edgeStrength = 5;
        // this.markOutlinePass.edgeGlow = 0.5;
        // this.markOutlinePass.edgeThickness = 2;
        // this.composer.addPass(this.markOutlinePass);
    
        this.effectFXAA = new ShaderPass(FXAAShader);
        this.effectFXAA.uniforms['resolution'].value.set(1 / this.width, 1 / this.height);
        this.composer.addPass(this.effectFXAA);
    
        setInterval(() => {
          if (this.markGroup.children.length > 0) {
            this.flashCount++;
            this.markGroup.children.forEach((mesh: Mesh) => {
              var mat = <MeshBasicMaterial>mesh.material;
              mat.opacity = (this.flashCount % 2) * 0.6;
            });
            this.requestRender();
          }
        }, 500);
        return true;
    }
    protected _initScene() {
      if (!this.scene) {
        this.scene = new Scene()
        this.scene.name = 'scene'
      }
  
      this.translationGroup = new Group()
      this.translationGroup.name = 'translationGroup'
      this.scene.add(this.translationGroup)
  
      this.rotationGroup = new Group()
      this.rotationGroup.name = 'rotationGroup'
      this.translationGroup.add(this.rotationGroup)
  
      this.modelGroup = new Group()
      this.modelGroup.name = 'modelGroup'
      this.rotationGroup.add(this.modelGroup)
  
      this.pickingGroup = new Group()
      this.pickingGroup.name = 'pickingGroup'
      this.rotationGroup.add(this.pickingGroup)
  
      this.backgroundGroup = new Group()
      this.backgroundGroup.name = 'backgroundGroup'
      this.rotationGroup.add(this.backgroundGroup)
  
      this.helperGroup = new Group()
      this.helperGroup.name = 'helperGroup'
      this.rotationGroup.add(this.helperGroup)
  
      // fog
  
      this.scene.fog = new Fog(this.parameters.fogColor.getHex())
  
      // light
  
      this.spotLight = new SpotLight(
        this.parameters.lightColor.getHex(), this.parameters.lightIntensity
      )
      this.scene.add(this.spotLight)
  
      this.ambientLight = new AmbientLight(
        this.parameters.ambientColor.getHex(), this.parameters.ambientIntensity
      )
      this.scene.add(this.ambientLight)
  
      this.sparkGroup = new Group()
      this.sparkGroup.name = 'spark'
      this.sparkSpriteGroup = new Group();
      this.sparkGroup.add(this.sparkSpriteGroup);
      this.modelGroup.add(this.sparkGroup);
      this.sparkGroup.visible = false;

      this.hoverBaseGroup = new Group()
      this.hoverBaseGroup.name = 'hoverBaseGroup'
      this.modelGroup.add(this.hoverBaseGroup);

      this.selectBaseGroup = new Group()
      this.selectBaseGroup.name = 'selectBaseGroup'
      this.modelGroup.add(this.selectBaseGroup);

      this.markGroup = new Group()
      this.markGroup.name = 'markGroup'
      this.modelGroup.add(this.markGroup);
    }
    protected __render(picking = false, camera: PerspectiveCamera | OrthographicCamera, 
        renderTarget?: WebGLRenderTarget) {
    if (picking) {
      if (!this.lastRenderedPicking) this.__renderPickingGroup(camera)
    } 
    else if (this.sampleLevel > 0 && this.parameters.cameraType !== 'stereo') {
      // TODO super sample broken for stereo camera
      this.__renderSuperSample(camera, renderTarget)
      this.__renderModelGroup(camera, renderTarget)

      if(this.pixiCallback) {
        this.signals.rendered.dispatch()
        this.signals.nextFrame.dispatch() 
        this.pixiCallback(this.renderer.domElement, this.width, this.height)
      }
    } 
    else {
      this.__renderModelGroup(camera, renderTarget);

      if(this.pixiCallback) {
        this.signals.rendered.dispatch()
        this.signals.nextFrame.dispatch()
        this.pixiCallback(this.renderer.domElement, this.width, this.height)
      }
    }
  }

  setSize(width: number, height: number) {
    this.width = width || 0
    this.height = height || 0

    this.perspectiveCamera.aspect = this.width / this.height
    this.orthographicCamera.left = -this.width / 2
    this.orthographicCamera.right = this.width / 2
    this.orthographicCamera.top = this.height / 2
    this.orthographicCamera.bottom = -this.height / 2
    this.camera.updateProjectionMatrix()

    const dpr = window.devicePixelRatio

    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(width, height)

    const dprWidth = this.width * dpr
    const dprHeight = this.height * dpr

    this.pickingTarget.setSize(dprWidth, dprHeight)
    this.sampleTarget.setSize(dprWidth, dprHeight)
    this.holdTarget.setSize(dprWidth, dprHeight)

    this.composer.setSize(width, height);
    this.effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);

    this.requestRender()
  }

  protected __renderModelGroup(camera: PerspectiveCamera | OrthographicCamera, renderTarget?: WebGLRenderTarget) {
    this.renderer.setRenderTarget(renderTarget || null)
    this.renderer.clear()

    this.__setVisibility(false, false, true, false)
    this.renderer.render(this.scene, camera)
    this.renderer.clear(false, true, true)
    this.updateInfo()

    this.__setVisibility(true, false, false, true)

    this.composer.render();

    this.renderer.setRenderTarget(null) // set back to default canvas
    this.updateInfo();
  }

  public hoverEBaseObject(resno: number, fromViewer?: boolean, color1?: number) {
    var fromSelf = true;
    if (fromViewer !== undefined) fromSelf = fromViewer;
    if (!fromSelf) {
      if (resno >= 0) {
        this.fromOuter = true;
      }
      else {
        this.fromOuter = false;
      }
    }
    if (resno < 0) {
      if (this.fromOuter) return;
    }

    let selGeometry = null;
    var selectedObjects = [];
    this.hoverBaseGroup.children.forEach((obj) => {
      this.hoverBaseGroup.remove(obj);
    });
    this.modelGroup.children.forEach(group => {
      if (group.name == 'meshGroup') {
        let mesh: Mesh = <Mesh>group.children[0];
        let geometry: BufferGeometry = <BufferGeometry>mesh.geometry;
        if (geometry.name == 'ebase') {
          let newPos = new Array<Vector3>(0);
          let posInfo = geometry.getAttribute('position');
          let posArray = <Float32Array>posInfo.array;
          // posInfo.count
          let idInfo = geometry.getAttribute('primitiveId');
          let idArray = <Float32Array>idInfo.array;
          var x0 = 0, y0 = 0, z0 = 0;
          for (var i = 0; i < idArray.length; i++) {
            if (idArray[i] == resno) {
              newPos.push(new Vector3(posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]));
              x0 += posArray[i * 3];
              y0 += posArray[i * 3 + 1];
              z0 += posArray[i * 3 + 2];
            }
          }
          x0 /= newPos.length;
          y0 /= newPos.length;
          z0 /= newPos.length;
          selGeometry = new BufferGeometry();
          selGeometry.setFromPoints(newPos);
          selGeometry.translate(-x0, -y0, -z0);
          selGeometry.scale(1.3, 1.3, 1.3);
          selGeometry.translate(x0, y0, z0);
        }
      }
    });
    var color = color1 ? color1 : 0xFFFF00;
    if (selGeometry) {
      var mat = new MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        depthWrite: false
      });
      var newMesh = new Mesh(selGeometry, mat);
      this.hoverBaseGroup.add(newMesh);
      selectedObjects.push(newMesh);
    }
    this.requestRender();
  }

  baseColor: number = 0xFFFF00
  setBaseColor(color: number) {
    this.baseColor = color;
  }

  public extendHighlightTimer() {
    clearTimeout(this.highlightTimer);
    this.highlightTimer = setTimeout(()=>{
      this.selectEBaseObject(-1);
    }, this.highlightTimeout);
  }

  public selectEBaseObject(resno: number, bChange?: boolean, timeOut?:number, color1?: number, color2?: number) {
    if (bChange === undefined) bChange = true;
    if (timeOut === undefined) timeOut = 3000;
    this.highlightTimeout = timeOut;

    clearTimeout(this.highlightTimer);
    
    if (color1) this.selectOutlinePass.visibleEdgeColor.set(color1);
    if (color2) this.selectOutlinePass.hiddenEdgeColor.set(color2);

    if (resno >= 0) {
      if(bChange) {
        var selGeometry = null;
        var selectedObjects = [];
        var bContained: boolean = false;
        this.selectBaseGroup.children.forEach((obj) => {
          if(obj.name === (resno + '')) bContained = true;
          selectedObjects.push(obj);
        });
        if(!bContained) {
          this.modelGroup.children.forEach(group => {
            if (group.name == 'meshGroup') {
              let mesh: Mesh = <Mesh>group.children[0];
              let geometry: BufferGeometry = <BufferGeometry>mesh.geometry;
              if (geometry.name == 'ebase') {
                let newPos = new Array<Vector3>(0);
                let posInfo = geometry.getAttribute('position');
                let posArray = <Float32Array>posInfo.array;
                let idInfo = geometry.getAttribute('primitiveId');
                let idArray = <Float32Array>idInfo.array;
                for (var i = 0; i < idArray.length; i++) {
                  if (idArray[i] == resno) {
                    newPos.push(new Vector3(posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]));
                  }
                }
                if (newPos.length > 0) {
                  selGeometry = new BufferGeometry();
                  selGeometry.setFromPoints(newPos);
                }
              }
            }
          });
        }
        if (selGeometry) {
          var mat = new MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.0,
            depthWrite: false,
          });
          var newMesh = new Mesh(selGeometry, mat);
          newMesh.name = resno + '';

          this.selectBaseGroup.add(newMesh);
          selectedObjects.push(newMesh);
          this.selectOutlinePass.selectedObjects = selectedObjects;
        }
      }
      else {

      }
      this.extendHighlightTimer();
      this.requestRender();
    }
    else if(resno < 0) {
      var bRefresh:boolean = this.selectBaseGroup.children.length > 0;
      if(bRefresh) {
        this.selectBaseGroup.children.forEach((obj) => {
          this.selectBaseGroup.remove(obj);
        });
        this.selectOutlinePass.selectedObjects = [];
        this.requestRender();
      }
    }
  }

  markEBaseObject(resno: number, color1?: number, color2?: number) {
    var selectedObjects = [];
    var bNew: boolean = true;
    this.markGroup.children.forEach((obj) => {
      if (parseInt(obj.name) == resno) {
        this.markGroup.remove(obj);
        bNew = false;
      }
      else {
        selectedObjects.push(obj);
      }
    });
    if (bNew) {
      var selGeometry = null;
      this.modelGroup.children.forEach(group => {
        if (group.name == 'meshGroup') {
          let mesh: Mesh = <Mesh>group.children[0];
          let geometry: BufferGeometry = <BufferGeometry>mesh.geometry;
          if (geometry.name == 'ebase') {
            let newPos = new Array<Vector3>(0);
            let posInfo = geometry.getAttribute('position');
            let posArray = <Float32Array>posInfo.array;
            let idInfo = geometry.getAttribute('primitiveId');
            let idArray = <Float32Array>idInfo.array;
            // var x0 = 0, y0 = 0, z0 = 0;
            for (var i = 0; i < idArray.length; i++) {
              if (idArray[i] == resno) {
                newPos.push(new Vector3(posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]));
              }
            }
            selGeometry = new BufferGeometry();
            selGeometry.setFromPoints(newPos);
          }
        }
      });
      if (selGeometry) {
        var mat = new MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
        });
        var newMesh = new Mesh(selGeometry, mat);
        newMesh.name = resno.toString();
        this.markGroup.add(newMesh);
        selectedObjects.push(newMesh);
      }
    }
    this.requestRender();
  }

  beginSpark() {
    this.sparkSpriteGroup.children.forEach((mesh) => {
      this.sparkSpriteGroup.remove(mesh);
    });
    this.sparkGroup.children.forEach((mesh) => {
      if(mesh instanceof Group) {}
      else this.sparkGroup.remove(mesh);
    });
    this.spark.reset();
    this.sparkGroup.visible = false;
    clearInterval(this.spark.polling);
  }
  makeTextSprite(msg:string) {
    this.spark.makeTextSprite(msg);
  }
  addSpark(resno: number) {
    this.modelGroup.children.forEach(group => {
      if (group.name == 'meshGroup') {
        let mesh: Mesh = <Mesh>group.children[0];
        let geometry: BufferGeometry = <BufferGeometry>mesh.geometry;
        if (geometry.name == 'ebase') {
          let posInfo = geometry.getAttribute('position');
          let posArray = <Float32Array>posInfo.array;
          let idInfo = geometry.getAttribute('primitiveId');
          let idArray = <Float32Array>idInfo.array;
          var x0 = 0, y0 = 0, z0 = 0;
          var maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
          var count = 0;
          for (var i = 0; i < idArray.length; i++) {
            if (idArray[i] == resno) {
              var x = posArray[i * 3], y = posArray[i * 3 + 1], z = posArray[i * 3 + 2];
              x0 += x;
              y0 += y;
              z0 += z;
              if(x > maxX) maxX = x;
              if(y > maxY) maxY = y;
              if(z > maxZ) maxZ = z;
              count++;
            }
          }
          x0 /= count;
          y0 /= count;
          z0 /= count;
          var R = Math.sqrt((maxX-x0)*(maxX-x0) + (maxY-y0)*(maxY-y0) + (maxZ-z0)*(maxZ-z0));

          for(var i=0;i<this.spark.unit.length;i++) {
            const sprite = new Sprite(this.spark.material);
            sprite.position.set( x0, y0, z0);
            sprite.name = i+'';
            sprite.scale.set(R, R, 1.0 );
            this.spark.sparkArray.push(sprite);
          } 
          // const sprite = new Sprite(this.spark.material);
					// sprite.position.set( x0, y0, z0);
          // var n = Math.floor(Math.random()*400);
          // sprite.name = (n%4)+'';
					// sprite.scale.set(R, R, 1.0 );
          // this.spark.sparkArray.push(sprite);

          this.spark.size = Math.max(this.spark.size, R);
        }
      }
    });
  }
  endSpark(period:number) {
    // console.log('end spark = ', period); 
    this.spark.counter = 0;
    this.spark.period = period;   
    var count = 0;
    this.spark.sparkArray.forEach((m)=>{
      this.spark.center.add(m.position);
      this.sparkSpriteGroup.add(m);
      count++;
    });
    this.spark.center.divideScalar(count);
    // if(this.spark.textSprite) {
    //   this.sparkGroup.add(this.spark.textSprite);
    //   this.spark.textSprite.position.set(this.spark.center.x, this.spark.center.y, this.spark.center.z)
    //   console.log('xxxxxxxxxx', this.spark.center);
    // }
    this.sparkGroup.visible = true;
    this.requestRender();
    this.spark.polling = setInterval(()=>{
      this.requestRender();
    }, 1);
  }

  updateSpark() {
    if (this.sparkGroup.visible) {
      var opacity = 1.0;
      if(this.spark.counter<this.spark.period)
        opacity = 1.0 - this.spark.counter/this.spark.period;

      this.sparkSpriteGroup.children.forEach((obj) => {
        if(obj.visible) {
          var delta = (this.spark.size/4)*(this.spark.period-this.spark.counter)/this.spark.period;
          var i = parseInt(obj.name, 10);
          obj.translateOnAxis(this.spark.unit[i], delta);
          var p2 = this.stage.viewerControls.getPositionOnCanvas(obj.position);
          if(p2.x<0 || p2.x>this.width || p2.y<0 || p2.y > this.height) {
            obj.visible = false;
          }
          var sprite = <Sprite>obj;
          sprite.material.opacity = opacity;
					sprite.scale.set(this.spark.size,this.spark.size, 1.0 );
        }
      });
      // this.spark.textSprite?.scale.set(10,2,1);
  
      this.spark.counter++;
      if(this.spark.counter >= this.spark.period) {
        this.sparkGroup.visible = false;
        // console.log('updateSpark --- ', this.spark.counter, this.spark.period);
        this.spark.reset();
        clearInterval(this.spark.polling);
      }
      this.requestRender();
    }
  }
  setEthernaPairs(pairs: number[] | undefined) {
    this.etherna_pairs = pairs;
  }
  setEthernaSequence(sequence: string, num: number) {
    this.etherna_sequence = sequence;
    this.ethernaMode.ethernaNucleotideBase = num;
  }
  setEthernaToolTipMode(mode:boolean) {
    this.ethernaMode.ethernaPickingMode = mode; 
  }
  setHBondColor(colors:number[]) {
    this.ethernaMode.highColor = colors[0];
    this.ethernaMode.mediumColor = colors[1];
    this.ethernaMode.weakColor = colors[2];
    this.ethernaMode.zeroColor = colors[3];
  }
  getWebGLCanvas() {
    return this.renderer.domElement;
  }
  static tooltipPick(stage: Stage, pickingProxy0: PickingProxy) {
    var pickingProxy = <PickingProxyEx>pickingProxy0;
    var viewer:ViewerEx = <ViewerEx>stage.viewer;
    stage.tooltip.style.display = 'none';
    const sp = stage.getParameters() as any
    if (sp.tooltip && pickingProxy) {
      const mp = pickingProxy.mouse.position
      window.dispatchEvent(new CustomEvent('tooltip', {
        detail: {
          'x': mp.x,
          'y': mp.y,
          'label': pickingProxy.getLabel(),
        }
      }));

      var result = pickingProxy.checkBase();
      if (result.isBase) {
        viewer.hoverEBaseObject(result.resno - 1, true, viewer.baseColor);
        window.dispatchEvent(new CustomEvent('picking', {
          detail: {
            'resno': result.resno,
            'resname': result.resname,
            'action': 'hover',
          }
        }));
      } else
      viewer.hoverEBaseObject(-1);
    } else {
      viewer.hoverEBaseObject(-1);
      window.dispatchEvent(new CustomEvent('tooltip', {
        detail: {
          'x': 0,
          'y': 0,
          'label': '',
        }
      }));
    }
  }
  static movePick(stage: Stage, pickingProxy0: PickingProxy) {
    var pickingProxy = <PickingProxyEx>pickingProxy0;
    if (pickingProxy) {
      var result = pickingProxy.checkBase();
      if (result.isBase) {
        window.dispatchEvent(new CustomEvent('picking', {
          detail: {
            'resno': result.resno,
            'resname': result.resname,
            'action': 'clicked',
          }
        }));
      }
    }
  }
}

