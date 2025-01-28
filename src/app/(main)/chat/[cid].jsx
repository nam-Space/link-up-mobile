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
import { Stack, useLocalSearchParams } from "expo-router";
import Loading from "@/components/Loading";
import { hp, wp } from "@/helpers/common";
import { useApp } from "@/context/AppContext";
import { theme } from "@/constants/theme";

const Chat = () => {
    const { user: currentUser } = useApp();
    const { cid } = useLocalSearchParams();
    const { client } = useChatContext();

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

    if (!channel) {
        return (
            <View
                style={{
                    marginVertical: 200,
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
