import { State } from '../types/state.interface'
import { Action } from '../types/action.interface'

export default (state: State, action: Action) => {
  switch (action.type) {
    case 'setText':
      return {
        ...state,
        text: action.payload
      };
    case 'setInputFocused':
      return {
        ...state,
        inputFocused: action.payload
      };
    case 'setTakingPhoto':
      return {
        ...state,
        takingPhoto: action.payload
      };
    case 'setDialogOpen':
      return {
        ...state,
        dialogOpen: action.payload
      };
    case 'setRecordSecs':
      return {
        ...state,
        recordSecs: action.payload
      };
    case 'setTextInputHeight':
      return {
        ...state,
        textInputHeight: action.payload
      };
    case 'setRecordingStartTime':
      return {
        ...state,
        recordingStartTime: action.payload
      };
    case 'setUploading':
      return {
        ...state,
        uploading: action.payload
      };
    default:
      throw new Error();
  }
}