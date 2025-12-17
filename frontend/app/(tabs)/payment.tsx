import apiClient from "@/client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Customer {
  id: number;
  customer_name?: string;
  account_number: string;
  issue_date: string;
  interest_rate: string;
  tenure: number;
  emi_due: string;
}

interface Payment {
  id: number;
  customer_id: number;
  payment_date: string;
  payment_amount: string;
  status: string;
}

export default function PaymentScreen() {
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchPaymentHistory = async (accNumber: string) => {
    if (!accNumber.trim()) return;

    setLoadingHistory(true);
    try {
      const response = await apiClient.get(`/payments/${accNumber.trim()}`);
      setPaymentHistory(response.data || []);
    } catch (error: any) {
      console.error("Fetch payment history error:", error.message);
      setPaymentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchCustomerDetails = async () => {
    if (!accountNumber.trim()) {
      Alert.alert("Invalid Input", "Please enter an account number.");
      return;
    }

    Keyboard.dismiss();
    setLoadingCustomer(true);
    setCustomer(null);
    setPaymentHistory([]);
    try {
      const response = await apiClient.get(`/customers/${accountNumber.trim()}`);
      setCustomer(response.data);
      await fetchPaymentHistory(accountNumber.trim());
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Customer account not found.";
      const detailedError =
        error.code === "ECONNREFUSED"
          ? "Connection refused. Ensure backend is running and IP address is correct."
          : error.code === "NETWORK_ERROR" || error.message?.includes("Network")
          ? "Network error. Check your Wi-Fi connection."
          : errorMessage;
      Alert.alert("Error", detailedError);
      console.error("Fetch customer error:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });
      setCustomer(null);
      setPaymentHistory([]);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const handleRefresh = async () => {
    if (!customer) return;
    setRefreshing(true);
    await Promise.all([fetchCustomerDetails(), fetchPaymentHistory(accountNumber.trim())]);
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!accountNumber.trim() || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid account number and a positive amount.");
      return;
    }

    if (!customer) {
      Alert.alert("Error", "Please fetch customer details first.");
      return;
    }

    // Validate payment amount doesn't exceed EMI due
    const paymentAmount = parseFloat(amount);
    const emiDue = parseFloat(customer.emi_due);

    if (paymentAmount > emiDue) {
      Alert.alert(
        "Payment Amount Exceeds EMI Due",
        `The payment amount (₹${paymentAmount.toFixed(2)}) exceeds the EMI due (₹${emiDue.toFixed(
          2
        )}). Please enter an amount equal to or less than the EMI due.`
      );
      return;
    }

    setLoadingPayment(true);
    try {
      const response = await apiClient.post("/payments", {
        account_number: accountNumber.trim(),
        payment_amount: parseFloat(amount),
      });

      await fetchPaymentHistory(accountNumber.trim());

      router.push({
        pathname: "/confirmation",
        params: {
          account_number: response.data.payment.account_number,
          paid_amount: response.data.payment.paid_amount.toString(),
          payment_date: response.data.payment.payment_date,
        },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Payment failed. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <LinearGradient
        colors={["#EF4444", "#DC2626", "#B91C1C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="card" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Payment Portal</Text>
          <Text style={styles.headerSubtitle}>Process EMI payment</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#EF4444" colors={["#EF4444"]} />
        }
      >
        {/* Account Number Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="wallet" size={22} color="#EF4444" />
            </View>
            <Text style={styles.cardTitle}>Account Information</Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Account Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Enter account number"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                editable={!loadingCustomer}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.fetchButton, loadingCustomer && styles.buttonDisabled]}
            onPress={fetchCustomerDetails}
            disabled={loadingCustomer}
            activeOpacity={0.85}
          >
            {loadingCustomer ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="search" size={20} color="#FFFFFF" />
                <Text style={styles.fetchButtonText}>Fetch Loan Details</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Loan Details Card */}
        {customer && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons name="document-text" size={22} color="#007AFF" />
              </View>
              <Text style={styles.cardTitle}>Loan Details</Text>
            </View>

            {/* Customer Name Display */}
            {customer.customer_name && customer.customer_name !== "N/A" && (
              <View style={styles.customerNameSection}>
                <View style={styles.customerNameIconWrapper}>
                  <Ionicons name="person" size={24} color="#007AFF" />
                </View>
                <View style={styles.customerNameContent}>
                  <Text style={styles.customerNameLabel}>Customer Name</Text>
                  <Text style={styles.customerNameValue}>{customer.customer_name}</Text>
                </View>
              </View>
            )}

            <View style={styles.loanDetailsGrid}>
              <View style={styles.detailCard}>
                <View style={styles.detailIconWrapper}>
                  <Ionicons name="wallet" size={20} color="#007AFF" />
                </View>
                <Text style={styles.detailLabel}>Account</Text>
                <Text style={styles.detailValue}>{customer.account_number}</Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailIconWrapper}>
                  <Ionicons name="calendar" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.detailLabel}>Issue Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(customer.issue_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailIconWrapper}>
                  <Ionicons name="trending-up" size={20} color="#10B981" />
                </View>
                <Text style={styles.detailLabel}>Interest Rate</Text>
                <Text style={styles.detailValue}>{customer.interest_rate}%</Text>
              </View>

              <View style={styles.detailCard}>
                <View style={styles.detailIconWrapper}>
                  <Ionicons name="time" size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.detailLabel}>Tenure</Text>
                <Text style={styles.detailValue}>{customer.tenure} months</Text>
              </View>
            </View>

            {/* EMI Due Highlight */}
            <View style={styles.emiSection}>
              <View style={styles.emiIconWrapper}>
                <Ionicons name="cash" size={28} color="#F59E0B" />
              </View>
              <View style={styles.emiContent}>
                <Text style={styles.emiLabel}>EMI Due</Text>
                <Text style={styles.emiValue}>₹{parseFloat(customer.emi_due).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment Section */}
        {customer && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons name="card" size={22} color="#10B981" />
              </View>
              <Text style={styles.cardTitle}>Payment Amount</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Enter Payment Amount</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  editable={!loadingPayment}
                />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.submitButton, loadingPayment && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loadingPayment}
              activeOpacity={0.85}
            >
              {loadingPayment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Process Payment</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Payment History Section */}
        {customer && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons name="time" size={22} color="#8B5CF6" />
              </View>
              <Text style={styles.cardTitle}>Payment History</Text>
              {paymentHistory.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{paymentHistory.length}</Text>
                </View>
              )}
            </View>

            {loadingHistory ? (
              <View style={styles.historyLoadingContainer}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.historyLoadingText}>Loading payment history...</Text>
              </View>
            ) : paymentHistory.length === 0 ? (
              <View style={styles.emptyHistoryContainer}>
                <View style={styles.emptyIconWrapper}>
                  <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
                </View>
                <Text style={styles.emptyHistoryText}>No payment history</Text>
                <Text style={styles.emptyHistorySubtext}>Payments will appear here after processing</Text>
              </View>
            ) : (
              <View style={styles.historyContainer}>
                {paymentHistory.map((payment, index) => (
                  <View key={payment.id} style={styles.historyItem}>
                    <View style={styles.historyItemLeft}>
                      <View style={styles.historyIconContainer}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                      </View>
                      <View style={styles.historyTextContainer}>
                        <Text style={styles.historyDate}>
                          {new Date(payment.payment_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                        <Text style={styles.historyTime}>
                          {new Date(payment.payment_date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.historyItemRight}>
                      <Text style={styles.historyAmount}>₹{parseFloat(payment.payment_amount).toFixed(2)}</Text>
                      <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>{payment.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: "center",
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  cardHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingHorizontal: 18,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  fetchButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  fetchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
  },
  loanDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "700",
    textAlign: "center",
  },
  customerNameSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#DBEAFE",
    marginBottom: 20,
  },
  customerNameIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  customerNameContent: {
    flex: 1,
  },
  customerNameLabel: {
    fontSize: 12,
    color: "#1E40AF",
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  customerNameValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#007AFF",
    letterSpacing: -0.5,
  },
  emiSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 20,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FEF3C7",
  },
  emiIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  emiContent: {
    flex: 1,
  },
  emiLabel: {
    fontSize: 13,
    color: "#D97706",
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emiValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#F59E0B",
    letterSpacing: -1,
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingHorizontal: 18,
    height: 64,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  badge: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: "auto",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  historyLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 12,
  },
  historyLoadingText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyHistoryContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyHistoryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  historyContainer: {
    gap: 12,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  historyTextContainer: {
    flex: 1,
  },
  historyDate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  historyItemRight: {
    alignItems: "flex-end",
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#10B981",
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
    textTransform: "uppercase",
  },
});
