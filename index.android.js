/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity
} from 'react-native';
import FirebaseConfig from './src/firebase/FirebaseConfig';

export default class notification extends Component {
  // Truoc khu Mount
  componentWillUnmount()
  {
      // Remove all listener before
      this.notificationListener.remove();
      this.refreshTokenListener.remove();
  }

  constructor(props) {
    super(props);

    this.state = {
      token: ""
    }
  }

  render() {
    return <View style={Styles.container}>
        <TouchableOpacity onPress={
            () => showLocalNotification("Tiêu đề thông báo local",
              "Body thông bao local",
              "hight")
            
            } style={[Styles.button,Styles.blue]}>
          <Text style={Styles.text}>Tạo Loal Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => sendNotification(this.state.token)} style={[Styles.button,Styles.red]}>
          <Text style={Styles.text}>Send Notification</Text>
        </TouchableOpacity>        
    </View>
  }

  componentDidMount(){
      // Lay client token
        FCM.getFCMToken().then(token => {
            this.setState({token : token});
        });
        // Đăng ký topic với firebase
        FCM.subscribeToTopic('/topics/foo-bar');
        // Vo cung quan trong
        // Dang ky lang nghe su kien tu firebase
        this.notificationListner = FCM.on(FCMEvent.Notification,notification => {
          // Kiem tra xem co phai notification tu remote
          if(typeof(notification.fcm) != 'undefined') {
            // Che do chay ngam
            notification.fcm.show_in_foreground = true;
            FCM.presentLocalNotification(notification.fcm);
          }
          if(notification.local_notification){
            //Mọi sự kiện hành động khi local notification được chạy
            // viết tại đây
            console.log("Đây là notification từ local");
          }
          if(notification.opened_from_tray){
            // Mọi sự kiện khi chạm vào notification để xử lý tại đây
            console.log("Touched Notification");
            } 
        })

          // Do token có thời hạn nên phải lắng sự kiện RefreshToken
          this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, token => {
            console.log("TOKEN (refreshUnsubscribe)", token);
            this.setState({token : token});            
          });    
  }

}

// Demo show Local Notification
var showLocalNotification = function(title,body,priority)
{
    // presentLocalNotification để tạo notification với các params
    FCM.presentLocalNotification({
      title: title,
      body: body,
      priority:priority,
      vibrate: 300,
      show_in_foreground: true,
      icon: "ico",
      // Sư kiện được đăng ký trong Manifest
      action: "fcm.ACTION.HELLO",
       
       big_text: "Show when notification is expanded",
       ticker: "My Notification Ticker",
    });
}

// Ham khoi tao thong so va gui thong bao toi firebase server
// Chi tiet cac tham so : https://firebase.google.com/docs/cloud-messaging/http-server-ref
var sendNotification = function(token)
{
  let body = {
     // param quan trong de xac dinh gui toi dau
    "to" : token,
    // param xac dinh cac thong so cua notification se hien thi
    "notification" : {
    		"title": "Hello bà con",
    		"body": "Tin nhắn được gửi lên server và nhận lại",
    		"sound": "default",
    		"click_action": "fcm.ACTION.HELLO",
    		"remote": true
    }
  }
  send(JSON.stringify(body),"notification");
}

var  send = function(body, type) {
  // Bo sung header de request toi firebase
  let headers = new Headers({
    "Content-Type": "application/json",
    "Content-Length": parseInt(body.length),
    "Authorization": "key="+FirebaseConfig.KEY
  });
  fetch(FirebaseConfig.END_POINT, { method: "POST", headers, body })
    .then(response => console.log("Send " + type + " response", response))
    .catch(error => console.log("Error sending " + type, error));
}
const Styles = StyleSheet.create({
    container : {
        flex : 2,
        justifyContent : "center",
    },
    button : {
        alignItems : "center",
        marginBottom : 20,
        marginLeft : 50,
        marginRight : 50,
        padding : 20
    },
    red: {
      backgroundColor : "red",
    }, 
    blue : {
      backgroundColor : "blue",
    },
    text: {
      fontSize : 15,
      color : "white",
    }
});


AppRegistry.registerComponent('notification', () => notification);
