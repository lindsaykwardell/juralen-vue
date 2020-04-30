import { Terrain } from './../Cell'
import Cell from '../Cell'

export default class Plains extends Cell {
  constructor(x: number, y: number) {
    super(x, y)
    this.terrain = Terrain.Plains
  }
}
