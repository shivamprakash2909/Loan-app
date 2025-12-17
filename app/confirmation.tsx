import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{ account_number: string; paid_amount: string; payment_date: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={100} color="green" />
      <Text style={styles.title}>Payment Successful!</Text>
      <View style={styles.details}>
        <Text style={styles.text}>Account Number: {params.account_number}</Text>
        <Text style={styles.text}>Paid Amount: ${parseFloat(params.paid_amount || '0').toFixed(2)}</Text>
        <Text style={styles.text}>Payment Date: {new Date(params.payment_date || '').toLocaleString()}</Text>
      </View>
      <Button title="Done" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  details: { alignItems: 'flex-start', marginBottom: 30, padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10, width: '100%' },
  text: { fontSize: 16, marginBottom: 8 },
});