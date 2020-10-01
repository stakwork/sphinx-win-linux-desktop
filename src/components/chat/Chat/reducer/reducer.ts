import { State } from '../types/state.interface'
import { Action } from '../types/action.interface'

export default (state: State, action: Action) => {
  switch (action.type) {
    case 'setShow':
      return {
        ...state,
        show: action.payload
      };
    case 'setPricePerMessage':
      return {
        ...state,
        pricePerMessage: action.payload
      };
    case 'setShowPricePerMessage':
      return {
        ...state,
        showPricePerMessage: action.payload
      };
    case 'setReplyUUID':
      return {
        ...state,
        replyUuid: action.payload
      };
    case 'setLoadingChat':
      return {
        ...state,
        loadingChat: action.payload
      };
    case 'setAppMode':
      return {
        ...state,
        appMode: action.payload
      };
    case 'setTribeBots':
      return {
        ...state,
        tribeBots: action.payload
      };
    default:
      throw new Error();
  }
}