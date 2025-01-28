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

const _layout = () => {
    return (
        <AppProvider>
            <MainLayout />
        </AppProvider>
    );
};

export default _layout;

const MainLayout = () => {
    const { user, setUserData } = useApp();

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
        if (client.userID) return;

        let res = await getUserData(userId);
        if (res.success) {
            const user = res.data;
            await client.connectUser(
                {
                    id: user.id,
                    name: user.name,
                    image: getUserImageSrc(user.image)?.uri,
                },
                client.devToken(user.id)
            );
            setUserData(user);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <OverlayProvider>
                <Chat client={client}>
                    {/* Ẩn StatusBar */}
                    <StatusBar
                        style="light"
                        translucent={true}
                        backgroundColor="transparent"
                    />
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
                </Chat>
            </OverlayProvider>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({});
