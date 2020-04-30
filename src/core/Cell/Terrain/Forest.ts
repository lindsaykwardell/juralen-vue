import Cell, { Terrain } from '../Cell'

export default class Forest extends Cell {
  constructor(x: number, y: number) {
    super(x, y)
    this.terrain = Terrain.Forest
    this.defBonus = 1
  }
}
