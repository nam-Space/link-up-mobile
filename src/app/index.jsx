import { StyleSheet, View } from "react-native";
import React from "react";
import Loading from "@/components/Loading";

const LoadingPage = () => {
    return (
        <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
            <Loading />
        </View>
    );
};

export default LoadingPage;

const styles = StyleSheet.create({});
