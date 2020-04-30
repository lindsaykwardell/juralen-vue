import Cell, { Terrain } from '../Cell'

export default class Mountain extends Cell {
  constructor(x: number, y: number) {
    super(x, y)
    this.terrain = Terrain.Mountain
    this.passable = false
  }
}
