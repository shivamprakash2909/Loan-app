import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 90,
          paddingBottom: 24,
          paddingTop: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 0.2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Loan Details",
          tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-customer"
        options={{
          title: "Add Customer",
          tabBarIcon: ({ color }) => <Ionicons name="person-add-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: "Make Payment",
          tabBarIcon: ({ color }) => <Ionicons name="card-outline" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
