import React from 'react';
import { Image, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { IconButton, TextInput, Text } from 'react-native-paper';

import styles from './styles';

/**
 * Component that shows a modal with specific gifs
 * @param {boolean} open - param that handle if the modal is open or not
 * @param {Function} onClose - Function that close the modal
 * @param {Array<Object>} gifs - array with all the gifs
 * @param {String} searchGif - param that have the value of wich of gifs search
 * @param {Function} setSearchGif - callback function that return the text value to search
 * @param {Function} onSendGifHandler - callback function that return the selected gif
 * @param {Function} onSubmitEditing - function that search the type of gifs
 */
export default function Giphy({
  gifs,
  open,
  onClose,
  searchGif,
  onSendGifHandler,
  setSearchGif,
  getGifsBySearch,
}) {
  return (
    <View style={styles.centeredView}>
      <Modal
        visible={open}
        onDismiss={() => onClose(false)}
        onRequestClose={() => onClose(false)}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.select}>Select gif</Text>
            <IconButton
              icon="close"
              color={'black'}
              size={20}
              onPress={() => onClose(false)}
            />
          </View>
          <TextInput
            style={styles.input}
            label='Search'
            value={searchGif}
            onChangeText={(value) => setSearchGif(value)}
            onSubmitEditing={getGifsBySearch}
          />
          <ScrollView>
            <View style={styles.gifContainer}>
              {gifs.map((gif) => {
                const thumb = gif.images.original.url.replace(/giphy.gif/g, '100w.gif')
                return (<TouchableOpacity
                  key={gif.id}
                  onPress={() => onSendGifHandler(gif)}
                >
                  <Image
                    source={{ uri: thumb }}
                    style={styles.gif}
                  />
                </TouchableOpacity>)
              })}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
};
