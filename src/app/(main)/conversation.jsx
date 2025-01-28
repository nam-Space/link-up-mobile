import { StyleSheet, View } from "react-native";
import React from "react";
import { ChannelList } from "stream-chat-expo";
import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/Header";
import { wp } from "@/helpers/common";
import { router } from "expo-router";
import { useApp } from "@/context/AppContext";

const Conversation = () => {
    const { user } = useApp();

    return (
        <ScreenWrapper bg="white">
            <View style={styles.container}>
                <Header title={`Conversation`} />
            </View>

            <ChannelList
                filters={{ members: { $in: [user?.id] } }}
                onSelect={(channel) => router.push(`/chat/${channel.cid}`)}
            />
        </ScreenWrapper>
    );
};
export default Conversation;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: wp(4),
    },
});
