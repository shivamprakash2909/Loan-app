import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import apiClient from '@/client';

interface Customer {
  id: number;
  account_number: string;
  issue_date: string;
  interest_rate: string;
  tenure: number;
  emi_due: string;
}

export default function LoanDetailsScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      setError('Failed to fetch loan details. Ensure the backend is running and the IP address is correct.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading && !customers.length) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <FlatList
      data={customers}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCustomers} />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>Account: {item.account_number}</Text>
          <Text>EMI Due: ${parseFloat(item.emi_due).toFixed(2)}</Text>
          <Text>Issue Date: {new Date(item.issue_date).toLocaleDateString()}</Text>
          <Text>Interest Rate: {item.interest_rate}%</Text>
          <Text>Tenure: {item.tenure} months</Text>
        </View>
      )}
      ListEmptyComponent={<Text>No loan accounts found.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16 },
  card: { backgroundColor: 'white', padding: 16, marginBottom: 16, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20, paddingHorizontal: 16 },
});