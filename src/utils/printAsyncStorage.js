import AsyncStorage from "@react-native-async-storage/async-storage";

export const printAsyncStorage = () => {
    AsyncStorage.getAllKeys((err, keys) => {
        AsyncStorage.multiGet(keys, (error, stores) => {
            let asyncStorage = {};
            stores?.map((result, i, store) => {
                asyncStorage[store[i][0]] = store[i][1];
            });
            console.log(JSON.stringify(asyncStorage, null, 2));
        });
    });
};