import { View, Text } from "react-native";
import React, { FC } from "react";
import { AppBottomTabScreenProps } from "../navigators/BottomTabNavigator";

type Props = AppBottomTabScreenProps<"Job">;

const Dummy: FC<Props> = () => {
  return (
    <View>
      <Text>Dummy</Text>
    </View>
  );
};

export const DummyScreen = Dummy;
