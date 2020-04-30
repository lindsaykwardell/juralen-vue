import Unit from './Unit'
import Soldier from './Soldier'
import Archer from './Archer'
import Rogue from './Rogue'
import Knight from './Knight'
import Priest from './Priest'
import Wizard from './Wizard'
import Warrior from './Warrior'

export { default as Soldier } from './Soldier'
export { default as Rogue } from './Rogue'
export { default as Knight } from './Knight'
export { default as Archer } from './Archer'
export { default as Wizard } from './Wizard'
export { default as Priest } from './Priest'
export { default as Warrior } from './Warrior'

export const findUnit = (name: string): typeof Unit => {
  switch (name.toLowerCase()) {
    case 'soldier':
      return Soldier
    case 'archer':
      return Archer
    case 'rogue':
      return Rogue
    case 'knight':
      return Knight
    case 'priest':
      return Priest
    case 'wizard':
      return Wizard
    case 'warrior':
      return Warrior
    default:
      return Unit
  }
}
