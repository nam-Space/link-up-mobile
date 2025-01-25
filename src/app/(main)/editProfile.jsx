import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import Header from "@/components/Header";
import { Image } from "expo-image";
import { useApp } from "@/context/AppContext";
import { getUserImageSrc, uploadFile } from "@/services/imageService";
import Icon from "@/assets/icons";
import Input from "@/components/input";
import Button from "@/components/Button";
import { updateUser } from "@/services/userService";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const EditProfile = () => {
    const { user: currentUser, setUserData } = useApp();

    const [user, setUser] = useState({
        name: "",
        phoneNumber: "",
        image: null,
        bio: "",
        address: "",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setUser({
                name: currentUser.name,
                phoneNumber: currentUser.phoneNumber,
                image: currentUser.image,
                address: currentUser.address,
                bio: currentUser.bio,
            });
        }
    }, [currentUser]);

    const onPickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setUser({ ...user, image: result.assets[0] });
        }
    };

    const onSubmit = async () => {
        let { name, phoneNumber, image, bio, address } = user;
        if (!name || !phoneNumber || !address || !bio) {
            Alert.alert("Profile", "Please fill all the fileds");
            return;
        }
        setLoading(true);

        if (typeof image == "object") {
            let imageRes = await uploadFile("profiles", image?.uri, true);
            if (imageRes.success) {
                user.image = imageRes.data;
            } else {
                Alert.alert("Submit", imageRes.msg);
                return;
            }
        }

        const res = await updateUser(currentUser?.id, user);
        setLoading(false);

        if (res.success) {
            setUserData({ ...currentUser, ...user });
            router.back();
        }
    };

    let imageSource =
        user.image && typeof user.image == "object"
            ? user.image.uri
            : getUserImageSrc(user?.image);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView style={{ flex: 1 }}>
                <ScreenWrapper>
                    <View style={styles.container}>
                        <Header title={"Edit Profile"} />
                        <View style={styles.form}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={imageSource}
                                    style={styles.avatar}
                                />
                                <Pressable
                                    style={styles.cameraIcon}
                                    onPress={onPickImage}
                                >
                                    <Icon
                                        name="camera"
                                        size={20}
                                        strokeWidth={2.5}
                                    />
                                </Pressable>
                            </View>
                            <Text
                                style={{
                                    fontSize: hp(1.5),
                                    color: theme.colors.text,
                                }}
                            >
                                Please fill your profile details
                            </Text>
                            <Input
                                icon={<Icon name="user" />}
                                placeholder="Enter your name"
                                value={user.name}
                                onChangeText={(val) =>
                                    setUser({ ...user, name: val })
                                }
                            />
                            <Input
                                icon={<Icon name="call" />}
                                placeholder="Enter your phone number"
                                value={user.phoneNumber}
                                onChangeText={(val) =>
                                    setUser({ ...user, phoneNumber: val })
                                }
                            />
                            <Input
                                icon={<Icon name="location" />}
                                placeholder="Enter your address"
                                value={user.address}
                                onChangeText={(val) =>
                                    setUser({ ...user, address: val })
                                }
                            />
                            <Input
                                placeholder="Enter your bio"
                                value={user.bio}
                                multiline={true}
                                containerStyle={styles.bio}
                                onChangeText={(val) =>
                                    setUser({ ...user, bio: val })
                                }
                            />
                            <Button
                                title="Update"
                                loading={loading}
                                onPress={onSubmit}
                            />
                        </View>
                    </View>
                </ScreenWrapper>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(4),
    },
    avatarContainer: {
        height: hp(14),
        width: hp(14),
        alignSelf: "center",
    },
    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: theme.radius.xxl * 1.8,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: theme.colors.darkLight,
    },
    cameraIcon: {
        position: "absolute",
        bottom: 0,
        right: -10,
        padding: 8,
        borderRadius: 50,
        backgroundColor: "white",
        shadowColor: theme.colors.textLight,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 7,
    },
    form: {
        gap: 18,
        marginTop: 20,
    },
    input: {
        flexDirection: "row",
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: theme.radius.xxl,
        borderCurve: "continuous",
        padding: 17,
        paddingHorizontal: 20,
        gap: 15,
    },
    bio: {
        flexDirection: "row",
        height: hp(15),
        alignItems: "flex-start",
        paddingVertical: 15,
    },
});
