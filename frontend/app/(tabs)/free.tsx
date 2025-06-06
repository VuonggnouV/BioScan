import { Text, View } from 'react-native';

export default function BioScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}
    >
      <Text style={{ fontSize: 24 }}>Hello World</Text>
    </View>
  );
}
