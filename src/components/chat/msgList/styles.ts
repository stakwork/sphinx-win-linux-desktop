import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  scroller: {
    flex: 1,
    overflow: 'scroll',
    flexDirection: 'column',
  },
  msgList: {
    flex: 1,
  },
  line: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    width: '90%',
    position: 'absolute',
    left: '5%',
    top: 10
  },
  dateLine: {
    width: '100%',
    display: 'flex',
    height: 20,
    marginBottom: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  dateString: {
    fontSize: 12,
    backgroundColor: 'white',
    paddingLeft: 16,
    paddingRight: 16
  }
})