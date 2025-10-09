import { DimensionValue, View } from 'react-native';

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
};

export const Spacer = ({ width = '100%', height = '100%' }: Props) => {
  return <View style={{ height, width }} />;
};
