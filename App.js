import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

const photosSlice = createSlice({
  name: 'photos',
  initialState: {
    photos: []
  },
  reducers: {
    addPhoto (state, action) {
      state.photos.push(action.payload.uri)
    }
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes    
  }
})

export const { addPhoto } = photosSlice.actions;
const store = configureStore({
  reducer: photosSlice.reducer
})

// Can still subscribe to the store
// store.subscribe(() => console.log(store.getState()))

const selectPhotos = state => state.photos;


export default function App() {
  
    const [startCamera,setStartCamera] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    // const dispatch = useDispatch();
    const photos = store.getState().photos;


    // const [photos, setPhotos] = useState([]);
    
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
        console.log(store.getState());
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
    
    <View style={styles.layout}>
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
      (<View>
          <TouchableOpacity
            onPress={__startCamera}
            style={styles.button} >
            <Text
              style={styles.buttonText}
            >
              Add photo
            </Text>
          </TouchableOpacity>
          <View >
            {photos.map((photo, index) => 
            <Image key={index} style={{width: 150, height: 150}} source={{uri: photo}} />)
                }
            </View>
        </View>)}
    </View>
  );}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
    }
});
