import Scenario from '../../Scenario/Scenario'
import Cell from '../../Cell/Cell'
import Unit from '../../Units/Unit'
import { plainToClass } from 'class-transformer'
import Structure from '../../Cell/Structures/Structure'

export default (scenario: Scenario) => {
  const thisPlayer = scenario.Players().is(scenario.activePlayer)!
  const enemyCells = scenario
    .Cells()
    .notControlledBy(scenario.activePlayer)
    .get()

  const getMoveList = () => {
    const results: IAction[] = []
    scenario
      .Cells()
      .controlledBy(thisPlayer.id)
      .get()
      .forEach(cell => {
        if (cell.structure) {
          cell.structure.buildUnits.forEach(unit => {
            const cost = () => {
              switch (unit.toLowerCase()) {
                case 'soldier':
                  return 1
                case 'warrior':
                  return 2
                case 'archer':
                  return 3
                case 'priest':
                  return 4
                case 'rogue':
                  return 5
                case 'knight':
                  return 6
                case 'wizard':
                  return 7
                default:
                  return 0
              }
            }
            if (thisPlayer.resources.gold >= cost()) {
              results.push({
                x: cell.x,
                y: cell.y,
                action: `build:${unit}`,
                desc: `Build ${unit}`,
                id: []
              })
            }
          })
          if (
            cell.structure.name === 'Town' &&
            thisPlayer.resources.gold >= 7
          ) {
            const roll = Math.floor(Math.random() * 51)
            if (roll >= 0 && roll <= 10) {
              results.push({
                x: cell.x,
                y: cell.y,
                action: 'upgrade:Lodge',
                desc: 'Upgrade to Lodge',
                id: []
              })
            }
            if (roll > 10 && roll <= 20) {
              results.push({
                x: cell.x,
                y: cell.y,
                action: 'upgrade:City',
                desc: 'Upgrade to City',
                id: []
              })
            }
            if (roll > 20 && roll <= 30) {
              results.push({
                x: cell.x,
                y: cell.y,
                action: 'upgrade:Castle',
                desc: 'Upgrade to Castle',
                id: []
              })
            }
            if (roll > 30 && roll <= 40) {
              results.push({
                x: cell.x,
                y: cell.y,
                action: 'upgrade:Academy',
                desc: 'Upgrade to Academy',
                id: []
              })
            }
            if (roll > 40 && roll <= 50) {
              results.push({
                x: cell.x,
                y: cell.y,
                action: 'upgrade:Temple',
                desc: 'Upgrade to Temple',
                id: []
              })
            }
            results.push({
              x: cell.x,
              y: cell.y,
              action: 'upgrade:Castle',
              desc: 'Upgrade to Castle',
              id: []
            })
          }
        }
        findUnitMoves(cell).forEach(result => results.push(result))
      })
    return results
  }

  const findUnitMoves = (cell: Cell, units: Unit[] = []) => {
    let results: IAction[] = []
    scenario
      .Units()
      .atLoc(cell.x, cell.y)
      .controlledBy(thisPlayer.id)
      .get()
      .filter(unit => !units.find(u => u.id === unit.id))
      .forEach(unit => {
        let baseMoveCost = unit.move
        units.forEach(unit => {
          baseMoveCost += unit.move
        })
        // Need to add Wizard check
        if (
          unit.movesLeft > 0 &&
          baseMoveCost <= thisPlayer.resources.actions
        ) {
          const optimalMoves = getOptimalMove(cell, [...units, unit])
          optimalMoves.forEach(thisOptimalMove => {
            if (thisOptimalMove.score > 0) {
              results.push({
                x: cell.x,
                y: cell.y,
                action: thisOptimalMove.isCombat ? 'attack' : 'move',
                desc: `Move ${[...units, unit].map(unit => unit.name)}`,
                id: [...units, unit].map(unit => unit.id),
                coords: { x: thisOptimalMove.x, y: thisOptimalMove.y },
                cost: thisOptimalMove.cost
              })
            }
          })
          results = [...results, ...findUnitMoves(cell, [...units, unit])]
        }
      })
    return results
  }

  const getOptimalMove = (thisCell: Cell, units: Unit[]): IMove[] => {
    const moveOptions: IMove[] = []
    scenario
      .Cells()
      .get()
      .forEach(cell => {
        if (cell.terrain !== 'Mountain') {
          const distance = scenario.getDistance(thisCell, cell)
          const moveCost = scenario.getMoveCost(units)
          const thisCost = distance * moveCost
          let score = 10
          if (thisPlayer.resources.actions >= thisCost && distance !== 0) {
            let distanceToEnemy = 100
            enemyCells.forEach(enemyCell => {
              const thisDistanceToEnemy = scenario.getDistance(cell, enemyCell)
              if (distanceToEnemy > thisDistanceToEnemy) {
                distanceToEnemy = thisDistanceToEnemy
              }
            })

            let isCombat = false
            if (
              scenario
                .Units()
                .atLoc(cell.x, cell.y)
                .notControlledBy(thisPlayer.id)
                .count() > 0
            ) {
              let won = 0
              let lost = 0
              for (let i = 0; i < 5; i++) {
                if (
                  simulateCombat(
                    { x: cell.x, y: cell.y },
                    { x: thisCell.x, y: thisCell.y }
                  )
                )
                  won++
                else lost++
              }
              // console.log('Won', won, 'Lost', lost)
              if (won > lost) {
                isCombat = true
                score += 15
              } else score -= 1000
            }
            const thisMove: IMove = {
              x: cell.x,
              y: cell.y,
              cost: distance * moveCost,
              structure: cell.structure,
              distanceToEnemy,
              score,
              isCombat
            }
            moveOptions.push(thisMove)
          }
        }
      })
    return moveOptions
  }

  const simulateCombat = (
    defCell: { x: number; y: number },
    atkCell: { x: number; y: number }
  ) => {
    const thisCell = plainToClass(Cell, {
      ...scenario.Cells().atLoc(defCell.x, defCell.y)
    })
    thisCell.structure = plainToClass(Structure, { ...thisCell.structure })

    const notMe = scenario
      .Units()
      .atLoc(defCell.x, defCell.y)
      .notControlledBy(thisPlayer.id)
      .get()[0].controlledBy

    let atkPlr = thisPlayer
    let defPlr = scenario.Players().is(notMe)

    let units = [
      ...scenario
        .Units()
        .atLoc(defCell.x, defCell.y)
        .get(),
      ...scenario
        .Units()
        .atLoc(atkCell.x, atkCell.y)
        .get()
    ].map(unit => plainToClass(Unit, { ...unit }))

    const atkUnits = () => units.filter(unit => unit.controlledBy === atkPlr.id)
    const defUnits = () =>
      units.filter(unit => unit.controlledBy === defPlr!.id)

    while (atkUnits().length > 0 && defUnits().length > 0) {
      const attacker = Math.floor(Math.random() * atkUnits().length)
      const defender = Math.floor(Math.random() * defUnits().length)

      // Attacker deals first damage
      // If cell has defBonus, and attacker is me, hit that first.
      // Rogues don't care about cell defBonus.
      // Priests don't attack
      if (atkUnits()[attacker].name !== 'Priest') {
        if (
          thisCell.defBonus > 0 &&
          atkPlr!.id === thisPlayer.id &&
          atkUnits()[attacker].name !== 'Rogue'
        ) {
          thisCell.takeDamage(atkUnits()[attacker].attack)
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
        // If structure has health, and defender is me, hit that first.
        // Rogues don't care about structure health.
        if (
          thisCell.defBonus > 0 &&
          defPlr!.id === thisPlayer.id &&
          defUnits()[defender].name !== 'Rogue'
        ) {
          thisCell.defBonus -= defUnits()[defender].attack
        } else {
          atkUnits()[attacker].health -= defUnits()[defender].attack
        }
      }
      // If one of the characters is a priest,
      // heal all of that player's units by one
      // (except the priest)
      if (atkUnits()[attacker].name === 'Priest') {
        atkUnits().forEach((unit, index) => {
          if (index !== attacker && unit.health < unit.maxHealth) {
            unit.health++
          }
        })
      }
      if (defUnits()[defender].name === 'Priest') {
        defUnits().forEach((unit, index) => {
          if (index !== defender && unit.health < unit.maxHealth) {
            unit.health++
          }
        })
      }

      // Remove defender if dead.
      if (defUnits()[defender].health <= 0) {
        units = units.filter(unit => unit.id !== defUnits()[defender].id)
      }
      // Remove attacker if dead.
      if (atkUnits()[attacker].health <= 0) {
        units = units.filter(unit => unit.id !== atkUnits()[attacker].id)
      }
      if (units.filter(unit => unit.name !== 'Priest').length <= 0) {
        units.forEach(unit => {
          unit.controlledBy = notMe
        })
      }
      // Switch who goes first
      if (atkPlr === thisPlayer) {
        atkPlr = scenario.Players().is(notMe)!
        defPlr = thisPlayer
      } else {
        atkPlr = thisPlayer
        defPlr = scenario.Players().is(notMe)!
      }
    }
    return units.filter(unit => unit.controlledBy === thisPlayer.id).length > 0
  }

  const scoreMove = (a: IAction) => {
    let score = 10
    if (a.action.includes('attack')) {
      score +=
        10 -
        (scenario.getDistance(
          { x: a.x, y: a.y },
          { x: a.coords!.x, y: a.coords!.y }
        ) * 2)
      if (scenario.Cells().atLoc(a.coords!.y, a.coords!.y).structure)
        score += 100
      // Give precedence to attacking the current leader or the weakest opponent.
      if (
        scenario.Cells().atLoc(a.coords!.y, a.coords!.y).controlledBy ===
          scenario.firstPlace().id ||
        scenario.Cells().atLoc(a.coords!.y, a.coords!.y).controlledBy ===
          scenario.lastPlace()!.id
      )
        score += 15
    }
    if (a.action.includes('build')) {
      const action = a.action.split(':')
      if (
        scenario
          .Units()
          .atLoc(a.x, a.y)
          .count() > 4
      )
        score -= scenario
          .Units()
          .atLoc(a.x, a.y)
          .count()
      const cost = () => {
        switch (action[1]) {
          case 'Soldier':
            return 1
          case 'Warrior':
            score++
            return 2
          case 'Archer':
            score++
            return 3
          case 'Priest':
            if (
              scenario
                .Units()
                .atLoc(a.x, a.y)
                .controlledBy(thisPlayer.id)
                .count() <= 0
            )
              score -= 1000
            else {
              let onlyPriests = true
              scenario
                .Units()
                .atLoc(a.x, a.y)
                .controlledBy(thisPlayer.id)
                .get()
                .forEach(unit => {
                  if (unit.name !== 'Priest') {
                    onlyPriests = false
                    if (unit.health < unit.maxHealth) score += 3
                  }
                })
              if (onlyPriests) score -= 1000
              else score++
            }
            return 4
          case 'Rogue':
            score += 2
            return 5
          case 'Knight':
            score += 3
            return 6
          case 'Wizard':
            score += 2
            return 7
          default:
            return 0
        }
      }
      if (
        scenario
          .Units()
          .controlledBy(thisPlayer.id)
          .count() >=
          scenario
            .Cells()
            .controlledBy(thisPlayer.id)
            .count() ||
        thisPlayer.resources.gold < cost()
      ) {
        score -= 1000
      } else {
        score += Math.abs(
          scenario
            .Units()
            .atLoc(a.x, a.y)
            .count() - 8
        )
        if (
          scenario
            .Cells()
            .controlledBy(thisPlayer.id)
            .count() /
            2 >=
          scenario
            .Units()
            .controlledBy(thisPlayer.id)
            .count()
        )
          score += 2
        let distanceToEnemy = 100
        scenario
          .Cells()
          .notControlledBy(thisPlayer.id)
          .hasUnit()
          .get()
          .forEach(cell => {
            const thisDistanceToEnemy = scenario.getDistance(
              { x: a.x, y: a.y },
              { x: cell.x, y: cell.y }
            )
            if (distanceToEnemy < thisDistanceToEnemy)
              distanceToEnemy = thisDistanceToEnemy
          })
        if (distanceToEnemy <= 4) {
          if (
            scenario
              .Units()
              .atLoc(a.x, a.y)
              .count() <=
            scenario
              .Units()
              .notControlledBy(thisPlayer.id)
              .withinDistance(4, { x: a.x, y: a.y })
              .count()
          ) {
            score += 100
          }
        }
      }
    }
    if (a.action.includes('move')) {
      score +=
        5 -
        (scenario.getDistance(
          { x: a.x, y: a.y },
          { x: a.coords!.x, y: a.coords!.y }
        ) * 2)
      // If the cell has a structure
      // and all units are selected
      // and no new units can be built there
      // do not move
      if (
        scenario.Cells().atLoc(a.x, a.y).structure &&
        scenario
          .Units()
          .atLoc(a.x, a.y)
          .count() === a.id.length &&
        thisPlayer.resources.gold < 1
      ) {
        score -= 1000
      }
      if (
        scenario.Cells().atLoc(a.coords!.x, a.coords!.y).controlledBy !==
        thisPlayer.id
      )
        score += 25
      if (
        scenario
          .Cells()
          .controlledBy(thisPlayer.id)
          .count() <=
        scenario
          .Units()
          .controlledBy(thisPlayer.id)
          .count()
      ) {
        score += 10
      }
      if (
        scenario.Cells().atLoc(a.x, a.y).structure &&
        scenario
          .Units()
          .atLoc(a.x, a.y)
          .count() -
          a.id.length <=
          0
      ) {
        score -= 5
      }
      if (
        scenario
          .Units()
          .notControlledBy(thisPlayer.id)
          .withinDistance(1, { x: a.coords!.x, y: a.coords!.y })
          .get()
          .find(unit => scenario.Cells().atLoc(unit.x, unit.y).structure)
      ) {
        score += scenario
          .Units()
          .atLoc(a.coords!.x, a.coords!.y)
          .controlledBy(thisPlayer.id)
          .count()
      }

      if (
        scenario
          .Units()
          .controlledBy(thisPlayer.id)
          .atLoc(a.coords!.x, a.coords!.y)
          .count() > 4
      ) {
        score -= 1000
      }
      if (
        scenario.Cells().atLoc(a.coords!.x, a.coords!.y).structure &&
        scenario.Cells().atLoc(a.coords!.x, a.coords!.y).controlledBy !==
          thisPlayer.id &&
        scenario
          .Units()
          .atLoc(a.coords!.x, a.coords!.y)
          .count() <= 0
      )
        score += 100

      // Give precedence to attacking the current leader or the weakest opponent.
      if (
        scenario.Cells().atLoc(a.coords!.y, a.coords!.y).controlledBy ===
          scenario.firstPlace().id ||
        scenario.Cells().atLoc(a.coords!.y, a.coords!.y).controlledBy ===
          scenario.lastPlace()!.id
      )
        score += 15
    }
    return score
  }

  const results = getMoveList()

  results.forEach(result => {
    result.score = scoreMove(result)
  })

  results.sort((a, b) => {
    let scorea = a.score!
    let scoreb = b.score!

    if (scorea === scoreb) {
      enemyCells.forEach(cell => {
        const adiff = scenario.getDistance(
          { x: a.x, y: a.y },
          { x: cell.x, y: cell.y }
        )
        const bdiff = scenario.getDistance(
          { x: b.x, y: b.y },
          { x: cell.x, y: cell.y }
        )
        if (adiff > bdiff) scoreb++
        if (adiff < bdiff) scorea++
      })
    }

    return scoreb - scorea
  })

  return results
}

interface IMove {
  x: number
  y: number
  cost: number
  structure: Structure | null
  distanceToEnemy: number
  score: number
  isCombat: boolean
}

interface IAction {
  x: number
  y: number
  action: string
  desc: string
  id: string[]
  coords?: { x: number; y: number }
  score?: number
  cost?: number
}
