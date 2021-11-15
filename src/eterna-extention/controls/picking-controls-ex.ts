
import { StageEx } from "../../ngl";
import PickingControls from "../../controls/picking-controls";
import PickingProxyEx from "./picking-proxy-ex";

export default class PickingControlsEX extends PickingControls {
    constructor(readonly stage: StageEx) {
        super(stage);
    }
    pick (x: number, y: number) {
        const pickingData = this.viewer.pick(x, y)
    
        if (pickingData.picker &&
            pickingData.picker.type !== 'ignore' &&
            pickingData.pid !== undefined
        ) {
          const pickerArray = pickingData.picker.array
          if (pickerArray && pickingData.pid >= pickerArray.length) {
            console.error('pid >= picker.array.length')
          } else {
            return new PickingProxyEx(pickingData, this.stage)
          }
        }
      }
    }