import Structure from './Structure'
import { Soldier, Archer } from '../../Units/Units'

export default class Lodge extends Structure {
  constructor() {
    super()
    this.name = 'Lodge'
    this.buildUnits = ['Soldier', 'Archer']
    this.initDefBonus = 5
  }

  public static structureName = 'Lodge'
}
