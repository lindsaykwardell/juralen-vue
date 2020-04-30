import Unit from './Unit'

class Soldier extends Unit {
  constructor(x: number, y: number, playerId: string) {
    super(x, y, playerId)
    this.name = 'Soldier'
    this.cost = 1
    this.move = 1
    this.movesLeft = 1
    this.maxMoves = 1
    this.attack = 1
    this.health = 2
    this.maxHealth = 2
    this.range = 1
  }
}

export default Soldier
