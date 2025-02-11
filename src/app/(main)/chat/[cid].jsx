import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import {
    Channel,
    ChannelAvatar,
    MessageInput,
    MessageList,
    Thread,
    useChatContext,
} from "stream-chat-expo";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Loading from "@/components/Loading";
import { hp, wp } from "@/helpers/common";
import { useApp } from "@/context/AppContext";
import { theme } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useStreamVideoClient } from "@stream-io/video-react-native-sdk";
import * as Crypto from "expo-crypto";

const Chat = () => {
    const { user: currentUser } = useApp();
    const { cid } = useLocalSearchParams();
    const { client } = useChatContext();
    const videoClient = useStreamVideoClient();

    const [channel, setChannel] = useState();
    const [thread, setThread] = useState();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchChannel = async () => {
            const channels = await client.queryChannels({ cid });
            setChannel(channels[0]);
            if (currentUser?.id) {
                const userId = Object.keys(channels[0].state.members).find(
                    (id) => id != currentUser.id
                );
                const user = channels[0].state.members[userId].user;
                setUser(user);
            }
        };

        fetchChannel();
    }, [cid, currentUser]);

    const joinCall = async () => {
        const members = Object.values(channel.state.members).map((member) => {
            return {
                user_id: member.user_id,
            };
        });

        const call = videoClient.call("default", Crypto.randomUUID());
        await call.getOrCreate({
            ring: true,
            data: {
                members,
            },
        });

        router.push(`/call`);
    };

    if (!channel) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Loading />
            </View>
        );
    }

    return (
        // <ScreenWrapper bg="white">
        <>
            <Stack.Screen
                name="(main)/chat/[cid]"
                options={{
                    headerShown: true,
                    title: "",
                    headerTitle: (props) => (
                        <View style={styles.userInfo}>
                            <View style={{ flexDirection: "row" }}>
                                <ChannelAvatar channel={channel} />
                            </View>
                            <View style={{ gap: 2 }}>
                                <Text style={styles.username}>
                                    {user?.name}
                                </Text>
                                <Text style={styles.active}>
                                    {user?.online ? "Active" : "Offline"}
                                </Text>
                            </View>
                        </View>
                    ),
                    headerRight: () => (
                        <Ionicons
                            name="call"
                            size={24}
                            color="black"
                            onPress={joinCall}
                        />
                    ),
                }}
            />
            <Channel
                channel={channel}
                keyboardVerticalOffset={0}
                thread={thread}
                threadList={!!thread}
            >
                {thread ? (
                    <Thread />
                ) : (
                    <>
                        <MessageList onThreadSelect={setThread} />
                        <MessageInput />
                    </>
                )}
            </Channel>
        </>
        // </ScreenWrapper>
    );
};

export default Chat;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: wp(4),
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    username: {
        fontSize: hp(1.7),
        color: theme.colors.textDark,
        fontWeight: theme.fonts.medium,
    },
    active: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontWeight: theme.fonts.medium,
    },
});
