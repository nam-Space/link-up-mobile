
import React, { useEffect, useState } from 'react'
import messaging from '@react-native-firebase/messaging';
import { client } from '@/utils/streamChat';
import { useApp } from './AppContext';
import notifee from '@notifee/react-native';

const NotificationsProvider = ({ children }) => {
    const [isReady, setIsReady] = useState(false)
    const { user } = useApp()

    useEffect(() => {
        const requestPermissionNotifee = async () => {
            const settings = await notifee.requestPermission();
            if (settings.authorizationStatus === 1) {
                console.log('Notification permission granted.');
            } else {
                console.log('Notification permission denied.');
            }
        };

        requestPermissionNotifee()
    }, []);

    const requestPermission = async () => {
        if (user?.id) {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
            if (enabled) {
                console.log('Authorization status:', authStatus);
            }
        }
    };



    useEffect(() => {
        // Register FCM token with stream chat server.
        const registerPushToken = async () => {
            // unsubscribe any previous listener
            if (user?.id && client.userID) {
                const token = await messaging().getToken();
                const push_provider = 'firebase';
                const push_provider_name = 'Firebase'; // name an alias for your push provider (optional)
                client.addDevice(token, push_provider, user?.id, push_provider_name)
                // client.setLocalDevice({
                //     id: token,
                //     push_provider,
                //     // push_provider_name is meant for optional multiple providers support, see: /chat/docs/react/push_providers_and_multi_bundle
                //     push_provider_name,
                // });
            }

        };
        const init = async () => {
            await requestPermission();
            await registerPushToken();
            setIsReady(true);
        };
        init();
    }, [JSON.stringify(user)]);

    return (
        <>{children}</>
    )
}

export default NotificationsProvider