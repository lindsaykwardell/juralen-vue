import uuid from 'uuid/v4'
import Scenario from '../Scenario/Scenario'
import StandardAI from './AI/Standard'

export default class Player {
  public id: string
  public name: string
  public resources: IResources
  public hasLost: boolean
  public isHuman: boolean
  public ai: (scenario: Scenario) => any[]
  public color: string

  constructor(
    name: string,
    isHuman: boolean,
    resources: IResources,
    color: string,
    ai?: (scenario: Scenario) => any[]
  ) {
    this.id = uuid()
    this.name = name
    this.resources = resources
    this.hasLost = false
    this.isHuman = isHuman
    this.ai = ai ? ai : StandardAI
    this.color = color
  }
}

interface IResources {
  actions: number
  gold: number
}

export enum PlayerType {
  Human,
  AI
}
