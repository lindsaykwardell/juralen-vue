import Unit from './Unit'

class Warrior extends Unit {
  constructor(x: number, y: number, playerId: string) {
    super(x, y, playerId)
    this.name = 'Warrior'
    this.cost = 2
    this.move = 1
    this.movesLeft = 1
    this.maxMoves = 1
    this.attack = 2
    this.health = 2
    this.maxHealth = 2
    this.range = 1
  }
}

export default Warrior
