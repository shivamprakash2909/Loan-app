import apiClient from "@/client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Customer {
  id: number;
  customer_name: string;
  account_number: string;
  issue_date: string;
  interest_rate: string;
  tenure: number;
  emi_due: string;
}

export default function LoanDetailsScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/customers");
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (err: any) {
      const errorDetails = {
        message: err.message,
        code: err.code,
        name: err.name,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.baseURL + err.config?.url,
        baseURL: err.config?.baseURL,
        fullError: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      };

      console.error("🔴 FULL API ERROR:", errorDetails);

      let userError = "Failed to fetch loan details.";
      if (err.code === "ECONNREFUSED" || err.message?.includes("Network request failed")) {
        userError = `Connection failed. Trying: ${err.config?.baseURL}/customers\n\nError: ${err.message || err.code}`;
      } else if (err.response) {
        userError = `Server error (${err.response.status}): ${err.response.data?.message || err.message}`;
      } else {
        userError = `Error: ${err.message || err.code || "Unknown error"}\n\nURL: ${err.config?.baseURL}/customers`;
      }

      setError(userError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Real-time search filtering
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCustomers(customers);
      setIsSearching(false);
      setError(null);
    } else {
      setIsSearching(true);
      const query = searchQuery.toLowerCase().trim();
      const filtered = customers.filter(
        (customer) =>
          customer.account_number.toLowerCase().includes(query) ||
          (customer.customer_name && customer.customer_name.toLowerCase().includes(query))
      );
      setFilteredCustomers(filtered);

      // Clear error if we have results
      if (filtered.length > 0) {
        setError(null);
      }
    }
  }, [searchQuery, customers]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      setIsSearching(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setIsSearching(true);

    const query = searchQuery.trim();

    // Try searching by account number first (exact match)
    try {
      const response = await apiClient.get(`/customers/${query}`);
      setFilteredCustomers([response.data]);
      setError(null);
    } catch (err: any) {
      // If account number search fails, filter from existing customers
      const queryLower = query.toLowerCase();
      const filtered = customers.filter(
        (customer) =>
          customer.account_number.toLowerCase().includes(queryLower) ||
          (customer.customer_name && customer.customer_name.toLowerCase().includes(queryLower))
      );

      if (filtered.length > 0) {
        setFilteredCustomers(filtered);
        setError(null);
      } else {
        setError("No customer found matching your search.");
        setFilteredCustomers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setError(null);
    setIsSearching(false);
    fetchCustomers();
  };

  if (loading && !customers.length && !isSearching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading loan details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <LinearGradient
        colors={["#007AFF", "#0051D5", "#003D99"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="document-text" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Loan Management</Text>
          <Text style={styles.headerSubtitle}>
            {isSearching
              ? `${filteredCustomers.length} Result${filteredCustomers.length !== 1 ? "s" : ""} Found`
              : `${customers.length} Active Account${customers.length !== 1 ? "s" : ""}`}
          </Text>
        </View>
      </LinearGradient>

      {/* Enhanced Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={22} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by Account Number or Customer Name"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.searchButton, isSearching && styles.searchButtonActive]}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
        {isSearching && (
          <View style={styles.searchInfo}>
            <Ionicons name="information-circle" size={16} color="#6B7280" />
            <Text style={styles.searchInfoText}>
              Showing results for "{searchQuery}" • {filteredCustomers.length} found
            </Text>
          </View>
        )}
      </View>

      {error && !loading && (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
          </View>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && isSearching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={loading && !isSearching} onRefresh={fetchCustomers} tintColor="#007AFF" />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.accountBadge}>
                  <View style={styles.accountIconWrapper}>
                    <Ionicons name="wallet" size={18} color="#007AFF" />
                  </View>
                  <View>
                    <Text style={styles.customerName}>{item.customer_name || "N/A"}</Text>
                    <Text style={styles.accountNumber}>{item.account_number}</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>

              {/* EMI Due Highlight */}
              <View style={styles.emiSection}>
                <View style={styles.emiIconWrapper}>
                  <Ionicons name="cash" size={28} color="#F59E0B" />
                </View>
                <View style={styles.emiContent}>
                  <Text style={styles.emiLabel}>EMI Due</Text>
                  <Text style={styles.emiAmount}>₹{parseFloat(item.emi_due).toFixed(2)}</Text>
                </View>
              </View>

              {/* Loan Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="calendar" size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.detailLabel}>Issue Date</Text>
                  <Text style={styles.detailValue}>
                    {new Date(item.issue_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>

                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="trending-up" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.detailLabel}>Interest Rate</Text>
                  <Text style={styles.detailValue}>{item.interest_rate}%</Text>
                </View>

                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="time" size={20} color="#8B5CF6" />
                  </View>
                  <Text style={styles.detailLabel}>Tenure</Text>
                  <Text style={styles.detailValue}>{item.tenure} months</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name={isSearching ? "search-outline" : "document-text-outline"} size={72} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyText}>{isSearching ? "No results found" : "No loan accounts found"}</Text>
              <Text style={styles.emptySubtext}>
                {isSearching
                  ? `No customer found matching "${searchQuery}". Try a different search term.`
                  : "Try a different search or add a new customer"}
              </Text>
              {isSearching && (
                <TouchableOpacity style={styles.clearSearchButton} onPress={handleClearSearch}>
                  <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
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
  searchSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchWrapper: {
    gap: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 56,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  searchButtonActive: {
    backgroundColor: "#0051D5",
  },
  searchInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInfoText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    margin: 20,
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    gap: 12,
  },
  errorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    flex: 1,
    color: "#DC2626",
    marginLeft: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  listContainer: {
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  accountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF5FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 10,
  },
  accountIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
  emiSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
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
  emiAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#F59E0B",
    letterSpacing: -1,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailIconContainer: {
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
  emptyContainer: {
    padding: 60,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  clearSearchButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
