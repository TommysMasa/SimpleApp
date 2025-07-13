import React from 'react';
import { Keyboard, Pressable } from 'react-native';

interface DismissKeyboardProps {
  children: React.ReactNode;
  style?: any;
}

const DismissKeyboard: React.FC<DismissKeyboardProps> = ({ children, style }) => {
  const dismissKeyboard = () => {
    console.log('DismissKeyboard: Tapped, dismissing keyboard');
    Keyboard.dismiss();
  };

  return (
    <Pressable 
      onPress={dismissKeyboard}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </Pressable>
  );
};

export default DismissKeyboard; 