import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SymbolView, SymbolWeight } from 'expo-symbols';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// We'll only use SF Symbols for a small whitelist of known-good SF names. For
// most of the app's 'material-like' names (e.g. 'tag', 'wallet', 'cloud-upload')
// we prefer MaterialCommunityIcons which are guaranteed by @expo/vector-icons.
const SF_WHITELIST = new Set([
  'house.fill',
  'paperplane.fill',
  'chevron.left',
  'phone.fill',
  'chevron.right',
  'chevron.down',
  'xmark',
  'checkmark',
  'checkmark.circle.fill',
  'tray',
  'person.crop.circle',
  'globe',
]);

// Optional mappings from our app names to SF names when the app wants an SF
// equivalent. If present and the name is whitelisted we'll render the SF.
const SF_MAPPING: Record<string, string> = {
  'chevron.left': 'chevron.left',
  'chevron.right': 'chevron.right',
  'chevron.down': 'chevron.down',
  'xmark': 'xmark',
  'checkmark': 'checkmark',
  'checkmark.circle.fill': 'checkmark.circle.fill',
  'house.fill': 'house.fill',
  'paperplane.fill': 'paperplane.fill',
  'phone.fill': 'phone.fill',
  'tray': 'tray',
  'person.crop.circle': 'person.crop.circle',
  'globe': 'globe',
  "view-grid-plus-outline":"view-grid-plus-outline",
  "google-circles-communities":"google-circles-communities"
};

// MaterialCommunityIcons mapping used as the primary rendering option for most
// icon names used across the app.
const MCI_MAPPING: Record<string, string> = {
  'chevron.left.forwardslash.chevron.right': 'code',
  'phone.fill': 'phone',
  'chevron.right': 'chevron-right',
  'chevron.down': 'chevron-down',
  'card-outline': 'credit-card-outline',
  'cloud-upload': 'cloud-upload',
  'wallet': 'wallet-outline',
  'tag': 'tag-outline',
  'xmark': 'close',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'tray': 'tray',
  'house.fill': 'home',
  'globe': 'web',
  'paperplane.fill': 'send',
  // VTU specific (contacts + networks) fallbacks to MCI
  'person.crop.circle': 'account-circle-outline',
  'antenna.radiowaves.left.and.right': 'radio-tower',
  'dot.radiowaves.left.and.right': 'access-point',
  'waveform': 'sine-wave',
  "view-grid-plus-outline":"view-grid-plus-outline",
  "google-circles-communities":"google-circles-communities"
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Use SF only when the name is explicitly whitelisted and mapped.
  if (SF_WHITELIST.has(name) && SF_MAPPING[name]) {
    return (
      <SymbolView
        weight={weight}
        tintColor={color as any}
        resizeMode="scaleAspectFit"
        name={SF_MAPPING[name] as any}
        style={[
          {
            width: size,
            height: size,
          },
          style,
        ]}
      />
    );
  }

  const mci = MCI_MAPPING[name] ?? (name as string);
  return <MaterialCommunityIcons color={color as any} size={size} name={mci as any} style={style as any} />;
}
