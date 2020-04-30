import Structure from './Structure'
import { Soldier, Wizard } from '../../Units/Units'

export default class Academy extends Structure {
  constructor() {
    super()
    this.name = 'Academy'
    this.buildUnits = ['Soldier', 'Wizard']
    this.initDefBonus = 5
  }

  public static structureName = 'Academy'
}
