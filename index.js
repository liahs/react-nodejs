/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

// for  more clearance  go to  https://rnfirebase.io
// background message handler no need any third api for notificaion '@react-native-firebase/messaging' handle the background notification
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
  
AppRegistry.registerComponent(appName, () => App);
