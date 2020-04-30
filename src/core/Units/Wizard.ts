import Unit from './Unit'

class Wizard extends Unit {
  constructor(x: number, y: number, playerId: string) {
    super(x, y, playerId)
    this.name = 'Wizard'
    this.cost = 7
    this.move = 0.5
    this.movesLeft = 2
    this.maxMoves = 2
    this.attack = 2
    this.health = 2
    this.maxHealth = 2
    this.range = 2
    this.description =
      'Highly mobile unit. Capable of teleporting other units across the board. Can also move twice.'
  }
}

export default Wizard
