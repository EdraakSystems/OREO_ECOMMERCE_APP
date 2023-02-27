import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';

const SplashScreen = () => {
  const checkLogin = async () => {
    navigation.navigate('HomeTabs');
  };

  useEffect(() => {
    setTimeout(function () {
      checkLogin();
    }, 2000);
  }, []);
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{fontSize: 55}}>SplashScreen</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
