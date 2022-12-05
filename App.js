import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Button, ThemeProvider, ListItem, Icon} from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [lists, setLists] = useState([]);

  // Handle user state changes
  const onAuthStateChanged = useCallback(
    userData => {
      setUser(userData);
      // console.log('USER DATA ', userData);
      if (initializing) {
        setInitializing(false);
      }
    },
    [initializing],
  );

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [onAuthStateChanged]);

  const fetchData = useCallback(async () => {
    if (user) {
      const querySnapshot = await firestore().collection('products').get();
      const users = [];

      querySnapshot.forEach(documentSnapshot => {
        users.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id,
        });
      });
      setLists(users);
      console.log('DATA ', users);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, [fetchData]);

  const onLogin = async () => {
    auth()
      .signInWithEmailAndPassword('m.alpandi57@gmail.com', '123456')
      .then(() => {
        console.log('User account created & signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error(error);
      });
  };

  const onLogout = () => {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'));
  };

  if (initializing) {
    return null;
  }

  if (!user) {
    return (
      <View>
        <Text>Login</Text>
        <Button title="Login" onPress={onLogin} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SafeAreaView style={backgroundStyle}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={backgroundStyle}>
            <Button title="Logout!" color="error" onPress={onLogout} />
            <View>
              {lists?.map(product => (
                <ListItem key={product?.key} bottomDivider>
                  <ListItem.Content>
                    <ListItem.Title>{product.name}</ListItem.Title>
                    <ListItem.Subtitle>{product?.price}</ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
