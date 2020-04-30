import Unit from './Unit'

class Priest extends Unit {
  constructor(x: number, y: number, playerId: string) {
    super(x, y, playerId)
    this.name = 'Priest'
    this.cost = 4
    this.move = 1
    this.movesLeft = 1
    this.maxMoves = 1
    this.attack = 0
    this.health = 5
    this.maxHealth = 5
    this.range = 0
    this.description =
      'Heals other units in this square during combat and at the end of each turn.'
  }
}

export default Priest
