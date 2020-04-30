import Structure from './Structure'
import { Soldier } from '../../Units/Units'

export default class Town extends Structure {
  constructor() {
    super()
    this.name = 'Town'
    this.buildUnits = ['Soldier']
    this.initDefBonus = 3
  }

  public static structureName = 'Town'
}
