import uuid from 'uuid/v4'

export default class Unit {
  public id: string
  public name: string
  public cost: number
  public move: number
  public movesLeft: number
  public maxMoves: number
  public attack: number
  public health: number
  public maxHealth: number
  public range: number
  public description: string
  public controlledBy: string
  public x: number
  public y: number

  constructor(x: number, y: number, playerId: string) {
    this.x = x
    this.y = y
    this.id = uuid()
    this.name = 'Unit'
    this.cost = 0
    this.move = 0
    this.movesLeft = 0
    this.maxMoves = 0
    this.attack = 0
    this.health = 0
    this.maxHealth = 0
    this.range = 0
    this.description = "You shouldn't see this."
    this.controlledBy = playerId
  }

  public isBuilt() {
    // if (isElectron && sfx.built[this.name]) {
    //   const audio = new Audio();
    //   audio.src = sfx.built[this.name];
    //   audio.play();
    // }
  }

  public isClicked() {
    // if (isElectron && sfx.clicked[this.name]) {
    //   const audio = new Audio();
    //   audio.src = sfx.clicked[this.name];
    //   audio.play();
    // }
  }

  public takeDamage(dmg) {
    this.health -= dmg
  }

  public isDead() {
    if (this.health <= 0) {
      return true
    } else {
      return false
    }
  }
}
