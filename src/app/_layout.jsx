import { StatusBar, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { router, Stack } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";

const _layout = () => {
    return (
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
    );
};

export default _layout;

const MainLayout = () => {
    const { setUserData } = useAuth();

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
            console.log("session user:", session?.user?.id);
            if (session) {
                updateUserData(session?.user?.id);
                router.replace("/home");
            } else {
                setUserData(null);
                router.replace("/welcome");
            }
        });
    }, []);

    const updateUserData = async (userId) => {
        let res = await getUserData(userId);
        if (res.success) setUserData(res.data);
    };

    return (
        <>
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
                    name="(main)/postDetail/[id]"
                    options={{
                        presentation: "transparentModal",
                        animation: "fade",
                        headerShown: false,
                    }}
                />
            </Stack>
        </>
    );
};

const styles = StyleSheet.create({});
