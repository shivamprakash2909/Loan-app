import { Tabs } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarButton: HapticTab }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Loan Details',
          tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: 'Make Payment',
          tabBarIcon: ({ color }) => <Ionicons name="card-outline" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}