<template>
  <div>
    <div>
      <div class="flex">
        <div class="p-2 flex-shrink w-3/4">
          <table class="board">
            <tr v-for="(row, x) in grid" :key="x">
              <td
                v-for="(cell, y) in row"
                :key="y"
                :style="
                  `border: 1px solid black; ${cell.controlledBy &&
                    `background: ${
                      game.getPlayer(cell.controlledBy).color
                    }; color: ${
                      isDarkColor(game.getPlayer(cell.controlledBy).color)
                        ? 'white'
                        : 'black'
                    }`}`
                "
              >
                <div
                  class="cell"
                  :style="
                    mySelectedCell &&
                    cell.x === mySelectedCell.x &&
                    cell.y === mySelectedCell.y
                      ? 'border: 2px solid yellow'
                      : ''
                  "
                  @click="cellClickHandler(cell.x, cell.y)"
                  @contextmenu.prevent="moveUnitsHandler(cell.x, cell.y)"
                >
                  {{
                    cell.controlledBy
                      ? ` ${game.getPlayer(cell.controlledBy).name} `
                      : ''
                  }}
                  <br />
                  {{
                    game.isInRange(cell.x, cell.y)
                      ? `## ${cell.terrain} ##`
                      : cell.terrain
                  }}
                  <br />
                  {{ cell.structure ? `${cell.structure.name}` : '' }}
                  <br />
                  <span v-for="unit in renderUnitsAtLoc(cell)" :key="unit.id">
                    {{ unit }}
                  </span>
                </div>
              </td>
            </tr>
          </table>
        </div>
        <div class="p-2 flex-1">
          <div
            v-if="me && myStats && game"
            class="mb-2"
            :style="
              `background: ${me.color}; color: ${
                isDarkColor(me.color) ? 'white' : 'black'
              }`
            "
          >
            {{ me.name }}
            <span class="float-right">Position: {{ myStats.place }}</span>
            <br />
            <div class="flex">
              <div class="flex-1 p-2">Gold: {{ myStats.gold }}</div>
              <div class="flex-1 p-2">Actions: {{ myStats.actions }}</div>
              <div class="flex-1 p-2">Farms: {{ myStats.farms }}</div>
              <div class="flex-1 p-2">Towns: {{ myStats.towns }}</div>
              <div class="flex-1 p-2">Units: {{ myStats.units }}</div>
            </div>
          </div>
          <div
            v-if="mySelectedCell"
            :style="
              `height: 30vh; ${mySelectedCell.controlledBy &&
                `background: ${
                  game.getPlayer(mySelectedCell.controlledBy).color
                }; color: ${
                  isDarkColor(game.getPlayer(mySelectedCell.controlledBy).color)
                    ? 'white'
                    : 'black'
                }`}`
            "
          >
            <div>
              <div>
                {{
                  mySelectedCell.controlledBy
                    ? ` ${game.getPlayer(mySelectedCell.controlledBy).name} `
                    : ''
                }}
                <br />
                {{
                  game.isInRange(mySelectedCell.x, mySelectedCell.y)
                    ? `## ${mySelectedCell.terrain} ##`
                    : mySelectedCell.terrain
                }}
                <br />
                {{
                  mySelectedCell.structure
                    ? `${mySelectedCell.structure.name}`
                    : ''
                }}
                <br />
                <span
                  v-for="unit in renderUnitsAtLoc(mySelectedCell)"
                  :key="unit.id"
                >
                  {{ unit }}
                </span>
              </div>
            </div>
          </div>
          <template
            v-if="mySelectedCell && mySelectedCell.controlledBy === me.id"
          >
            <div v-if="mySelectedCell.structure">
              <button
                v-for="buildableUnit in mySelectedCell.structure.buildUnits"
                :key="buildableUnit"
                @click="buildUnitHandler(buildableUnit)"
              >
                Build {{ buildableUnit }}
              </button>
              <div v-if="mySelectedCell.structure.name === 'Town'">
                <Button
                  color="yellow"
                  text="black"
                  classes="m-2"
                  @click="buildStructureHandler('castle')"
                  >Build Castle</Button
                >
                <Button
                  color="yellow"
                  text="black"
                  classes="m-2"
                  @click="buildStructureHandler('city')"
                  >Build City</Button
                >
                <Button
                  color="yellow"
                  text="black"
                  classes="m-2"
                  @click="buildStructureHandler('lodge')"
                  >Build Lodge</Button
                >
                <Button
                  color="yellow"
                  text="black"
                  classes="m-2"
                  @click="buildStructureHandler('temple')"
                  >Build Temple</Button
                >
                <Button
                  color="yellow"
                  text="black"
                  classes="m-2"
                  @click="buildStructureHandler('academy')"
                  >Build Academy</Button
                >
              </div>
            </div>
            <div classes="mt-1">
              <div
                v-for="unit in game
                  .Units()
                  .atLoc(mySelectedCell.x, mySelectedCell.y)
                  .get()"
                :key="unit.id"
                @click="unitClickHandler(unit.id)"
              >
                <div
                  type="flat"
                  classes="mt-1 hover:bg-indigo-100"
                  style="user-select: none; cursor: pointer"
                >
                  <div class="flex">
                    <div class="flex-1">
                      {{
                        game.selectedUnitList.includes(unit.id)
                          ? `[${unit.name}]`
                          : unit.name
                      }}
                    </div>
                    <div class="flex-1">Atk: {{ unit.attack }}</div>
                    <div class="flex-1">
                      HP: {{ unit.health }}/{{ unit.maxHealth }}
                    </div>
                    <div class="flex-1">Moves: {{ unit.movesLeft }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div style="position: absolute; bottom: 15px; right: 15px">
      <button color="green" :disabled="!myTurn" @click="endTurnHandler">
        Pass Turn
      </button>
    </div>
  </div>
</template>

<script>
import Game from '../core/Game/Game'
import randomcolor from 'randomcolor'
import isDarkColor from 'is-dark-color'
import elmBridge from 'elm-vue-bridge'

export default {
  data() {
    return {
      game: null,
      grid: [],
      selectedCell: null,
      me: null,
      myStats: null,
      myTurn: false,
      mySelectedCell: null,
      updateGrid: () => null,
      updatePlayers: () => null
    }
  },
  methods: {
    initBoard(ports) {
      ports.selectCellCmd.subscribe(({ x, y }) => this.cellClickHandler(x, y))

      ports.moveUnitsCmd.subscribe(({ x, y }) => this.moveUnitsHandler(x, y))

      this.updateGrid = ports.updateGrid.send
    },
    isDarkColor(color) {
      return isDarkColor(color)
    },
    renderUnitsAtLoc(cell) {
      return this.game
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
          return this.game.selectedUnitList.includes(unit.id)
            ? `[${code}]`
            : code
        })
    },
    async command() {
      if (!this.game.activePlayer().isHuman) {
        await this.game.runComputerTurn()
        this.endTurnHandler()
      } else {
        if (this.me.id !== this.game.activePlayer().id) {
          this.me = this.game.activePlayer()
          this.game.init()
        }
      }
    },
    async endTurnHandler() {
      console.log('ending the turn')
      await this.game.endTurn()
      console.log('turn ended')
      if (!this.game.gameOver) {
        this.newTurn()
        setTimeout(() => {
          this.command()
        }, 500)
      }
    },
    newTurn() {
      if (this.myTurn && this.mySelectedCell) {
        this.game.selectCell(this.mySelectedCell.x, this.mySelectedCell.y)
      }
    },
    cellClickHandler(x, y) {
      this.mySelectedCell = this.game.Cells().atLoc(x, y)
      if (this.myTurn) this.game.selectCell(x, y)
    },
    unitClickHandler(id) {
      if (this.myTurn) {
        if (this.game.selectedUnitList.includes(id)) {
          this.game.unselectUnit(id)
        } else {
          this.game.selectUnit(id)
        }
      }
    },
    moveUnitsHandler(x, y) {
      if (
        this.myTurn &&
        this.game.selectedUnitList.length > 0 &&
        !(this.mySelectedCell.x === x && this.mySelectedCell.y === y)
      ) {
        this.game.moveSelectedUnits(x, y)
        this.cellClickHandler(x, y)
      }
    },
    buildUnitHandler(unit) {
      this.game.buildUnit(unit)
    },
    buildStructureHandler(structure) {
      this.game.upgradeTo(structure)
    }
  },
  created() {
    this.game = new Game(
      [
        { name: 'Lindsay', isHuman: true, color: randomcolor() },
        { name: 'King Bob', isHuman: false, color: randomcolor() },
        { name: 'Telinstrom', isHuman: false, color: randomcolor() },
        { name: 'Ilthanen', isHuman: false, color: randomcolor() },
        { name: 'Isildur', isHuman: false, color: randomcolor() },
        { name: 'Velsyph', isHuman: false, color: randomcolor() },
        { name: 'Argantin', isHuman: false, color: randomcolor() },
        { name: 'Drelkar', isHuman: false, color: randomcolor() },
        { name: 'Dakh', isHuman: false, color: randomcolor() },
        { name: 'Tevin', isHuman: false, color: randomcolor() },
        { name: 'Uinen', isHuman: false, color: randomcolor() },
        { name: 'Vanaan', isHuman: false, color: randomcolor() }
      ],
      { x: 9, y: 9 },
      () => {
        this.updatePlayers(this.game.Players().get())
        this.grid = this.game.Cells().grid
        this.updateGrid(this.game.Cells().grid)
        this.selectedCell = this.game.selectedCell()
        this.myStats = this.me
          ? {
              ...this.game.Players().is(this.me.id).resources,
              units: this.game
                .Units()
                .controlledBy(this.me.id)
                .count(),
              towns: this.game
                .Cells()
                .hasStructure()
                .controlledBy(this.me.id)
                .count(),
              farms: this.game
                .Cells()
                .controlledBy(this.me.id)
                .count(),
              place:
                this.game
                  .scorecard()
                  .findIndex(score => score.id === this.me.id) + 1
            }
          : {}
        this.myTurn = this.me && this.game.activePlayer().id === this.me.id
        if (this.mySelectedCell)
          this.mySelectedCell = this.game
            .Cells()
            .atLoc(this.mySelectedCell.x, this.mySelectedCell.y)
      }
    )

    this.me = this.game
      .Players()
      .get()
      .find(player => player.isHuman)
  },
  watch: {
    grid() {
      // this.updateGrid(this.grid)
    }
  },
  mounted() {
    setTimeout(() => {
      this.game.init()
      this.newTurn()
      this.command()
    }, 100)
  }
}
</script>

<style lang="postcss">
.cell {
  min-width: 100px;
  min-height: 100px;
  user-select: none;
  cursor: pointer;
  font-size: 12px;
}
table {
  width: 100%;

  td {
    border: 1px solid black;
  }
}
</style>
