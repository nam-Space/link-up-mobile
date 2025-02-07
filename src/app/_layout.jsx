import { StatusBar, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { router, Stack } from "expo-router";
import { AppProvider, useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { client } from "@/utils/streamChat";
import { Chat, OverlayProvider } from "stream-chat-expo";
import { getUserImageSrc } from "@/services/imageService";
import { tokenProvider } from "@/utils/tokenProvider";
import VideoProvider from "@/context/VideoProvider";
import CallProvider from "@/context/CallProvider";

const _layout = () => {
    return (
        <AppProvider>
            <MainLayout />
        </AppProvider>
    );
};

export default _layout;

const MainLayout = () => {
    const { setUserData } = useApp();

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
            console.log("session user:", session?.user?.id);
            if (session) {
                updateUserData(session?.user?.id);
                router.replace("/home");
            } else {
                client.disconnectUser();
                setUserData(null);
                router.replace("/welcome");
            }
        });
    }, []);

    const updateUserData = async (userId) => {
        let res = await getUserData(userId);
        if (res.success) {
            const user = res.data;
            const token = await tokenProvider();
            if (!client.user) {
                await client.connectUser(
                    {
                        id: user.id,
                        name: user.name,
                        image: getUserImageSrc(user.image)?.uri,
                    },
                    token
                );
            }

            setUserData(user);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <OverlayProvider>
                <Chat client={client}>
                    <VideoProvider>
                        <CallProvider>
                            <Stack
                                screenOptions={{
                                    headerShown: false,
                                }}
                            >
                                <Stack.Screen
                                    name="(main)/conversation"
                                    options={{
                                        headerShown: false,
                                    }}
                                />
                                <Stack.Screen
                                    name="(main)/postLikes/[id]"
                                    options={{
                                        presentation: "transparentModal",
                                        animation: "fade",
                                        headerShown: false,
                                    }}
                                />
                                <Stack.Screen
                                    name="(main)/followers/[id]"
                                    options={{
                                        presentation: "transparentModal",
                                        animation: "fade",
                                        headerShown: false,
                                    }}
                                />
                                <Stack.Screen
                                    name="(main)/following/[id]"
                                    options={{
                                        presentation: "transparentModal",
                                        animation: "fade",
                                        headerShown: false,
                                    }}
                                />
                            </Stack>
                        </CallProvider>
                    </VideoProvider>
                </Chat>
            </OverlayProvider>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({});
