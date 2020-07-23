/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
// for  more clearance  go to  https://rnfirebase.io
import React from 'react'
import {Alert,View,Image,Button,Text} from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import VoiceRecorder from './Compnents/VoiceRecorder'
import { NavigationContainer,useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ChatScreen from './Compnents/ChatScreen'

import messaging from '@react-native-firebase/messaging';

messaging()
  .subscribeToTopic('Developers')
  .then(() => console.log('Subscribed to topic!'));

  const createFormData = (file) => {
  const data = new FormData();

  data.append("file", {
    name: file.name,
    type: file.type,
    uri:
      Platform.OS === "android" ? file.uri : file.uri.replace("file://", "")
  });
  console.log(data)
  return data;
};

 class HomeScreen extends React.Component {
 
  constructor(props){
    super(props)
  this.state = {
    file: null,
  }
}
async componentDidMount(){
  await messaging().onMessage(async remoteMessage => {
    Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage))
  });
}

  handleFiles = () => {
    DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    }).then(res=>{this.setState({
      file:res
    })})
  }
  handleUploadFile = () => {
    fetch("http://192.168.43.35:3000/api/upload", {
      method: "POST",
      headers : { "content-type": "multipart/form-data"},
      body: createFormData(this.state.file)
    })
      .then(response => response.json())
      .then(response => {
        console.log("upload succes", response);
        alert("Upload success!");
        this.setState({ file: null });
      })
      .catch(error => {
        console.log("upload error", error);
        alert("Upload failed!");
      });
  };
  clear(){
    this.setState({file:null})
  }
  render() {
    const { file } = this.state
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {file && (
        <React.Fragment>
         <Text style={{fontSize:20,padding:40}}>{file.name}</Text>
          <Button title="Upload" onPress={()=>this.handleUploadFile()} />
        </React.Fragment>
      )}
      
      <Button title="Choose File" onPress={()=>this.handleFiles()} />
      <VoiceRecorder clear={()=>this.clear()} style={{marginTop:20}} />
      <Button
        title="Go to ChatSytem"
        onPress={() => this.props.navigation.navigate('Chat')}
      />
    </View>
    )
  }
}

const Stack = createStackNavigator();
export default class App extends React.Component{
  constructor(props){
    super(props)
    this.state={
      loading:true,
      initialRoute:'Home'
    }
  }
// for  more clearance  go to  https://rnfirebase.io
  //to run in background you need to see in index.js  
  // firebase token initalization to the current user and notification evenet handler most of them
  componentDidMount(){
    // token assigning to  the user through post api to the server
    messaging()
      .getToken()
      .then(token => {
        fetch('http://192.168.43.35:3000/addToken',{method:"POST",  headers: {
          'Content-Type': 'application/json',
         },body:JSON.stringify({user:'Shailen',token:token})}).then(res=>console.log("successfully added"))
      });
      // if by any chanace the token is refershed we need to call this onTokenRefresh
      messaging().onTokenRefresh(token => {
        fetch('http://192.168.43.35:3000/addToken',{method:"POST",  headers: {
          'Content-Type': 'application/json',
         },body:JSON.stringify({user:'Shailen',token:token})}).then(res=>console.log("successfully added"))
      });

      // if the notification is pressed it will run this when openinng the app
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      this.props.navigation.navigate(remoteMessage.data.type);
    });
    //  initalizaion when app is opened through quit or background state after clicking on notification
    messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
        this.setState({initialRoute:remoteMessage.data.type}); // e.g. "Settings"
      }
      this.setState({loading:false})
    });

  }
  render(){
  if(this.state.loading) {
      return null;
    }
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName={this.state.initialRoute}>
      <Stack.Screen name="Home" component={HomeScreen}  options={{ title: 'Voice and Uploading' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
    </Stack.Navigator>
  </NavigationContainer>
  );
}
}

