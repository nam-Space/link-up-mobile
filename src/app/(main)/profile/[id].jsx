import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/Header";
import { hp, wp } from "@/helpers/common";
import Icon from "@/assets/icons";
import { theme } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import Button from "@/components/Button";
import Avatar from "@/components/Avatar";
import { getUserData } from "@/services/userService";

const Profile = () => {
    const onLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert("Sign out", "Error signing out");
        }
    };

    const handleLogout = async () => {
        Alert.alert("Confirm", "Are you sure you want to log out?", [
            {
                text: "Cancel",
                onPress: () => console.log("modal cancelled"),
                style: "cancel",
            },
            {
                text: "Logout",
                onPress: () => onLogout(),
                style: "destructive",
            },
        ]);
    };

    return (
        <ScreenWrapper bg={"white"}>
            <UserHeader handleLogout={handleLogout} />
        </ScreenWrapper>
    );
};

export default Profile;

const UserHeader = ({ handleLogout }) => {
    const { user: currentUser, setAuth } = useAuth();
    const { id } = useLocalSearchParams();

    const [user, setUser] = useState(null);

    const getUserInfo = async (userId) => {
        if (id) {
            let res = await getUserData(userId);
            if (res.success) setUser(res.data);
        }
    };
    useEffect(() => {
        getUserInfo(id);
    }, [id, currentUser]);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "white",
                paddingHorizontal: wp(4),
            }}
        >
            <View>
                <Header title="Profile" mb={30} />
                {currentUser?.id === id ? (
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Icon name={"logout"} color={theme.colors.rose} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.followUnfollow]}
                        onPress={handleLogout}
                    >
                        <Button
                            title="Follow"
                            buttonStyle={{
                                backgroundColor: theme.colors.textDark,
                                paddingHorizontal: 10,
                                height: hp(4),
                            }}
                            hasShadow={false}
                        />
                    </TouchableOpacity>
                    // <TouchableOpacity
                    //     style={[styles.followUnfollow]}
                    //     onPress={handleLogout}
                    // >
                    //     <Button
                    //         title="Unfollow"
                    //         buttonStyle={{
                    //             backgroundColor: theme.colors.textDark,
                    //             borderWidth: 2,
                    //             backgroundColor: "white",
                    //             paddingHorizontal: 10,
                    //             height: hp(4),
                    //         }}
                    //         textStyle={{
                    //             color: theme.colors.textDark,
                    //         }}
                    //         hasShadow={false}
                    //     />
                    // </TouchableOpacity>
                )}
            </View>
            <View style={styles.container}>
                <View style={{ gap: 15 }}>
                    <View style={styles.avatarContainer}>
                        <Avatar
                            uri={user?.image}
                            size={hp(12)}
                            rounded={theme.radius.xxl * 1.4}
                        />
                        {currentUser?.id === id && (
                            <Pressable
                                style={styles.editIcon}
                                onPress={() => router.push("editProfile")}
                            >
                                <Icon
                                    name={"edit"}
                                    strokeWidth={2.5}
                                    size={20}
                                />
                            </Pressable>
                        )}
                    </View>
                    <View style={{ alignItems: "center", gap: 4 }}>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.infoText}>{user?.address}</Text>
                        <View style={{ flexDirection: "row", gap: 15 }}>
                            <Text style={styles.infoFollow}>0 followers</Text>
                            <Text style={styles.infoText}>|</Text>
                            <Text style={styles.infoFollow}>0 following</Text>
                        </View>
                    </View>
                    <View style={{ gap: 10 }}>
                        <View style={styles.info}>
                            <Icon
                                name="mail"
                                size={20}
                                color={theme.colors.textLight}
                            />
                            <Text style={styles.infoText}>{user?.email}</Text>
                        </View>
                        {user?.phoneNumber && (
                            <View style={styles.info}>
                                <Icon
                                    name="call"
                                    size={20}
                                    color={theme.colors.textLight}
                                />
                                <Text style={styles.infoText}>
                                    {user?.phoneNumber}
                                </Text>
                            </View>
                        )}
                        {user?.bio && (
                            <Text style={styles.infoText}>{user?.bio}</Text>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        marginHirizontal: wp(4),
        marginBottom: 20,
    },
    headerShape: {
        width: wp(100),
        height: hp(20),
    },
    avatarContainer: {
        height: hp(12),
        width: hp(12),
        alignSelf: "center",
    },
    editIcon: {
        position: "absolute",
        bottom: 0,
        right: -12,
        padding: 7,
        borderRadius: 50,
        backgroundColor: "white",
        shadowColor: theme.colors.textLight,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 7,
    },
    userName: {
        fontSize: hp(3),
        fontWeight: "500",
        color: theme.colors.textDark,
    },
    info: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    infoText: {
        fontSize: hp(1.6),
        fontWeight: "500",
        color: theme.colors.textLight,
    },
    infoFollow: {
        fontSize: hp(1.6),
        fontWeight: "500",
        color: theme.colors.textDark,
    },
    logoutButton: {
        position: "absolute",
        top: 3,
        right: 0,
        padding: 5,
        borderRadius: theme.radius.sm,
        backgroundColor: "#fee2e2",
    },
    followUnfollow: {
        position: "absolute",
        top: -2,
        right: 0,
        paddingVertical: 5,
        borderRadius: theme.radius.sm,
    },
    listStyle: {
        paddingHorizontal: wp(4),
        paddingBottom: 30,
    },
    noPosts: {
        fontSize: hp(2),
        textAlign: "center",
        color: theme.colors.text,
    },
});
