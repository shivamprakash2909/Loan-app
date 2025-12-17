import apiClient from "@/client";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddCustomerScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customer_name: "",
    account_number: "",
    issue_date: "",
    interest_rate: "",
    tenure: "",
    emi_due: "",
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateDate = (dateString: string): boolean => {
    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    // Check if it's a valid date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return false;
    }

    // Check if the date string matches the parsed date (prevents invalid dates like 2024-13-45)
    const [year, month, day] = dateString.split("-").map(Number);
    return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
  };

  const handleDatePickerChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      const formattedDate = formatDateForInput(date);
      handleInputChange("issue_date", formattedDate);
    }
  };

  const handleManualDateChange = (value: string) => {
    // Allow typing
    handleInputChange("issue_date", value);
  };

  const handleDateInputBlur = () => {
    // Validate when user finishes typing
    if (formData.issue_date && !validateDate(formData.issue_date)) {
      Alert.alert("Invalid Date", "Please enter a valid date in YYYY-MM-DD format (e.g., 2024-01-15)");
      handleInputChange("issue_date", "");
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!formData.customer_name.trim()) {
      Alert.alert("Validation Error", "Please enter customer name.");
      return;
    }

    if (formData.customer_name.trim().length < 2) {
      Alert.alert("Validation Error", "Customer name must be at least 2 characters long.");
      return;
    }

    if (!formData.account_number.trim()) {
      Alert.alert("Validation Error", "Please enter an account number.");
      return;
    }

    if (!formData.issue_date.trim()) {
      Alert.alert("Validation Error", "Please enter an issue date.");
      return;
    }

    if (!validateDate(formData.issue_date.trim())) {
      Alert.alert("Validation Error", "Please enter a valid date in YYYY-MM-DD format (e.g., 2024-01-15).");
      return;
    }

    if (
      !formData.interest_rate ||
      isNaN(parseFloat(formData.interest_rate)) ||
      parseFloat(formData.interest_rate) <= 0
    ) {
      Alert.alert("Validation Error", "Please enter a valid interest rate (positive number).");
      return;
    }

    if (!formData.tenure || isNaN(parseInt(formData.tenure)) || parseInt(formData.tenure) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid tenure in months (positive number).");
      return;
    }

    if (!formData.emi_due || isNaN(parseFloat(formData.emi_due)) || parseFloat(formData.emi_due) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid EMI due amount (positive number).");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/customers", {
        customer_name: formData.customer_name.trim(),
        account_number: formData.account_number.trim(),
        issue_date: formData.issue_date.trim(),
        interest_rate: formData.interest_rate,
        tenure: parseInt(formData.tenure),
        emi_due: parseFloat(formData.emi_due),
      });

      Alert.alert("Success", `Customer account ${response.data.account_number} created successfully!`, [
        {
          text: "OK",
          onPress: () => {
            setFormData({
              customer_name: "",
              account_number: "",
              issue_date: "",
              interest_rate: "",
              tenure: "",
              emi_due: "",
            });
            router.push("/(tabs)");
          },
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        "Failed to create customer. Please try again.";
      Alert.alert("Error", errorMessage);
      console.error("Create customer error:", {
        message: error.message,
        response: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <LinearGradient
        colors={["#10B981", "#059669", "#047857"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="person-add" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>New Customer</Text>
          <Text style={styles.headerSubtitle}>Create a loan account</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Ionicons name="document-text" size={24} color="#10B981" />
            <Text style={styles.formTitle}>Account Information</Text>
          </View>

          {/* Customer Name */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <View style={styles.labelIconContainer}>
                <Ionicons name="person" size={18} color="#007AFF" />
              </View>
              <Text style={styles.label}>Customer Name</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.customer_name}
              onChangeText={(value) => handleInputChange("customer_name", value)}
              placeholder="e.g., John Doe"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>

          {/* Account Number */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <View style={styles.labelIconContainer}>
                <Ionicons name="wallet" size={18} color="#007AFF" />
              </View>
              <Text style={styles.label}>Account Number</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.account_number}
              onChangeText={(value) => handleInputChange("account_number", value)}
              placeholder="e.g., ACC001"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              editable={!loading}
            />
          </View>

          {/* Issue Date */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <View style={styles.labelIconContainer}>
                <Ionicons name="calendar" size={18} color="#F59E0B" />
              </View>
              <Text style={styles.label}>Issue Date</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInput}
                value={formData.issue_date}
                onChangeText={handleManualDateChange}
                onBlur={handleDateInputBlur}
                placeholder="YYYY-MM-DD (e.g., 2024-01-15)"
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => {
                  if (formData.issue_date && validateDate(formData.issue_date)) {
                    const [year, month, day] = formData.issue_date.split("-").map(Number);
                    setSelectedDate(new Date(year, month - 1, day));
                  }
                  setShowDatePicker(true);
                }}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={22} color="#F59E0B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Format: YYYY-MM-DD or tap calendar icon to select</Text>

            {/* Date Picker Modal */}
            {showDatePicker && (
              <>
                {Platform.OS === "ios" ? (
                  <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                          <Text style={styles.modalTitle}>Select Issue Date</Text>
                          <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.modalCloseButton}>
                            <Ionicons name="close" size={24} color="#111827" />
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={selectedDate}
                          mode="date"
                          display="spinner"
                          onChange={handleDatePickerChange}
                          maximumDate={new Date()}
                          style={styles.datePicker}
                        />
                        <View style={styles.modalActions}>
                          <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowDatePicker(false)}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.modalConfirmButton}
                            onPress={() => {
                              const formattedDate = formatDateForInput(selectedDate);
                              handleInputChange("issue_date", formattedDate);
                              setShowDatePicker(false);
                            }}
                          >
                            <Text style={styles.modalConfirmText}>Confirm</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                ) : (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDatePickerChange}
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}
          </View>

          {/* Interest Rate */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <View style={styles.labelIconContainer}>
                <Ionicons name="trending-up" size={18} color="#10B981" />
              </View>
              <Text style={styles.label}>Interest Rate</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View style={styles.inputWithSuffix}>
              <TextInput
                style={styles.inputFlex}
                value={formData.interest_rate}
                onChangeText={(value) => handleInputChange("interest_rate", value)}
                placeholder="8.5"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                editable={!loading}
              />
              <Text style={styles.inputSuffix}>%</Text>
            </View>
          </View>

          {/* Tenure */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <View style={styles.labelIconContainer}>
                <Ionicons name="time" size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.label}>Tenure</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View style={styles.inputWithSuffix}>
              <TextInput
                style={styles.inputFlex}
                value={formData.tenure}
                onChangeText={(value) => handleInputChange("tenure", value)}
                placeholder="36"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                editable={!loading}
              />
              <Text style={styles.inputSuffix}>months</Text>
            </View>
          </View>

          {/* EMI Due */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <View style={styles.labelIconContainer}>
                <Ionicons name="cash" size={18} color="#F59E0B" />
              </View>
              <Text style={styles.label}>EMI Due Amount</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View style={styles.inputWithPrefix}>
              <Text style={styles.inputPrefix}>₹</Text>
              <TextInput
                style={styles.inputFlex}
                value={formData.emi_due}
                onChangeText={(value) => handleInputChange("emi_due", value)}
                placeholder="5000.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                editable={!loading}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Create Customer Account</Text>
                </LinearGradient>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  labelIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  required: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  inputWithSuffix: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 18,
  },
  inputWithPrefix: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 18,
  },
  inputFlex: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    paddingVertical: 16,
  },
  inputPrefix: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B7280",
    marginRight: 12,
  },
  inputSuffix: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 12,
  },
  helperText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
    marginLeft: 4,
    fontWeight: "500",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 18,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
    paddingVertical: 16,
  },
  calendarButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalCloseButton: {
    padding: 4,
  },
  datePicker: {
    height: 200,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
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
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
