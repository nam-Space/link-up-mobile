import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Button } from "react-native";
import { router } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";

const Home = () => {
    return (
        <ScreenWrapper>
            <Text>Index</Text>
            <Button title="Welcome" onPress={() => router.push("welcome")} />
        </ScreenWrapper>
    );
};

export default Home;

const styles = StyleSheet.create({});
