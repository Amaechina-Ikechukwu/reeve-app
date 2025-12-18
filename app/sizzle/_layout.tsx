import { Stack } from 'expo-router';

export default function SizzleLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: '' }}>
      <Stack.Screen name="index" options={{ title: 'Sizzle Orders' }} />
      <Stack.Screen name="purchase" options={{ title: 'Buy Sizzle' }} />
      <Stack.Screen name="order/[order]/status" options={{ title: 'Order Status' }} />
    </Stack>
  );
}