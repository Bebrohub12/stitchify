import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from './screens/Splash';

const Stack = createNativeStackNavigator();
const RootScreen = ({ navigation }) => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            <Stack.Screen name="Splash" component={Splash} />
        </Stack.Navigator>
    );
};

export default RootScreen;