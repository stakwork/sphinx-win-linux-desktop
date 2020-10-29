import { State } from '../types/state.interface'
import { Action } from '../types/action.interface'

export default (state: State, action: Action) => {
  switch (action.type) {
    case 'setDialogOpen':
      return {
        ...state,
        dialogOpen: action.payload
      };
    case 'setLoading':
      return {
        ...state,
        loading: action.payload
      };
    case 'setNotEnuff':
      return {
        ...state,
        notEnuff: action.payload
      };
    case 'setConfirmed':
      return {
        ...state,
        confirmed: action.payload
      };
    default:
      throw new Error();
  }
}