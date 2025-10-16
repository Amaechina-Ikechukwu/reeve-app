// Fallback for Android and web: use MaterialCommunityIcons which has broader
// coverage of common icon names (tags, wallets, cloud-upload, etc.).

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

/**
 * Add your SF Symbols to Material Icons mappings here.
 * If a mapping isn't provided we fall back to the provided name which works
 * for many Material icon names already used across the app (e.g. 'card-outline').
 */
const MAPPING: Record<string, string> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  // common app icon name mappings -> MaterialCommunityIcons
  'chevron.right': 'chevron-right',
  'chevron.down': 'chevron-down',
  'card-outline': 'credit-card-outline',
  'cloud-upload': 'cloud-upload',
  'wallet': 'wallet-outline',
  'tag': 'tag-outline',
  'xmark': 'close',
  'checkmark': 'check',
  'tray': 'tray',
  "view-grid-plus-outline":"view-grid-plus-outline",
  "google-circles-communities":"google-circles-communities"
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mapped = MAPPING[name] ?? (name as string);
  // MaterialCommunityIcons has a wide name set; cast to any to avoid strict typing
  return <MaterialCommunityIcons color={color as any} size={size} name={mapped as any} style={style as any} />;
}
