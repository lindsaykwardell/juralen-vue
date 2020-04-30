import Structure from './Structure'
import { Soldier, Warrior } from '../../Units/Units'

export default class Citadel extends Structure {
  constructor() {
    super()
    this.name = 'Citadel'
    this.buildUnits = ['Soldier', 'Warrior']
    this.initDefBonus = 7
  }

  public static structureName = 'Citadel'
}
