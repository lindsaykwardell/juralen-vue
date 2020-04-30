import 'reflect-metadata'
import Scenario from '../Scenario/Scenario'
import Unit from '../Units/Unit'
import Castle from '../Cell/Structures/Castle'
import { findUnit } from '../Units/Units'
import Structure from '../Cell/Structures/Structure'
import Academy from '../Cell/Structures/Academy'
import Temple from '../Cell/Structures/Temple'
import City from '../Cell/Structures/City'
import Lodge from '../Cell/Structures/Lodge'

export default class Game {
  private scenario: Scenario
  private x: number
  private y: number
  public selectedUnitList: string[]
  public gameOver: boolean = false
  private callback: () => void

  constructor(
    playerList: Array<{ name: string; isHuman: boolean; color: string }>,
    grid: { x: number; y: number } = { x: 9, y: 9 },
    callback = () => null
  ) {
    this.scenario = new Scenario(playerList, grid)
    const startingCell = this.scenario
      .Cells()
      .controlledBy(this.scenario.activePlayer)
      .hasStructure(['Citadel'])
      .get()[0]
    this.x = startingCell.x
    this.y = startingCell.y
    this.selectedUnitList = []
    this.callback = callback

    console.log('The Game has begun!')
    console.log(`${this.activePlayer()!.name} will begin.`)
    console.log(' ')
  }

  public init = () => {
    this.callback()
  }

  public scorecard = () => {
    return this.scenario.checkScores()
  }

  public getPlayer = (id: string) => {
    return this.scenario.Players().is(id)
  }

  public selectCell = (x: number, y: number) => {
    this.x = x
    this.y = y
    this.selectedUnitList = []
    this.callback()
  }

  public selectUnit = (id: string) => {
    this.selectedUnitList.push(id)
    this.callback()
  }

  public selectableUnits = () => {
    return this.scenario
      .Units()
      .atLoc(this.selectedCell().x, this.selectedCell().y)
      .controlledBy(this.activePlayer()!.id)
      .get()
      .filter(
        unit => unit.movesLeft > 0 && !this.selectedUnitList.includes(unit.id)
      )
  }

  public upgradeTo = (structName: string) => {
    return new Promise((resolve, reject) => {
      if (
        this.selectedCell().structure &&
        this.selectedCell().structure!.name === 'Town' &&
        this.activePlayer()!.resources.gold >= 7
      ) {
        let struct: typeof Structure = Structure
        switch (structName) {
          case 'castle':
            struct = Castle
            break
          case 'academy':
            struct = Academy
            break
          case 'temple':
            struct = Temple
            break
          case 'city':
            struct = City
            break
          case 'lodge':
            struct = Lodge
            break
        }

        this.activePlayer()!.resources.gold -= 7
        this.selectedCell().buildStructure(struct)
        this.callback()
        resolve(
          `A ${struct.structureName} has been built at ${
            this.selectedCell().x
          },${this.selectedCell().y} by ${this.activePlayer()!.name}`
        )
      } else reject('You cannot build a ${struct.structureName} here.')
    })
  }

  public selectAllUnits = () => {
    this.selectedUnitList = this.scenario
      .Units()
      .atLoc(this.selectedCell().x, this.selectedCell().y)
      .controlledBy(this.activePlayer()!.id)
      .get()
      .map(unit => unit.id)
    this.callback()
  }

  public unselectUnit = (id: string) => {
    this.selectedUnitList = this.selectedUnitList.filter(unit => unit !== id)
    this.callback()
  }

  public unselectAllUnits = () => {
    this.selectedUnitList = []
    this.callback()
  }

  public buildUnit = (unitName: string) => {
    const unit = findUnit(unitName)
    return new Promise((resolve, reject) => {
      const newUnit = new unit(
        this.selectedCell().x,
        this.selectedCell().y,
        this.scenario.activePlayer
      )
      if (this.activePlayer()!.resources.gold - newUnit.cost < 0)
        reject(`You do not have enough gold!`)
      else if (
        this.farmsOwnedBy(this.activePlayer()!.id) <=
        this.scenario
          .Units()
          .controlledBy(this.activePlayer()!.id)
          .count()
      )
        reject(`You do not have enough farms!`)
      else {
        this.scenario.addUnit(newUnit)
        this.activePlayer()!.resources.gold -= newUnit.cost
        resolve(
          `${this.activePlayer()!.name} built a ${unit.name} in ${
            this.selectedCell().x
          }, ${this.selectedCell().y}`
        )
      }
      this.callback()
    })
  }

  public getCellsInRange = () => {
    const inRangeCells: Array<{ x: number; y: number }> = []
    this.scenario
      .Cells()
      .get()
      .forEach(cell => {
        if (this.isInRange(cell.x, cell.y)) {
          inRangeCells.push({ x: cell.x, y: cell.y })
        }
      })
    return inRangeCells
  }

  public moveSelectedUnits = (x: number, y: number) => {
    return new Promise((resolve, reject) => {
      if (
        this.isInRange(x, y) &&
        this.getDistance(
          { x: this.selectedCell().x, y: this.selectedCell().y },
          { x, y }
        ) > 0
      ) {
        this.activePlayer()!.resources.actions -=
          this.getMoveCost() *
          this.getDistance(
            { x, y },
            { x: this.selectedCell().x, y: this.selectedCell().y }
          )
        this.selectedUnits().forEach(unit => {
          unit.x = x
          unit.y = y
          unit.movesLeft--
        })
        this.selectedUnitList = []
        this.selectCell(x, y)
        if (
          this.scenario
            .Units()
            .atLoc(x, y)
            .notControlledBy(this.activePlayer()!.id)
            .count() > 0
        ) {
          this.performCombat(x, y)
        }

        this.scenario.Cells().atLoc(x, y).controlledBy = this.scenario
          .Units()
          .atLoc(x, y)
          .get()[0].controlledBy
        resolve(`${this.activePlayer()!.name} has moved units to ${x},${y}`)
      } else {
        reject("We can't get there.")
      }
      this.callback()
    })
  }

  public performCombat = (x: number, y: number) => {
    const thisCell = this.scenario.Cells().atLoc(x, y)
    const notMe = this.scenario
      .Units()
      .atLoc(x, y)
      .notControlledBy(this.activePlayer()!.id)
      .get()[0].controlledBy

    let atkPlr = this.activePlayer()
    let defPlr = this.getPlayer(notMe)

    const atkUnits = () =>
      this.scenario
        .Units()
        .atLoc(x, y)
        .controlledBy(atkPlr!.id)
        .get()
    const defUnits = () =>
      this.scenario
        .Units()
        .atLoc(x, y)
        .controlledBy(defPlr!.id)
        .get()

    while (atkUnits().length > 0 && defUnits().length > 0) {
      const attacker = Math.floor(Math.random() * atkUnits().length)
      const defender = Math.floor(Math.random() * defUnits().length)

      console.log(
        `${atkUnits()[attacker].name} is attacking ${defUnits()[defender].name}`
      )
      // Attacker deals first damage
      // If cell has defBonus, and attacker is me, hit that first.
      // Rogues don't care about cell defBonus.
      // Priests don't attack
      if (atkUnits()[attacker].name !== 'Priest') {
        if (
          thisCell.defBonus > 0 &&
          atkPlr!.id === this.activePlayer()!.id &&
          atkUnits()[attacker].name !== 'Rogue'
        ) {
          thisCell.takeDamage(atkUnits()[attacker].attack)
          console.log(`Defense bonus reduced to ${thisCell.defBonus}`)
        } else {
          // Otherwise, hit the unit.
          defUnits()[defender].health -= atkUnits()[attacker].attack
        }
      }

      // If defender is still alive AND is in range, attack back.
      // Priests don't attack, but are never in range.
      // So we don't need an additional check for priest here.
      if (
        defUnits()[defender].health > 0 &&
        defUnits()[defender].range >= atkUnits()[attacker].range
      ) {
        console.log(
          `${defUnits()[defender].name} is attacking ${
            atkUnits()[attacker].name
          }`
        )
        // If structure has health, and defender is me, hit that first.
        // Rogues don't care about structure health.
        if (
          thisCell.defBonus > 0 &&
          defPlr!.id === this.activePlayer()!.id &&
          defUnits()[defender].name !== 'Rogue'
        ) {
          thisCell.defBonus -= defUnits()[defender].attack
          console.log(`Defense bonus reduced to ${thisCell.defBonus}`)
        } else {
          atkUnits()[attacker].health -= defUnits()[defender].attack
        }
      }
      // If one of the characters is a priest,
      // heal all of that player's units by one
      // (except the priest)
      if (atkUnits()[attacker].name === 'Priest') {
        console.log(`${atkPlr!.name}'s priest is healing the party...`)
        atkUnits().forEach((unit, index) => {
          if (index !== attacker && unit.health < unit.maxHealth) {
            unit.health++
          }
        })
      }
      if (defUnits()[defender].name === 'Priest') {
        console.log(`${defPlr!.name} priest is healing the party...`)
        defUnits().forEach((unit, index) => {
          if (index !== defender && unit.health < unit.maxHealth) {
            unit.health++
          }
        })
      }

      // Remove defender if dead.
      if (defUnits()[defender].health <= 0) {
        console.log(`${defPlr!.name}'s ${defUnits()[defender].name} is dead!`)
        this.scenario.removeUnit(defUnits()[defender])
      }
      // Remove attacker if dead.
      if (atkUnits()[attacker].health <= 0) {
        console.log(`${atkPlr!.name}'s ${atkUnits()[attacker].name} is dead!`)
        this.scenario.removeUnit(atkUnits()[attacker])
      }

      if (
        this.scenario
          .Units()
          .atLoc(x, y)
          .get()
          .filter(unit => unit.name !== 'Priest').length <= 0
      ) {
        this.scenario
          .Units()
          .atLoc(x, y)
          .controlledBy(this.activePlayer()!.id)
          .get()
          .forEach(unit => {
            console.log(
              `${this.activePlayer()!.name}'s ${
                unit.name
              } has surrendered and joined with ${this.getPlayer(notMe)!.name}!`
            )
            unit.controlledBy = notMe
          })
      }

      // Switch who goes first
      if (atkPlr === this.activePlayer()) {
        atkPlr = this.getPlayer(notMe)
        defPlr = this.activePlayer()
      } else {
        atkPlr = this.activePlayer()
        defPlr = this.getPlayer(notMe)
      }
    }
  }

  public isInRange = (x: number, y: number) => {
    return (
      this.selectedUnitList.length > 0 &&
      this.scenario.Cells().atLoc(x, y).passable !== false &&
      this.activePlayer()!.resources.actions >=
        this.getMoveCost() *
          this.getDistance(
            { x, y },
            { x: this.selectedCell().x, y: this.selectedCell().y }
          )
    )
  }

  public getMoveCost = () => {
    let cost = 0
    let wizard: Unit | null = null
    this.selectedUnits().forEach(unit => {
      cost += unit.move
      if (unit.name === 'Wizard') wizard = unit
    })
    if (wizard) {
      cost = this.selectedUnitList.length * wizard!.move
    }
    return cost
  }

  public endTurn = async () => {
    return new Promise(async (resolve, reject) => {
      this.scenario
        .Cells()
        .hasStructure()
        .get()
        .forEach(cell => {
          if (cell.defBonus < cell.structure!.initDefBonus) cell.defBonus++
        })
      this.scenario
        .Units()
        .get()
        .forEach(unit => {
          unit.movesLeft = unit.maxMoves
        })
      const allPriests = this.scenario
        .Units()
        .is(['Priest'])
        .get()
      allPriests.forEach(priest => {
        const units = this.scenario
          .Units()
          .atLoc(priest.x, priest.y)
          .get()
        units.forEach(unit => {
          if (unit.id !== priest.id && unit.health < unit.maxHealth) {
            console.log('Healing!')
            unit.health++
          }
        })
      })
      const prevPlayer = this.activePlayer()!.id
      this.scenario.activePlayer = this.scenario
        .Players()
        .next(this.activePlayer()!.id).id
      await this.scenario.checkObjectives(prevPlayer).catch(result => {
        if (result) {
          console.log(
            `${this.scenario.Players().is(prevPlayer)!.name} has won!`
          )
          this.gameOver = true
          reject()
        } else {
          console.log(
            `${this.scenario.Players().is(prevPlayer)!.name} has lost!`
          )
        }
      })
      if (
        this.scenario
          .Players()
          .hasNotLost()
          .count() === 1
      ) {
        console.log(
          `${
            this.scenario
              .Players()
              .hasNotLost()
              .get()[0].name
          } has won!`
        )
        this.gameOver = true
        reject()
      }
      this.gatherResources()
      this.callback()
      resolve(`${this.activePlayer()!.name}'s turn`)
    })
  }

  public gatherResources = () => {
    const farms = this.farmsOwnedBy(this.activePlayer()!.id)
    const towns = this.townsOwnedBy(this.activePlayer()!.id)

    this.activePlayer()!.resources.actions = towns + 3
    this.activePlayer()!.resources.gold += farms
  }

  public analyze = () => {
    return this.activePlayer()!.ai(this.scenario)
  }

  public runComputerTurn = () => {
    return new Promise((resolve, reject) => {
      let prevOption = {}
      let prevCount = 0
      const runningTurn = setInterval(() => {
        this.callback()
        const options = this.analyze()

        const action = options.length > 0 ? options[0] : null
        if (!action) resolve()
        if (options.length > 0 && options[0].score >= 0) {
          if (JSON.stringify(prevOption) === JSON.stringify(options[0])) {
            if (prevCount >= 5) {
              clearInterval(runningTurn)
              resolve()
            } else {
              prevCount++
              this.runComputerAction(options[0])
                .then(res => console.log(res))
                .catch(res => console.log(res))
            }
          } else {
            prevOption = options[0]

            this.runComputerAction(options[0])
              .then(res => console.log(res))
              .catch(res => console.log(res))
          }
        } else {
          clearInterval(runningTurn)
          resolve()
        }
      }, 500)
    })
  }

  public runComputerAction = async s => {
    if (s.action.includes('build')) {
      const option = s.action.split(':')
      this.selectCell(s.x, s.y)

      return this.buildUnit(option[1])
    }
    if (s.action.includes('upgrade')) {
      const option = s.action.split(':')
      this.selectCell(s.x, s.y)

      return this.upgradeTo(option[1].toLowerCase())
    }
    if (s.action.includes('move') || s.action.includes('attack')) {
      this.selectCell(s.x, s.y)
      s.id.forEach(id => {
        this.selectUnit(id)
      })

      return this.moveSelectedUnits(s.coords.x, s.coords.y)
    }
  }

  public farmsOwnedBy = (id: string) =>
    this.scenario
      .Cells()
      .controlledBy(id)
      .count()

  public townsOwnedBy = (id: string) =>
    this.scenario
      .Cells()
      .controlledBy(id)
      .hasStructure()
      .count()

  public activePlayer = () =>
    this.scenario.Players().is(this.scenario.activePlayer)

  public selectedCell = () => this.scenario.Cells().atLoc(this.x, this.y)

  public selectedUnits = () =>
    this.scenario
      .Units()
      .get()
      .filter(unit => this.selectedUnitList.includes(unit.id))

  private getDistance = (
    loc1: { x: number; y: number },
    loc2: { x: number; y: number }
  ) => Math.abs(loc1.x - loc2.x) + Math.abs(loc1.y - loc2.y)

  public Units = () => this.scenario.Units()
  public Cells = () => this.scenario.Cells()
  public Players = () => this.scenario.Players()

  public export = () => {
    return JSON.stringify({ ...this, scenario: this.scenario.export() })
  }

  public import = (json: string) => {
    const data = JSON.parse(json)
    this.scenario.import(data.scenario)
    this.x = data.x
    this.y = data.y
    this.gameOver = data.gameOver
  }
}
