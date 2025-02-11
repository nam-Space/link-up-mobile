import 'expo-router/entry'
import messaging from '@react-native-firebase/messaging';
import { supabase } from "./src/lib/supabase";
import { client } from "./src/utils/streamChat";
import { tokenProvider } from "./src/utils/tokenProvider";
import { setFirebaseListeners } from "./src/utils/setFirebaseListeners";
import { setPushConfig } from "./src/utils/setPushConfig";
import notifee, { EventType } from '@notifee/react-native';
import { router } from 'expo-router';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs()

setFirebaseListeners()

setPushConfig()

notifee.onBackgroundEvent(async ({ detail, type }) => {
    if (type === EventType.PRESS) {
        // user press on notification detected while app was on background on Android
        const channelId = detail.notification.android.channelId

        if (channelId === 'chat-messages') {
            const channel = detail.notification?.data;
            if (channel) {
                router.push(`/chat/${channel.cid}`)
                return
            }
        }
        else if (channelId === 'video-call') {
            router.push(`/call`)
            return
        }

        await Promise.resolve();
    }
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
        console.log('ERROR: No active auth session')
        return
    }

    if (remoteMessage.data.call_cid) {
        if (remoteMessage.data.type != 'call.missed') {
            const callChannelId = await notifee.createChannel({
                id: 'video-call',
                name: 'Video Calls',
                importance: 4, // IMPORTANCE_HIGH
                vibration: true, // Bật chế độ rung
                sound: 'default', // Sử dụng âm thanh mặc định
            });

            // Extract call details
            const callerName = remoteMessage.data.created_by_display_name || 'Unknown Caller';

            // Display incoming call notification
            await notifee.displayNotification({
                title: 'Incoming Video Call',
                body: `Call from ${callerName}`,
                android: {
                    channelId: callChannelId, // Kênh dành cho cuộc gọi video
                    smallIcon: 'ic_launcher_round', // Icon thông báo
                    fullScreenAction: {
                        id: 'default', // Đưa ứng dụng lên foreground khi nhấn
                    },
                    pressAction: {
                        id: 'default',
                    },
                    autoCancel: true
                },
            });
        }
    }
    else {
        const token = await tokenProvider();
        client._setToken(
            {
                id: data?.session?.user?.id
            },
            token)
        const message = await client.getMessage(remoteMessage.data.id);

        // create the android channel to send the notification to
        const channelId = await notifee.createChannel({
            id: 'chat-messages',
            name: 'Chat Messages',
            importance: 4, // IMPORTANCE_HIGH
            vibration: true, // Bật chế độ rung
            sound: 'default', // Sử dụng âm thanh mặc định
            visibility: 1,
        });

        // display the notification
        const { stream, ...rest } = remoteMessage.data ?? {};
        const data = {
            ...rest,
            ...((stream | undefined) ?? {}), // extract and merge stream object if present
        };
        await notifee.displayNotification({
            title: 'New message from ' + message.message.user.name,
            body: message.message.text,
            data,
            android: {
                smallIcon: 'ic_launcher_round',
                channelId,
                // add a press action to open the app on press
                pressAction: {
                    id: 'default',
                },
                sound: 'default', // Đảm bảo âm thanh được bật
                vibrationPattern: [300, 500],
                fullScreenAction: {
                    id: 'default', // Mở ứng dụng khi nhấn vào thông báo
                },
                autoCancel: true
            },
        });
    }
});