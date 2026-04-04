import { Button } from 'heroui-native';

import { View, Text } from 'react-native';

import "../global.css";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-3xl font-bold text-black mb-2">ReceiptRival</Text>
      <Text className="text-lg text-gray-500 mb-8 text-center">Track your expenses and budget like a pro</Text>
      <Button variant="secondary"  onPress={() => console.log('Pressed!')}>
        <Button.Label>Hello</Button.Label>
      </Button>
    </View>
  );
}