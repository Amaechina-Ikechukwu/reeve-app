import React from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { accent } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextInputProps = TextInputProps & {};

export function ThemedTextInput(props: ThemedTextInputProps) {
  const background = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  return (
    <TextInput
      placeholderTextColor={`${textColor}66`}
      selectionColor={accent}
      style={[styles.input, { backgroundColor: background, color: textColor, borderColor: accent }]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {

    paddingHorizontal: 12,
  
    fontSize: 16,
       borderWidth:1,
            borderColor:accent,
            height:50,
            padding:5,
            borderRadius:10
  },
});
