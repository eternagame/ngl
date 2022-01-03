
import { StageEx, ViewerEx } from "../../ngl";
import PickingProxy, { PickingData } from "../../controls/picking-proxy";

export default class PickingProxyEx extends PickingProxy {
    constructor(pickingData: PickingData, readonly stage: StageEx) {
        super(pickingData, stage);
    }
    getLabel() {
        var viewer = <ViewerEx>this.stage.viewer;

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

        return super.getLabel();
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