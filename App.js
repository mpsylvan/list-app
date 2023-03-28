// import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {useNetInfo} from "@react-native-community/netinfo";
import {useEffect} from "react";
import {Alert, LogBox} from "react-native";
import firebaseConfig from './utils/utils';

// Create the navigator
const Stack = createNativeStackNavigator();

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// import the screens
import ShoppingLists from './components/ShoppingLists';
import Welcome from './components/Welcome';

LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);

const App = () => {
  
  const connectionStatus = useNetInfo();

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);


  useEffect(()=>{
    if(connectionStatus.isConnected === false){
      Alert.alert("App is no longer connected to internet.")
    }
  }, [connectionStatus.isConnected])

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen
          name="ShoppingLists"
        >
          {props => <ShoppingLists db={db} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;


