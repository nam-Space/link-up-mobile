import { StyleSheet } from "react-native";
import React, { useEffect } from "react";
import {
    RingingCallContent,
    StreamCall,
    useCalls,
    useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import Loading from "@/components/Loading";

const CallScreen = () => {
    const calls = useCalls();
    const call = calls[0];

    if (!call) {
        setTimeout(() => {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.push("/");
            }
        }, 1000);

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

    // useEffect(() => {

    // })

    return (
        <StreamCall call={call}>
            <RingingCallContent />
        </StreamCall>
    );
};

export default CallScreen;

const styles = StyleSheet.create({});
