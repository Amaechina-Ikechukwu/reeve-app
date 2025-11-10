import React from 'react';
import { Image, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function SplashScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      {/* Main App Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={require('@/assets/images/splash-icon-dark.png')}
          style={styles.mainIcon}
          resizeMode="contain"
        />
      </View>

      {/* Powered by Paystack - at the bottom */}
      <View style={styles.footerContainer}>
        <View style={styles.poweredByContainer}>
          <Text style={[styles.poweredByText, { color: isDark ? '#ffffff' : '#000000' }]}>
            Powered by Paystack
          </Text>
          <Image
            source={require('@/assets/images/paystackicon.png')}
            style={styles.paystackIcon}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainIcon: {
    width: 200,
    height: 200,
  },
  footerContainer: {
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  poweredByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap:4
  },
  poweredByText: {
    fontSize: 14,
    fontWeight: '400',
   
  },
  paystackIcon: {
    width: 25,
    height: 25,
  },
});
