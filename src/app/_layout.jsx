import { StatusBar, StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
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
            />
        </>
    );
};

export default _layout;

const styles = StyleSheet.create({});
