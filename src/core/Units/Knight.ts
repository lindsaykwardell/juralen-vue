import Unit from './Unit'

class Knight extends Unit {
  constructor(x: number, y: number, playerId: string) {
    super(x, y, playerId)
    this.name = 'Knight'
    this.cost = 6
    this.move = 1
    this.movesLeft = 3
    this.maxMoves = 3
    this.attack = 2
    this.health = 4
    this.maxHealth = 4
    this.range = 1
    this.description = 'Strong mobile unit. Can move three times.'
  }
}

export default Knight
