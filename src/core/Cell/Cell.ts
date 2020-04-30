import Structure from './Structures/Structure'

export default class Cell {
  public x: number
  public y: number
  public structure: Structure | null
  public terrain: Terrain | null
  public defBonus: number
  public controlledBy: string | null
  public passable: boolean

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.structure = null
    this.terrain = null
    this.defBonus = 0
    this.controlledBy = null
    this.passable = true
  }

  public takeDamage(damage) {
    this.defBonus -= damage
  }

  public fortify() {
    this.defBonus++
  }

  public buildStructure(struct: typeof Structure) {
    if (this.structure) {
      const newStruct = new struct()
      newStruct.buildUnits = [
        ...new Set([...newStruct.buildUnits, ...this.structure.buildUnits])
      ]
      this.structure = newStruct
    } else {
      this.structure = new struct()
    }
    this.terrain = Terrain.Plains
    this.defBonus = this.structure.initDefBonus
    this.passable = true
  }
}

export enum Terrain {
  Plains = 'Plains',
  Forest = 'Forest',
  Mountain = 'Mountain'
}
