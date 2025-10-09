import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

type Props = {
  children: React.ReactNode;
} & TouchableOpacityProps;

export const Button = (props: Props) => {
  return (
    <TouchableOpacity
      style={{
        minHeight: 50,
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...props}
    >
      {props.children}
    </TouchableOpacity>
  );
};
