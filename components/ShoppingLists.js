import { useEffect, useState } from "react";
import {
  StyleSheet, View, FlatList, Text,
  TextInput, KeyboardAvoidingView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { collection, addDoc, onSnapshot, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ShoppingLists = ({ db, route }) => {
  const { userID } = route.params;

  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState("");
  const [item1, setItem1] = useState("");
  const [item2, setItem2] = useState("");

  useEffect(() => {

    const shoppingListRef = collection(db, "shoppingList")
    const q = query(shoppingListRef, where("uid", "==", userID));
    const unsubShoppinglists = onSnapshot(q,(documentsSnapshot) => {
      let newLists = [];
      documentsSnapshot.forEach(doc => {
        newLists.push({ id: doc.id, ...doc.data() })
      });
      cacheShoppingList(newLists);
      setLists(newLists);
    });

    // Clean up code
    return () => {
      if (unsubShoppinglists) unsubShoppinglists();
    }
  }, []);


  // try to store a list array fetched out of firebase in client storage, return error if AsyncStorage fails.
  const cacheShoppingList = async (listToCache) =>{
    try{
      await AsyncStorage.setItem('shoppingLists', JSON.stringify(listToCache));
    }
    catch(err){
      console.log(err.message);
    }
  }

  const addShoppingList = async (newList) => {
    const newListRef = await addDoc(collection(db, "shoppingList"), newList);
    if (newListRef.id) {
      setLists([newList, ...lists]);
      setListName("");
      setItem1("");
      setItem2("");
      Alert.alert(`The list "${listName}" has been added.`);
    } else {
      Alert.alert("Unable to add. Please try later");
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.listsContainer}
        data={lists}
        renderItem={({ item }) =>
          <View style={styles.listItem}>
            <Text >{item.name}: {item.items.join(', ')}</Text>
          </View>
        }
      />
      <View style={styles.listForm}>
        <TextInput
          style={styles.listName}
          placeholder="List Name"
          value={listName}
          onChangeText={setListName}
        />
        <TextInput
          style={styles.item}
          placeholder="Item #1"
          value={item1}
          onChangeText={setItem1}
        />
        <TextInput
          style={styles.item}
          placeholder="Item #2"
          value={item2}
          onChangeText={setItem2}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            const newList = {
              uid: userID,
              name: listName,
              items: [item1, item2]
            }
            addShoppingList(newList);
          }}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {Platform.OS === "ios" ? <KeyboardAvoidingView behavior="padding" /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listItem: {
    height: 70,
    justifyContent: "center",
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#AAA",
    flex: 1,
    flexGrow: 1
  },
  listForm: {
    flexBasis: 275,
    flex: 0,
    margin: 15,
    padding: 15,
    backgroundColor: "#CCC"
  },
  listName: {
    height: 50,
    padding: 15,
    fontWeight: "600",
    marginRight: 50,
    marginBottom: 15,
    borderColor: "#555",
    borderWidth: 2
  },
  item: {
    height: 50,
    padding: 15,
    marginLeft: 50,
    marginBottom: 15,
    borderColor: "#555",
    borderWidth: 2
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    backgroundColor: "#000",
    color: "#FFF"
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 20
  },
  logoutButton: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "#C00",
    padding: 10,
    zIndex: 1
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 10
  }
});

export default ShoppingLists;