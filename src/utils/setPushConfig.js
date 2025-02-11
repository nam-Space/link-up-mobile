import {
    StreamVideoClient,
    StreamVideoRN,
} from "@stream-io/video-react-native-sdk";
import { AndroidImportance } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tokenProvider } from "./tokenProvider";
import { chatMessagingApiKey } from "@/constants";

export function setPushConfig() {
    StreamVideoRN.setPushConfig({
        // pass true to inform the SDK that this is an expo app
        isExpo: true,
        android: {
            // add your push_provider_name for Android that you have setup in Stream dashboard
            pushProviderName: "Firebase"
                ? "firebase-video-staging"
                : "firebase-video-production",
            // configure the notification channel to be used for incoming calls for Android.
            incomingCallChannel: {
                id: "stream_incoming_call",
                name: "Incoming call notifications",
                // This is the advised importance of receiving incoming call notifications.
                // This will ensure that the notification will appear on-top-of applications.
                importance: AndroidImportance.HIGH,
                // optional: if you dont pass a sound, default ringtone will be used
                // sound: <your sound url>
            },
            // configure the functions to create the texts shown in the notification
            // for incoming calls in Android.
            incomingCallNotificationTextGetters: {
                getTitle: (createdUserName) =>
                    `Incoming call from ${createdUserName}`,
                getBody: (_createdUserName) => "Tap to answer the call",
            },
        },
        // add the async callback to create a video client
        // for incoming calls in the background on a push notification
        createStreamVideoClient: async () => {
            // note that since the method is async,
            // you can call your server to get the user data or token or retrieve from offline storage.
            let userId = ''
            let userName = ''

            AsyncStorage.getAllKeys((err, keys) => {
                AsyncStorage.multiGet(keys, (error, stores) => {
                    stores?.map((result, i, store) => {
                        userId = JSON.parse(store[i][1]).user.id
                        userName = JSON.parse(store[i][1]).user.user_metadata.name
                    });
                });
            });
            // an example promise to fetch token from your server
            const token = await tokenProvider();

            console.log('userId', userId)
            console.log('userName', userName)

            if (!userId) return undefined;

            const user = { id: userId, name: userName };
            return StreamVideoClient.getOrCreateInstance({
                apiKey: chatMessagingApiKey, // pass your stream api key
                user,
                token,
            });
        },
    });
}