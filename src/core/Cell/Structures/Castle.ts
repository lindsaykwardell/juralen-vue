import Structure from './Structure'
import { Soldier, Knight } from '../../Units/Units'

export default class Castle extends Structure {
  constructor() {
    super()
    this.name = 'Castle'
    this.buildUnits = ['Soldier', 'Knight']
    this.initDefBonus = 5
  }

  public static structureName = 'Castle'
}
