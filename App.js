import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { Client, Message } from "react-native-paho-mqtt";

// Set up an in-memory alternative to global localStorage
const myStorage = {
  setItem: (key, item) => {
    myStorage[key] = item;
  },
  getItem: (key) => myStorage[key],
  removeItem: (key) => {
    delete myStorage[key];
  },
};

// Create a client instance
const client = new Client({
  uri: "ws://192.168.86.91:8083/mqtt",
  clientId: `clientId-${Math.floor(Math.random() * 10000)}`,
  storage: myStorage,
});

export default function App() {
  const [mqttClient, setMqttClient] = useState(client);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Set event handlers
    mqttClient.on("connectionLost", (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log(responseObject.errorMessage);
      }
      setIsConnected(false);
    });

    mqttClient.on("messageReceived", (message) => {
      console.log(message.payloadString);
      setMessage(message.payloadString);
    });

    mqttClient
      .connect()
      .then(() => {
        console.log("Connected");
        setIsConnected(true);
        return mqttClient.subscribe("test/topic");
      })
      .catch((err) => {
        console.log("Connection failed", err);
      });

    setMqttClient(mqttClient);
  }, []);

  const handleSendMessage = () => {
    const ms = {
      message: "Hello MQTT",
    };
    const mqttMessage = new Message(JSON.stringify(ms));
    mqttMessage.destinationName = "test/topic";
    mqttClient.send(mqttMessage);
  };

  return (
    <View style={styles.container}>
      <Text>Mqtt connection via websocket</Text>
      <Pressable
        onPress={handleSendMessage}
        style={{ padding: 10, backgroundColor: "skyblue", marginTop: 10 }}
      >
        <Text>Send Message</Text>
      </Pressable>
      {isConnected && <Text>Connected to MQTT broker</Text>}
      {message && <Text>Received message: {message}</Text>}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
