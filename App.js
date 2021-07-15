import React, { useState } from 'react';
import { StyleSheet, Button, View, SafeAreaView, FlatList, Text, TouchableOpacity, ImageBackground, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import { Camera } from 'expo-camera';
import { createSlice, configureStore } from '@reduxjs/toolkit';

const photosSlice = createSlice({
  name: 'photos',
  initialState: {
    photos: []
  },
  reducers: {
    addPhoto (state, action) {
      const photoNumber = state.photos.length + 1;
      const newPhoto = {
        uri: action.payload.uri,
        label: `Photo number ${photoNumber}`
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

const Item = ({ photo, index }) => (
  <View >
    <Image style={{width: 150, height: 150}} source={{uri: photo.uri}} />
    <TextInput 
          placeholder={photo.label}
          placeholderTextColor='black'
          clearButtonMode='always'
          returnKeyType='done'
          maxLength={40} 
          onChangeText={text => {
            store.dispatch(editPhotoLabel({index: index, label: text}))
          }
        }
        />
  </View>
);

// Can still subscribe to the store
// store.subscribe(() => console.log(store.getState()));

export default function App() {
  
    const [startCamera,setStartCamera] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
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
          // setPhotos([...photos, capturedImage])
          // console.log(capturedImage);
          store.dispatch(addPhoto({uri: capturedImage.uri}))
          setStartCamera(false);
          setCapturedImage(null);
          setPreviewVisible(false);
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
                      width: 70,
                      height: 70,
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
          behavior={Platform.OS == "ios" ? "position" : "height"}
          
          style={styles.listView}
        >
          <FlatList 
            data={photos}
            renderItem={({ item, index }) => (
              <ListItem 
                bottomDivider 
                roundAvatar
              >
                <Avatar rounded source={{uri: item.uri}} />
                <ListItem.Content>
                  <ListItem.Input
                    placeholder={item.label}
                    placeholderTextColor='black'
                    style={{textAlign: 'left'}}
                    clearButtonMode='while-editing'
                    returnKeyType='done'
                    maxLength={40} 
                    onChangeText={text => {
                      store.dispatch(editPhotoLabel({index: index, label: text}))
                    }
                  }
                  />
                </ListItem.Content>
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
            // padding: 20,
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  card: {
      width: '90%',
      padding: 10,
      borderRadius: 10,
  },
  cardTitle: {
      fontSize: 18,
  },
  cardDetails: {

  },
  button: {
      padding: 20,
      margin: 15,
      backgroundColor: 'blue',
      borderRadius: 5,
      width: 150,
    },
  saveButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    padding: 20,
    width: 150,
    bottom: 0,
  },
  buttonText: {
      color: 'white',
      fontSize: 18,
      textAlign: 'center'
    }
});
