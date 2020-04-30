import inquirer from 'inquirer'
import Game from './Game/Game'
import readline from 'readline'
import Castle from './Cell/Structures/Castle'
import Town from './Cell/Structures/Town'
import {
  Soldier,
  Archer,
  Knight,
  Rogue,
  Priest,
  Wizard,
  Warrior
} from './Units/Units'
import { table } from 'table'
import Academy from './Cell/Structures/Academy'
import Lodge from './Cell/Structures/Lodge'
import Temple from './Cell/Structures/Temple'
import City from './Cell/Structures/City'
import randomcolor from 'randomcolor'
import chalk from 'chalk'
import Cell from './Cell/Cell'
import fs from 'fs'
import os from 'os'

const homedir = os.homedir()

const main = async () => {
  const renderCell = (cell: Cell) => `${
    cell.controlledBy
      ? `*** ${game.getPlayer(cell.controlledBy)!.name} ***

`
      : ''
  }${game.isInRange(cell.x, cell.y) ? `## ${cell.terrain} ##` : cell.terrain}
${
  cell.structure
    ? `${cell.structure.name}
`
    : ''
}${game
    .Units()
    .atLoc(cell.x, cell.y)
    .get()
    .map(unit => {
      let code = ''
      switch (unit.name.toLowerCase()) {
        case 'soldier':
          code = 'So'
          break
        case 'warrior':
          code = 'Wa'
          break
        case 'archer':
          code = 'Ar'
          break
        case 'knight':
          code = 'Kn'
          break
        case 'rogue':
          code = 'Ro'
          break
        case 'priest':
          code = 'Pr'
          break
        case 'wizard':
          code = 'Wi'
          break
      }
      return game.selectedUnitList.includes(unit.id) ? `[${code}]` : code
    })}`

  const getCommand = async () => {
    console.log(
      table(
        game
          .Cells()
          .grid.map(row =>
            row.map(cell =>
              game.selectedCell().x === cell.x &&
              game.selectedCell().y === cell.y
                ? chalk
                    .hex(
                      cell.controlledBy
                        ? game.Players().is(cell.controlledBy)!.color
                        : '#FFFFFF'
                    )
                    .inverse(renderCell(cell))
                : chalk.hex(
                    cell.controlledBy
                      ? game.Players().is(cell.controlledBy)!.color
                      : '#FFFFFF'
                  )(renderCell(cell))
            )
          )
      )
    )
    console.log('')
    console.log(game.activePlayer()!.name + "'s turn")
    const { actions, gold } = game.activePlayer()!.resources
    const farms = game.farmsOwnedBy(game.activePlayer()!.id)
    const towns = game.townsOwnedBy(game.activePlayer()!.id)
    const units = game
      .Units()
      .controlledBy(game.activePlayer()!.id)
      .count()
    console.log(`Actions: ${actions}
Gold: ${gold}
Farms: ${farms}
Towns/Castles: ${towns}
Units: ${units}
`)

    console.log(
      `You are in position ${game
        .scorecard()
        .findIndex(score => score.id === game.activePlayer()!.id) + 1}`
    )
    if (!game.activePlayer()!.isHuman) {
      await game.runComputerTurn()
      await game.endTurn()
    } else {
      const input: string = await askQuestion(
        `${game.activePlayer()!.name} @ [${game.selectedCell().x},${
          game.selectedCell().y
        } | ${game.selectedCell().terrain}${
          game.selectedCell().structure
            ? ` | ${game.selectedCell().structure!.name}`
            : ''
        }] Enter a command: `
      )
      const command = input.toLowerCase().split(' ')
      switch (command[0]) {
        case 'show':
          switch (command[1]) {
            case 'analysis':
              console.log(game.analyze()[0])
              break
            case 'score':
            case 'scores':
              console.log(game.scorecard())
              break
            case 'selected':
              switch (command[2]) {
                case 'cell':
                  console.log(game.selectedCell())
                  console.log(
                    game
                      .Units()
                      .atLoc(game.selectedCell().x, game.selectedCell().y)
                  )
                  break
                case 'units':
                  console.log(game.selectedUnits())
              }
              break
            case 'cell':
              const coords = command[2].split(',')
              console.log(
                game
                  .Cells()
                  .atLoc(parseInt(coords[0], 10), parseInt(coords[1], 10))
              )
              break
            case 'my':
              switch (command[2]) {
                case 'structure':
                case 'structures':
                case 'building':
                case 'buildings':
                  console.log(
                    game
                      .Cells()
                      .controlledBy(game.activePlayer()!.id)
                      .hasStructure()
                      .get()
                  )
                  break
                case 'castle':
                case 'castles':
                  console.log(
                    game
                      .Cells()
                      .controlledBy(game.activePlayer()!.id)
                      .hasStructure([Castle.structureName])
                      .get()
                  )
                  break
                case 'town':
                case 'towns':
                  console.log(
                    game
                      .Cells()
                      .controlledBy(game.activePlayer()!.id)
                      .hasStructure([Town.structureName])
                      .get()
                  )
                  break
                case 'cells':
                  console.log(
                    game
                      .Cells()
                      .controlledBy(game.activePlayer()!.id)
                      .get()
                  )
                  break
                case 'units':
                  console.log(
                    game
                      .Units()
                      .controlledBy(game.activePlayer()!.id)
                      .get()
                  )
                  break
                case 'resources':
                  const { actions, gold } = game.activePlayer()!.resources
                  const farms = game.farmsOwnedBy(game.activePlayer()!.id)
                  const towns = game.townsOwnedBy(game.activePlayer()!.id)
                  const units = game
                    .Units()
                    .controlledBy(game.activePlayer()!.id)
                    .count()
                  console.log(`Actions: ${actions}
Gold: ${gold}
Farms: ${farms}
Towns/Castles: ${towns}
Units: ${units}`)
              }
              break
            case 'range':
              console.log(
                `Showing distance from ${game.selectedCell().x},${
                  game.selectedCell().y
                }`
              )
              console.log(`Move cost: ${game.getMoveCost()}`)
              console.log(game.getCellsInRange())
              break
          }
          break
        case 'select':
          switch (command[1]) {
            case 'cell':
              const coords = command[2].split(',')

              game.selectCell(parseInt(coords[0], 10), parseInt(coords[1], 10))
              console.log(`Cell ${coords} selected.`)
              break
            case 'unit':
              if (game.selectableUnits().length > 0) {
                const toSelect = await inquirer.prompt([
                  {
                    type: 'checkbox',
                    name: 'selectUnit',
                    message: 'Select units',
                    choices: game.selectableUnits().map(unit => ({
                      name: `${unit.name} (ATK: ${unit.attack} | HP: ${unit.health} | Moves: ${unit.movesLeft})`,
                      value: unit.id
                    }))
                  }
                ])
                toSelect.selectUnit.forEach(id => {
                  game.selectUnit(id)
                })
              } else {
                console.log('No units available to select!')
              }
          }
          break
        case 'build':
          switch (command[1]) {
            case 'castle':
            case 'academy':
            case 'lodge':
            case 'temple':
            case 'city':
              await game
                .upgradeTo(command[1])
                .then(res => console.log(res))
                .catch(res => console.log(res))
              break
            case 'unit':
              if (!game.selectedCell().structure) {
                console.log('There is no building here.')
              } else if (
                game.selectedCell().controlledBy !== game.activePlayer()!.id
              ) {
                console.log('You do not control this cell.')
              } else {
                const toBuild: { selectUnit: string } = await inquirer.prompt([
                  {
                    type: 'list',
                    name: 'selectUnit',
                    message: 'Choose a unit to build',
                    choices: game.selectedCell().structure!.buildUnits
                  }
                ])
                await game
                  .buildUnit(toBuild.selectUnit.toLowerCase())
                  .then(res => console.log(res))
                  .catch(res => console.log(res))
              }
              break
          }
          break
        case 'move':
          const coords = command[1].split(',')
          await game
            .moveSelectedUnits(parseInt(coords[0], 10), parseInt(coords[1], 10))
            .then(res => console.log(res))
            .catch(res => console.log(res))
          break
        case 'pass':
          await game
            .endTurn()
            .then(res => console.log(res))
            .catch(() => false)
          break
        case 'save':
          const fileName = await askQuestion(
            'What do you want to name this game? '
          )
          if (!fs.existsSync(`${homedir}/.juralen`))
            fs.mkdirSync(`${homedir}/.juralen`)
          fs.writeFileSync(
            `${homedir}/.juralen/${fileName}.json`,
            game.export()
          )
          console.log(`${fileName} saved!`)
          break
        case 'load':
          const files = fs.readdirSync(`${homedir}/.juralen`)
          const selected = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectFile',
              message: 'Select a file to load',
              choices: files.map(file => file.replace('.json', ''))
            }
          ])
          if (
            fs.existsSync(`${homedir}/.juralen/${selected.selectFile}.json`)
          ) {
            const jsonBuffer = fs.readFileSync(
              `${homedir}/.juralen/${selected.selectFile}.json`,
              'utf-8'
            )
            game.import(jsonBuffer.toString())
          } else console.log('File does not exist!')
          break
        case 'exit':
          console.log('Exiting')
          return false
        default:
          console.log('Unknown command')
      }
    }

    return !game.gameOver ? getCommand() : null
  }

  let game: Game
  let playerCount = 0
  let size = 0
  while (playerCount <= 0 && size <= 0) {
    const sizeInput = await askQuestion('Game size? ')
    size = parseInt(sizeInput, 10)
    const input = await askQuestion('How many players? ')
    playerCount = parseInt(input, 10)
  }
  const newPlayers: Array<{
    name: string
    isHuman: boolean
    color: string
  }> = []
  for (let i = 0; i < playerCount; i++) {
    const results = await inquirer.prompt([
      {
        type: 'input',
        name: `name`,
        message: `Player ${i + 1} - Enter a name: `,
        default: `Player${i + 1}`
      },
      {
        type: 'list',
        name: `isHuman`,
        message: 'Human or AI?',
        choices: [
          {
            name: 'Human',
            value: true
          },
          {
            name: 'AI',
            value: false
          }
        ]
      }
    ])
    newPlayers.push({
      name: results.name,
      isHuman: results.isHuman,
      color: randomcolor()
    })
  }

  game = new Game(newPlayers, { x: size, y: size })
  getCommand()
}

main()

function askQuestion(query): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close()
      resolve(ans)
    })
  )
}
