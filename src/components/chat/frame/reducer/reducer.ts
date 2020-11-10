import { State } from '../types/state.interface'
import { Action } from '../types/action.interface'

export default (state: State, action: Action) => {
  switch (action.type) {
    case 'setBridge':
      return {
        ...state,
        bridge: action.payload
      };
    case 'setPassword':
      return {
        ...state,
        password: action.payload
      };
    case 'setSavedPubkey':
      return {
        ...state,
        savedPubkey: action.payload
      };
    case 'setSavedBudget':
      return {
        ...state,
        savedBudget: action.payload
      };
    default:
      throw new Error();
  }
}