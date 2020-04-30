import Structure from './Structure'
import { Soldier, Priest } from '../../Units/Units'

export default class Temple extends Structure {
  constructor() {
    super()
    this.name = 'Temple'
    this.buildUnits = ['Soldier', 'Priest']
    this.initDefBonus = 5
  }

  public static structureName = 'Temple'
}
