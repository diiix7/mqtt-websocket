import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import init from "react_native_mqtt";
import AsyncStorage from "@react-native-async-storage/async-storage";

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

const App = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [status, setStatus] = useState("Not connected");
  let client;

  const connectToBroker = () => {
    const brokerUrl = `ws://${ipAddress}:8083/mqtt`;
    client = new Paho.MQTT.Client(
      brokerUrl,
      `clientId-${Math.floor(Math.random() * 10000)}`
    );

    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        setStatus(`Connection lost: ${responseObject.errorMessage}`);
      }
    };

    client.onMessageArrived = (message) => {
      console.log(
        `Received message: ${message.payloadString} from topic: ${message.destinationName}`
      );
    };

    client.connect({
      onSuccess: () => {
        setStatus("Connected");
        client.subscribe("test/topic", (err) => {
          if (!err) {
            console.log("Subscribed to topic");
          }
        });
      },
      onFailure: (err) => {
        setStatus(`Connection failed: ${err.errorMessage}`);
      },
      useSSL: false,
      userName: "mqtttcp",
      password: "mqtttcp",
    });
  };

  const sendMessage = (topic, message) => {
    if (client && client.isConnected()) {
      const mqttMessage = new Paho.MQTT.Message(message);
      mqttMessage.destinationName = topic;
      client.send(mqttMessage);
    } else {
      console.log("Client is not connected");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MQTT Client</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter broker IP address"
        onChangeText={setIpAddress}
        value={ipAddress}
      />
      <Button title="Connect" onPress={connectToBroker} />
      <Text>Status: {status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default App;
