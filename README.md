# Reeve - Your Digital Financial Companion

Reeve is a comprehensive mobile application built with React Native and Expo that provides seamless access to essential financial and utility services. From daily essentials like airtime and data purchases to advanced features like crypto P2P trading and gift cards, Reeve makes managing your digital life effortless.

## Features

### Core Services
- Airtime & Data: Instant mobile top-ups and data bundle purchases
- Cable TV: Pay for DSTV, GOTV, and other cable subscriptions
- Electricity: Bill payments for various electricity providers
- Gift Cards: Purchase and redeem digital gift cards
- Virtual Numbers: Get temporary phone numbers for privacy
- Social Growth: Social media management tools
- Cards: Virtual and physical card management
- Crypto P2P: Peer-to-peer cryptocurrency trading

### Security & Verification
- Firebase Authentication: Secure user authentication
- BVN Verification: Bank Verification Number integration for identity verification
- Transaction PIN: Secure transaction authorization
- Digital Wallet: Integrated wallet functionality

### User Experience
- Dark/Light Mode: Automatic theme switching
- Cross-Platform: Native Android, iOS, and Web support
- Modern UI: Beautiful gradients and haptic feedback
- Charts & Analytics: Data visualization with react-native-chart-kit
- Push Notifications: Real-time updates and alerts

## Tech Stack

- Framework: React Native with Expo
- Navigation: Expo Router (file-based routing)
- Backend: Firebase (Auth, Database, Storage)
- State Management: Zustand
- UI Components: Custom themed components
- Charts: Victory Native & react-native-chart-kit
- Icons: Expo Vector Icons
- Styling: Linear gradients and custom themes

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reeve-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   EXPO_PUBLIC_API_URL=your_backend_api_url
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on specific platforms**
   ```bash
   # Android
   npm run android

   # iOS
   npm run ios

   # Web
   npm run web
   ```

## Usage

### First Time Setup
1. Launch the app and complete the onboarding process
2. Create an account or sign in with existing credentials
3. Complete BVN verification for full access
4. Set up your transaction PIN
5. Fund your wallet to start using services

### Available Services
- Navigate through the tab bar to access different services
- Use the home screen cards to quickly access popular features
- Check your transaction history and wallet balance
- Manage your profile and security settings

## Project Structure

```
reeve-app/
├── app/                    # Main application screens (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen with service cards
│   │   ├── explore.tsx    # Explore/features screen
│   │   └── _layout.tsx    # Tab navigation layout
│   ├── auth/              # Authentication screens
│   ├── onboarding/        # Onboarding flow
│   └── modal.tsx          # Modal screens
├── components/            # Reusable UI components
│   ├── ui/               # Core UI components (buttons, inputs, etc.)
│   └── ...               # Themed components
├── constants/            # App constants and themes
├── contexts/             # React contexts (Toast, etc.)
├── hooks/                # Custom React hooks
├── assets/               # Images, icons, and media files
├── scripts/              # Utility scripts
└── firebase.ts           # Firebase configuration
```

## Development

### Code Quality
- Linting: ESLint with Expo configuration
- TypeScript: Full type safety
- Code Style: Consistent formatting and naming conventions

### Available Scripts
```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device
npm run web        # Run on web browser
npm run lint       # Run ESLint
npm run reset-project  # Reset to clean Expo template
```

### Key Dependencies
- `@expo/vector-icons`: Icon library
- `expo-router`: File-based routing
- `firebase`: Backend services
- `zustand`: State management
- `react-native-chart-kit`: Data visualization
- `expo-camera`: Camera functionality
- `expo-secure-store`: Secure data storage

## Security Features

- Biometric Authentication: Device-level security
- Secure Storage: Encrypted local data storage
- Token-based Auth: JWT authentication with Firebase
- PIN Protection: Transaction authorization
- BVN Integration: Identity verification

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support and questions:
- Check the [Expo Documentation](https://docs.expo.dev/)
- Review Firebase documentation for backend issues
- Create an issue in the repository

## Roadmap

- [ ] Multi-currency wallet support
- [ ] Advanced crypto trading features
- [ ] Bill payment reminders
- [ ] Social features integration
- [ ] Enhanced security with hardware keys

---

Built with using React Native and Expo
