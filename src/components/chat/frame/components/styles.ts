import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  webview: {
    flex: 1,
    position: 'relative',
    zIndex: 99,
  },
  loader: {
    position: 'absolute',
    top: 48,
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  bridgeModal: {
    position: 'absolute',
    top: 20,
    width: '92%',
    left: '4%',
    height: 'auto',
    backgroundColor: 'white',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
    elevation: 5,
    borderRadius: 12,
  },
  modalText: {
    color: '#888',
    marginTop: 12,
    marginBottom: 12
  },
  modalURL: {
    marginTop: 12,
    marginBottom: 12,
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    height: 36,
    borderRadius: 18,
    marginTop: 12,
    fontSize: 13,
    paddingLeft: 12,
    marginBottom: 20
  },
  inputWrap: {
    width: '100%',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  inputInnerWrap: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#aaa',
    width: '60%',
    borderRadius: 24,
    paddingLeft: 10,
  },
  modalSats: {
    position: 'absolute',
    right: 19,
    top: 15,
    color: '#888'
  },
  modalButtonWrap: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 15
  },
  button: {
    borderRadius: 20,
    width: 90, height: 38,
    marginLeft: 15, marginRight: 15
  }
})
