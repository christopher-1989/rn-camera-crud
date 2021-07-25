import React, { useState } from 'react';
import { 
  StyleSheet, 
  Modal, 
  View, 
  SafeAreaView, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  TouchableHighlight, 
  ImageBackground, 
  Image, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform 
    } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import { Camera } from 'expo-camera';
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { Ionicons } from '@expo/vector-icons';


const photosSlice = createSlice({
  name: 'photos',
  initialState: {
    photos: []
  },
  reducers: {
    addPhoto (state, action) {
      const newPhoto = {
        uri: action.payload.uri,
        label: `New photo`
      }
      state.photos.push(newPhoto)
    },
    editPhotoLabel (state, action) {
      const newPhoto = state.photos[action.payload.index];
      newPhoto.label = action.payload.label;
      state.photos[action.payload.index] = newPhoto;
    },
  }
})

export const { addPhoto, editPhotoLabel } = photosSlice.actions;
const store = configureStore({
  reducer: photosSlice.reducer
})

// Can still subscribe to the store
// store.subscribe(() => console.log(store.getState()));

export default function App() {
  
    const [startCamera, setStartCamera] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalIndex, setModalIndex] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState({});
    const photos = store.getState().photos;
    
    const __startCamera = async () => {
        const {status} = await Camera.requestPermissionsAsync()
        if (status === 'granted') {
          // start the camera
          setStartCamera(true);
        } else {
          Alert.alert('Access denied');
        }
      }

    let camera = Camera;
  
    const __takePicture = async () => {
      if (!camera) return
      const photo = await camera.takePictureAsync();
      setPreviewVisible(true);
      setCapturedImage(photo);
    }

    const __retakePicture = () => {
      setCapturedImage(null);
      setPreviewVisible(false);
      __startCamera();
    }

    const __savePicture = () => {
        store.dispatch(addPhoto({uri: capturedImage.uri}))
        setStartCamera(false);
        setCapturedImage(null);
        setPreviewVisible(false);
        setModalIndex(photos.length)
        setSelectedPhoto(capturedImage);
        setModalVisible(true);
    }
  
    const CameraPreview = ({ photo }) => {
      return (
        <View
          style={{
            backgroundColor: 'transparent',
            flex: 1,
            width: '100%',
            height: '100%'
          }}
        >
          <ImageBackground
            source={{uri: photo.uri}}
            style={{
              flex: 1
            }}
          />
        </View>
      )
    }

    return (

    <SafeAreaView style={styles.layout} >
      <Text style={styles.title}>Photos</Text>
      {/* check to see if the camera has started. If so, has an image been taken and is there a preview visable? */}
      {/* If so, prompt to either retake or save the photo */}
      {startCamera ? (
        previewVisible && capturedImage ? (
        <View
              style={{
                flex: 1,
                width: '100%',
                backgroundColor: 'transparent',
                flexDirection: 'row'
              }}
            >
            <CameraPreview photo={capturedImage} />

            <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  flexDirection: 'row',
                  flex: 1,
                  width: '100%',
                  padding: 20,
                  justifyContent: 'space-between'
                }}
              >
                <View
                  style={{
                    alignSelf: 'center',
                    flex: 1,
                    justifyContent: 'center',
                    flexDirection: 'row',
                  }}
                >
          
                <TouchableOpacity
                    onPress={__retakePicture}
                    style={styles.button}
                    >
                    <Text
                    style={styles.buttonText}
                    >
                    Retake
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={__savePicture}
                    style={styles.button}
                    >
                    <Text
                    style={styles.buttonText}
                    >
                    Save
                    </Text>
                </TouchableOpacity>
              </View>
            </View>
        </View>
        ) : 
        // If no picture has been taken yet, show the camera in the view available and display a button to take the picture.
      (<Camera
            style={{flex: 1, width: "100%"}}
            ref={(r) => {
              camera = r
            }}
          >
          <View
            style={{
              flex: 1,
              width: '100%',
              backgroundColor: 'transparent',
              flexDirection: 'row'
            }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  flexDirection: 'row',
                  flex: 1,
                  width: '100%',
                  padding: 20,
                }}
              >
              <View 
                style={{
                  flex: 1,
                }}
              >
              <TouchableOpacity
                onPress={() => setStartCamera(false)}
                style={{padding: 20}} 
                >
                  <Text style={{textAlign: 'right'}} >
                    <Ionicons name="close" size={40} color="white" />
                  </Text>
              </TouchableOpacity>
            </View>
          </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  flexDirection: 'row',
                  flex: 1,
                  width: '100%',
                  padding: 20,
                  justifyContent: 'space-between'
                }}
              >
                <View
                  style={{
                    alignSelf: 'center',
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <TouchableOpacity
                    onPress={__takePicture}
                    style={{
                      width: 80,
                      height: 80,
                      bottom: 0,
                      borderRadius: 50,
                      backgroundColor: '#fffe'
                    }}
                  />
                </View>
              </View>
            </View>
          </Camera>
        ))
      : 
      // If the camera has not been started display a button to take a picture.
      // If photos are available, display them in the View.
      (<View
        style={{
          flex: 1,
          width: '100%',
          backgroundColor: 'transparent',
          flexDirection: 'row'
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS == "ios" ? "padding" : "height"}
          style={styles.listView}
        >
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
            }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                <TextInput
                    placeholder={selectedPhoto.label ? `${selectedPhoto.label}` : `Edit photo label`}
                    placeholderTextColor='black'
                    style={{width: '100%', textAlign: 'center', fontSize: 24, marginBottom: 20}}
                    clearButtonMode='while-editing'
                    returnKeyType='done'
                    maxLength={40} 
                    onChangeText={text => {
                      store.dispatch(editPhotoLabel({index: modalIndex, label: text}))
                    }
                  }
                  />
                  <Image style={{width: 300, height: 450}} source={{uri: selectedPhoto.uri}} />
                  <TouchableHighlight
                    style={{ ...styles.button, backgroundColor: '#2196F3' }}
                    onPress={() => {
                      setModalVisible(!modalVisible);
                    }}>
                    <Text style={styles.buttonText}>Done</Text>
                  </TouchableHighlight>
                </View>
              </View>
          </Modal>
          <FlatList 
            data={photos}
            renderItem={({ item, index }) => (
              <ListItem 
                bottomDivider 
                roundAvatar
                onPress={() => {
                  setModalIndex(index)
                  setSelectedPhoto(item)
                  setModalVisible(!modalVisible)}
                }
              >
                <Avatar rounded source={{uri: item.uri}} />
                <ListItem.Content>
                  <ListItem.Title>{`${index + 1}.  ${item.label}`}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron/>
              </ListItem> 
            )}
              keyExtractor={(item, index) => index.toString()}
              />
        </KeyboardAvoidingView>
        <View 
          style={{
            position: 'absolute',
            bottom: 0,
            flexDirection: 'row',
            flex: 1,
            width: '100%',
            justifyContent: 'space-between'
            }}
        >
          <View
            style={{
              alignSelf: 'center',
              flex: 1,
              alignItems: 'center'
            }}
          >
            <TouchableOpacity
            onPress={__startCamera}
            style={styles.saveButton} 
            >
              <Text
                style={styles.buttonText}
              >
                Add photo
              </Text>
            </TouchableOpacity>
          </View>
        </View> 
    </View>
          
        )}
    </SafeAreaView>
  );}

const styles = StyleSheet.create({
  listView: {
    flex: 1,
    maxHeight: '90%'
  },
  layout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
  },
  button: {
      padding: 20,
      margin: 15,
      backgroundColor: '#2196F3',
      borderRadius: 5,
      width: 150,
    },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 20,
    width: 150,
    bottom: 0,
  },
  buttonText: {
      color: 'white',
      fontSize: 18,
      textAlign: 'center'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: '100%',
    maxHeight: '90%',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
