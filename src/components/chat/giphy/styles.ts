import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  gifContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gif: {
    width: 100,
    height: 100,
    margin: 5
  },
  input: {
    width: '95%',
    height: 50,
    marginBottom: 20,
    borderRadius: 3,
    alignSelf: 'center',
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth:1,
  },
  header: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 8,
    textAlign: 'center',
    alignContent: 'center',
  },
  select: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});