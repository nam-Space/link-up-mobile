import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import BackButton from "@/components/BackButton";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import Input from "@/components/input";
import Icon from "@/assets/icons";
import Button from "@/components/Button";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

const Login = () => {
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert("Login", "Please fill all the fields!");
            return;
        }

        let email = emailRef.current.trim();
        let password = passwordRef.current.trim();

        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);
        if (error) Alert.alert("Login", error.message);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <ScreenWrapper>
                    <StatusBar style="dark" />
                    <View style={styles.container}>
                        <BackButton />
                        <View>
                            <Text style={styles.welcomeText}>Hey,</Text>
                            <Text style={styles.welcomeText}>Welcome Back</Text>
                        </View>
                        <View style={styles.form}>
                            <Text
                                style={{
                                    fontSize: hp(1.5),
                                    color: theme.colors.text,
                                }}
                            >
                                Please login to continue
                            </Text>
                            <Input
                                icon={
                                    <Icon
                                        name="mail"
                                        size={26}
                                        strokeWidth={1.6}
                                    />
                                }
                                placeholder="Enter your email"
                                onChangeText={(val) => (emailRef.current = val)}
                            />
                            <Input
                                icon={
                                    <Icon
                                        name="lock"
                                        size={26}
                                        strokeWidth={1.6}
                                    />
                                }
                                placeholder="Enter your password"
                                secureTextEntry
                                onChangeText={(val) =>
                                    (passwordRef.current = val)
                                }
                            />
                            <Text style={styles.forgotPassword}>
                                Forgot Password?
                            </Text>
                            <Button
                                title="Login"
                                loading={loading}
                                onPress={onSubmit}
                            />
                        </View>
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Don't have an account?
                            </Text>
                            <Pressable
                                onPress={() => router.replace("/signUp")}
                            >
                                <Text
                                    style={[
                                        styles.footerText,
                                        {
                                            color: theme.colors.primaryDark,
                                            fontWeight: theme.fonts.semibold,
                                        },
                                    ]}
                                >
                                    Sign up
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScreenWrapper>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 45,
        paddingHorizontal: wp(5),
    },
    welcomeText: {
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
    },
    form: {
        gap: 25,
    },
    forgotPassword: {
        textAlign: "right",
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
    },
    footerText: {
        textAlign: "center",
        color: theme.colors.text,
        fontSize: hp(1.6),
    },
});
