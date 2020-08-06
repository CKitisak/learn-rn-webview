import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, Text, View} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {WebView} from 'react-native-webview';

const App = () => {
  const [camera, setCamera] = useState(null);
  const [web, setWeb] = useState(null);
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [qrData, setQrData] = useState(null);

  const _onMessage = (event) => {
    console.log(event);
    setMessage(event.nativeEvent.data);
  };

  const _onBarCodeRead = (event) => {
    if (!qrData) {
      setModalVisible(false);
      setQrData(true);
      const qr = JSON.parse(event.data);
      web.injectJavaScript(`
        document.getElementById('jsonView').innerHTML = '${event.data}';
        document.getElementById('value1').value = '${qr.ssid}';
        document.getElementById('value2').value = '${qr.password}';
        document.body.style.backgroundColor = 'red';
        true;
      `);
    }
  };

  const runFirst = `
    document.body.style.backgroundColor = 'blue';
    true; // note: this is required, or you'll sometimes get silent failures
  `;

  const html = `
    <html>
    <head></head>
    <body>
      <!-- onSubmit="return postMessage()" -->
      <form id="myForm" action="javascript:postMessage()">
        <input type="text" id="value1" name="value1" value="" />
        <input type="text" id="value2" name="value2" value="" />
        <input type="submit" value="Send" />
      </form>
      <div id="jsonView"></div>
      <script>
        function postMessage() {
          var elements = document.getElementById('myForm').elements;
          var obj ={};
          for (var i = 0; i < elements.length; i++) {
            var item = elements.item(i);
            if (item.type !== 'submit') {
              obj[item.name] = item.value;
            }
          }
          window.ReactNativeWebView.postMessage(JSON.stringify(obj));
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Text>Message: {message}</Text>
        <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
          <Text>Camera</Text>
        </TouchableOpacity>
      </View>

      <WebView
        ref={setWeb}
        source={{html}}
        injectedJavaScript={runFirst}
        onMessage={_onMessage}
      />

      {modalVisible && (
        <View style={styles.overlayPanel}>
          <RNCamera
            barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
            captureAudio={false}
            onBarCodeRead={_onBarCodeRead}
            ref={setCamera}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  topbar: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlayPanel: {
    position: 'absolute',
    right: 0,
    top: 30,
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: '#fff',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default App;
