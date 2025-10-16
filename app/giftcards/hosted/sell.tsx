import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedTextInput } from '@/components/ui/text-input';
import { Colors } from '@/constants/theme';
import { useToast } from '@/contexts/ToastContext';
import { storage } from '@/firebase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useLayoutEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SellHostedCard() {
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const router = useRouter();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [type, setType] = useState('Shopping');
  const [value, setValue] = useState('');
  const [price, setPrice] = useState('');
  const [code, setCode] = useState('');

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast('Permission to access photos is required', 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      // Handle both legacy (result.cancelled / result.uri) and new (result.canceled / result.assets)
      // Newer versions of expo-image-picker return { canceled: boolean, assets: [{ uri, ... }] }
      // Older versions returned { cancelled: boolean, uri }
      // Normalize and set imageUri when an image was picked.
      const anyRes: any = result;
      if (anyRes.cancelled === false || anyRes.canceled === false) {
        // legacy result.uri or new assets
        if (anyRes.uri) setImageUri(anyRes.uri);
        else if (anyRes.assets && anyRes.assets.length > 0 && anyRes.assets[0].uri) setImageUri(anyRes.assets[0].uri);
      } else if (anyRes.assets && anyRes.assets.length > 0 && anyRes.assets[0].uri) {
        // some platforms may return assets even when not providing canceled flag
        setImageUri(anyRes.assets[0].uri);
      }
    } catch (e: any) {
      showToast(e?.message || 'Could not pick image', 'error');
    }
  };

  const uploadImageAsync = async (uri: string, filename: string) => {
    // Fetch blob from local uri and upload to firebase storage
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  useLayoutEffect(() => {
    navigation.setOptions?.({
      headerShown: true,
      headerTitle: 'Sell a card',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors[colorScheme ?? 'light'].icon + '20',
      },
      headerTintColor: Colors[colorScheme ?? 'light'].text,
      headerLeft: () => (
        <TouchableOpacity style={{ padding: 8 }} onPress={() => router.back()}>
          <IconSymbol size={24} name="chevron.left" color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router, colorScheme]);

  const onSubmit = async () => {
    if (uploading) return;
    if (!name || !value || !price || !code) {
      showToast('Please fill all fields', 'error');
      return;
    }

    setUploading(true);
    try {
      const firebaseAuth = getAuth();
      const user = firebaseAuth.currentUser;
      if (!user) {
        showToast('You must be signed in to sell a card', 'error');
        setUploading(false);
        return;
      }

      const idToken = await user.getIdToken(true);

      let imageUrl = '';
      if (imageUri) {
        // determine extension
        const extMatch = imageUri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        const ext = extMatch ? extMatch[1] : 'jpg';
        const filename = `cards/${user.uid}/${Date.now()}-${(name || 'card').replace(/\s+/g, '-')}.${ext}`;
        imageUrl = await uploadImageAsync(imageUri, filename);
      }

      const apiBase = API_BASE_URL.replace(/\/$/, '');
      const res = await fetch(`${apiBase}/giftcards/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type, value, price, image: imageUrl, code }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message || json?.error || `Upload failed (${res.status})`;
        showToast(msg, 'error', 6000);
        setUploading(false);
        return;
      }

      showToast('Card uploaded successfully', 'success');
      router.replace('/giftcards/market' as any);
    } catch (e: any) {
      showToast(e?.message || 'Network error', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}> 
      <View style={styles.content}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Sell / Upload Gift Card</Text>

        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="Card name" value={name} onChangeText={setName} />
        </View>

        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="Type (e.g. Shopping)" value={type} onChangeText={setType} />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <ThemedTextInput placeholder="Value (recipient)" value={value} onChangeText={setValue} keyboardType="numeric" />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <ThemedTextInput placeholder="Price (seller)" value={price} onChangeText={setPrice} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <ThemedTextInput placeholder="Code" value={code} onChangeText={setCode} autoCapitalize="none" />
        </View>

        <View style={{ height: 12 }} />

        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          </View>
        ) : (
          <View style={{ marginBottom: 12 }} />
        )}

        <TouchableOpacity onPress={pickImage} style={styles.linkButton}>
          <Text style={[styles.linkText, { color: Colors[colorScheme ?? 'light'].tint }]}>{imageUri ? 'Change image' : 'Pick an image'}</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />

        <Button title="Upload & List card" onPress={onSubmit} loading={uploading} disabled={uploading} />

        <View style={{ height: 12 }} />
     

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  formGroup: { marginTop: 16 },
  inputContainer: { paddingVertical: 4 },
  row: { flexDirection: 'row', gap: 12,marginTop:20 },
  previewWrap: { marginTop: 12, borderRadius: 8, overflow: 'hidden', height: 160, backgroundColor: '#f4f4f4' },
  preview: { width: '100%', height: '100%' },
  linkButton: { paddingVertical: 8 },
  linkText: { fontSize: 16 },
});
