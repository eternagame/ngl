
import { StageEx, ViewerEx } from "../../ngl";
import PickingProxy, { PickingData } from "../../controls/picking-proxy";

export default class PickingProxyEx extends PickingProxy {
    constructor(pickingData: PickingData, readonly stage: StageEx) {
        super(pickingData, stage);
    }
    getLabel() {
        var viewer = <ViewerEx>this.stage.viewer;
        const atom = this.atom || this.closeAtom

        var checkResult = this.checkBase();
        if(viewer.ethernaMode.ethernaPickingMode) { 
          if(!checkResult.isBase) return '';
          else {
            var name = ''
            if (this.bond.atom1.resno !== undefined) name += (this.bond.atom1.resno + viewer.ethernaMode.ethernaNucleotideBase-1);
            if (this.bond.atom1.resname) name += ': ' + this.bond.atom1.resname
            return name;
          }
        }
    
        let msg = 'nothing'
        if (this.arrow) {
          msg = this.arrow.name
        } else if (atom) {
          msg = `atom: ${atom.qualifiedName()} (${atom.structure.name})`
        } else if (this.axes) {
          msg = 'axes'
        } else if (this.bond) {
          msg = `bond: ${this.bond.atom1.qualifiedName()} - ${this.bond.atom2.qualifiedName()} (${this.bond.structure.name})`
        } else if (this.box) {
          msg = this.box.name
        } else if (this.cone) {
          msg = this.cone.name
        } else if (this.clash) {
          msg = `clash: ${this.clash.clash.sele1} - ${this.clash.clash.sele2}`
        } else if (this.contact) {
          msg = `${this.contact.type}: ${this.contact.atom1.qualifiedName()} - ${this.contact.atom2.qualifiedName()} (${this.contact.atom1.structure.name})`
        } else if (this.cylinder) {
          msg = this.cylinder.name
        } else if (this.distance) {
          msg = `distance: ${this.distance.atom1.qualifiedName()} - ${this.distance.atom2.qualifiedName()} (${this.distance.structure.name})`
        } else if (this.ellipsoid) {
          msg = this.ellipsoid.name
        } else if (this.octahedron) {
          msg = this.octahedron.name
        } else if (this.point) {
          msg = this.point.name
        } else if (this.mesh) {
          msg = `mesh: ${this.mesh.name || this.mesh.serial} (${this.mesh.shape.name})`
        } else if (this.slice) {
          msg = `slice: ${this.slice.value.toPrecision(3)} (${this.slice.volume.name})`
        } else if (this.sphere) {
          msg = this.sphere.name
        } else if (this.surface) {
          msg = `surface: ${this.surface.surface.name}`
        } else if (this.tetrahedron) {
          msg = this.tetrahedron.name
        } else if (this.torus) {
          msg = this.torus.name
        } else if (this.unitcell) {
          msg = `unitcell: ${this.unitcell.unitcell.spacegroup} (${this.unitcell.structure.name})`
        } else if (this.unknown) {
          msg = 'unknown'
        } else if (this.volume) {
          msg = `volume: ${this.volume.value.toPrecision(3)} (${this.volume.volume.name})`
        } else if (this.wideline) {
          msg = this.wideline.name
        }
        return msg
    }

    public checkBase(): any {
        if (this.bond) {
        if ((this.bond.atom1.resno == this.bond.atom2.resno) && this.bond.atom1.atomname.includes("C4'") && (this.bond.atom2.atomname.includes("N1") || this.bond.atom2.atomname.includes("N3"))) {
            return { isBase: true, resno: this.bond.atom1.resno, resname: this.bond.atom1.resname };
        }
        }
        return { isBase: false, resno: -1, resname: '' };
    }
}