// LoginScreen.js
import React, { useState } from 'react'
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native'

const LoginScreen = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (username && password) {
      Alert.alert('Login Successful', `Welcome, ${username}!`)
      // You can handle login logic (e.g., API call) here
    } else {
      Alert.alert('Error', 'Please fill in both fields')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Login" onPress={handleLogin} />

      <Text style={styles.forgotPassword}>Forgot your password?</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5,
  },
  forgotPassword: {
    textAlign: 'center',
    marginTop: 10,
    color: 'gray',
    fontSize: 14,
  },
})

export default LoginScreen
