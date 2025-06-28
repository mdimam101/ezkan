import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import SummaryApi from '../common/SummaryApi';
import Toast from 'react-native-toast-message';

const SignupPage = () => {
  const navigation = useNavigation();

  const [data, setData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleOnChange = (key, value) => {
    setData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (data.password !== data.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password mismatch',
        text2: 'Please check your passwords',
      });
      return;
    }

    try {
      const response = await axios({
        method: SummaryApi.signUp.method,
        url: SummaryApi.signUp.url,
        headers: { 'Content-Type': 'application/json' },
        data: data,
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Account created successfully',
        });
        navigation.navigate('Login');
      } else {
        Toast.show({
          type: 'error',
          text1: response.data.message || 'Signup failed',
        });
      }
    } catch (error) {
      console.log('Signup Error:', error?.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || 'Something went wrong',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollWrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor="#888"
            value={data.name}
            onChangeText={(text) => handleOnChange('name', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={data.email}
            onChangeText={(text) => handleOnChange('email', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={data.password}
            onChangeText={(text) => handleOnChange('password', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#888"
            secureTextEntry
            value={data.confirmPassword}
            onChangeText={(text) => handleOnChange('confirmPassword', text)}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.Text}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.linkText}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default SignupPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollWrapper: {
    flexGrow: 1,
    justifyContent: 'center', // vertical center
    alignItems: 'center',     // horizontal center
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 4,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footerText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
  linkText: {
    color: '#1e90ff',
    fontWeight: '600',
  },
});
