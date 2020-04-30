import Structure from './Structure'
import { Soldier, Rogue } from '../../Units/Units'

export default class City extends Structure {
  constructor() {
    super()
    this.name = 'City'
    this.buildUnits = ['Soldier', 'Rogue']
    this.initDefBonus = 5
  }

  public static structureName = 'City'
}
