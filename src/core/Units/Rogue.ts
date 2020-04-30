import Unit from './Unit'

class Rogue extends Unit {
  constructor(x: number, y: number, playerId: string) {
    super(x, y, playerId)
    this.name = 'Rogue'
    this.cost = 5
    this.move = 1
    this.movesLeft = 2
    this.maxMoves = 2
    this.attack = 3
    this.health = 1
    this.maxHealth = 1
    this.range = 1
    this.description =
      'Offensive unit. Can move twice, and hides in the forest.'
  }
}

export default Rogue
