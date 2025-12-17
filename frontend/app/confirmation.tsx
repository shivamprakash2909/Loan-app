import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{ account_number: string; paid_amount: string; payment_date: string }>();
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Gradient */}
      <LinearGradient
        colors={["#34C759", "#2E7D32", "#1B5E20"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.successIconWrapper}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark" size={56} color="#34C759" />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Success Message Section */}
        <View style={styles.successSection}>
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>Your transaction has been completed successfully</Text>
        </View>

        {/* Payment Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons name="receipt" size={22} color="#007AFF" />
            </View>
            <Text style={styles.cardTitle}>Transaction Details</Text>
          </View>

          {/* Account Number */}
          <View style={styles.detailItem}>
            <View style={styles.detailIconWrapper}>
              <Ionicons name="wallet" size={18} color="#007AFF" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Account Number</Text>
              <Text style={styles.detailValue}>{params.account_number}</Text>
            </View>
          </View>

          {/* Amount - Highlighted */}
          <View style={styles.amountSection}>
            <View style={styles.amountIconWrapper}>
              <Ionicons name="cash" size={24} color="#34C759" />
            </View>
            <View style={styles.amountContent}>
              <Text style={styles.amountLabel}>Amount Paid</Text>
              <Text style={styles.amountValue}>₹{parseFloat(params.paid_amount || "0").toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment Date */}
          <View style={styles.detailItem}>
            <View style={styles.detailIconWrapper}>
              <Ionicons name="calendar" size={18} color="#FF9800" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Payment Date</Text>
              <Text style={styles.detailValue}>{formatDate(params.payment_date || "")}</Text>
            </View>
          </View>

          {/* Verification Badge */}
          <View style={styles.verificationBadge}>
            <Ionicons name="shield-checkmark" size={20} color="#34C759" />
            <Text style={styles.verificationText}>Transaction Verified & Secured</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.doneButton} onPress={() => router.back()} activeOpacity={0.85}>
          <LinearGradient
            colors={["#007AFF", "#0051D5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.doneButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    height: 280,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  headerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 0,
    paddingBottom: 40,
  },
  successSection: {
    alignItems: "center",
    marginTop: -60,
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: "500",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#F3F4F6",
  },
  cardHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 4,
  },
  detailIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
  amountSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 20,
    borderRadius: 16,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },
  amountIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  amountContent: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 32,
    color: "#34C759",
    fontWeight: "800",
    letterSpacing: -1,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 20,
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
  },
  verificationText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  doneButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
    letterSpacing: 0.3,
  },
});
