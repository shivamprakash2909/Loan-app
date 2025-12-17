import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '@/client';

export default function PaymentScreen() {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!accountNumber.trim() || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid account number and a positive amount.');
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post('/payments', {
        account_number: accountNumber,
        payment_amount: parseFloat(amount),
      });
      
      // Navigate to confirmation screen with payment details
      router.push({
        pathname: '/confirmation',
        params: response.data.payment,
      });

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setAccountNumber('');
      setAmount('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account Number</Text>
      <TextInput
        style={styles.input}
        value={accountNumber}
        onChangeText={setAccountNumber}
        placeholder="e.g., ACC001"
        autoCapitalize="characters"
      />
      <Text style={styles.label}>EMI Amount to Pay</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="e.g., 5000.00"
        keyboardType="numeric"
      />
      {loading ? <ActivityIndicator size="large" color="#0000ff" /> : <Button title="Submit Payment" onPress={handleSubmit} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    fontSize: 16,
  },
});