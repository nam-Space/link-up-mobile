import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import Header from "@/components/Header";
import Avatar from "@/components/Avatar";
import { useApp } from "@/context/AppContext";
import RichTextEditor from "@/components/RichTextEditor";
import Icon from "@/assets/icons";
import Button from "@/components/Button";
import * as ImagePicker from "expo-image-picker";
import { getFileType, getFileUri } from "@/services/imageService";
import { useVideoPlayer, VideoView } from "expo-video";
import { createOrUpdatePost } from "@/services/postService";
import { router, useLocalSearchParams } from "expo-router";

const NewPost = () => {
    const post = useLocalSearchParams();
    const { user } = useApp();

    const bodyRef = useRef("");
    const editorRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);

    const player = useVideoPlayer(getFileUri(file), (player) => {
        player.loop = true;
        player.play();
    });

    useEffect(() => {
        if (post && post.id) {
            bodyRef.current = post.body;
            setFile(post.file || null);
            setTimeout(() => {
                editorRef?.current?.setContentHTML(post.body);
            }, 500);
        }
    }, []);

    const onPick = async (isImage) => {
        let mediaConfig = {
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        };
        if (!isImage) {
            mediaConfig = {
                mediaTypes: ["videos"],
                allowsEditing: true,
                legacy: true,
            };
        }
        let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);
        if (!result.canceled) {
            setFile(result.assets[0]);
        }
    };

    const onSubmit = async () => {
        if (!bodyRef.current && !file) {
            Alert.alert("Post", "Please choose an image or add post body");
            return;
        }
        let data = {
            file,
            body: bodyRef.current,
            userId: user?.id,
        };

        if (post && post.id) {
            data.id = post.id;
        }

        setLoading(true);
        let res = await createOrUpdatePost(data);
        setLoading(false);
        if (res.success) {
            setFile(null);
            (bodyRef.current = ""), editorRef.current?.setContentHTML("");
            router.replace("/home");
        }
    };

    return (
        <ScreenWrapper bg="white">
            <View style={styles.container}>
                <Header
                    title={`${post && post.id ? "Update" : "Create"} Post`}
                />
                <ScrollView contentContainerStyle={{ gap: 20 }}>
                    <View style={styles.header}>
                        <Avatar
                            uri={user?.image}
                            size={hp(6.5)}
                            rounded={theme.radius.xl}
                        />
                        <View style={{ gap: 2 }}>
                            <Text style={styles.username}>{user?.name}</Text>
                            <Text style={styles.publicText}>Public</Text>
                        </View>
                    </View>
                    <View style={styles.textEditor}>
                        <RichTextEditor
                            editorRef={editorRef}
                            onChange={(body) => (bodyRef.current = body)}
                        />
                    </View>
                    {file && (
                        <View style={styles.file}>
                            {getFileType(file) == "video" ? (
                                <VideoView
                                    style={{ flex: 1 }}
                                    player={player}
                                    allowsFullscreen
                                    allowsPictureInPicture
                                />
                            ) : (
                                <Image
                                    source={{ uri: getFileUri(file) }}
                                    sizeMode="cover"
                                    style={{ flex: 1 }}
                                />
                            )}
                            <Pressable
                                style={styles.closeIcon}
                                onPress={() => setFile(null)}
                            >
                                <Icon name="delete" size={20} color="white" />
                            </Pressable>
                        </View>
                    )}
                    <View style={styles.media}>
                        <Text style={styles.addImageText}>
                            Add to your post
                        </Text>
                        <View style={styles.mediaIcons}>
                            <TouchableOpacity onPress={() => onPick(true)}>
                                <Icon
                                    name="image"
                                    size={30}
                                    color={theme.colors.dark}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onPick(false)}>
                                <Icon
                                    name="video"
                                    size={33}
                                    color={theme.colors.dark}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
                <Button
                    buttonStyle={{ height: hp(6.2) }}
                    title={post && post.id ? "Update" : "Post"}
                    loading={loading}
                    hasShadow={false}
                    onPress={onSubmit}
                />
            </View>
        </ScreenWrapper>
    );
};

export default NewPost;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 30,
        paddingHorizontal: wp(4),
        gap: 15,
    },
    title: {
        fontSize: hp(2.5),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text,
        textAlign: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    username: {
        fontSize: hp(2.2),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text,
    },
    avatar: {
        height: hp(6.5),
        width: hp(6.5),
        borderRadius: theme.radius.xl,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
    },
    publicText: {
        fontSize: hp(1.7),
        fontWeight: theme.fonts.medium,
        color: theme.colors.textLight,
    },
    textEditor: {
        // marginTop: 10,
    },
    media: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1.5,
        padding: 12,
        paddingHorizontal: 18,
        borderRadius: theme.radius.xl,
        borderCurve: "continuous",
        borderColor: theme.colors.gray,
    },
    mediaIcons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    addImageText: {
        fontSize: hp(1.9),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text,
    },
    imageIcon: {
        borderRadius: theme.radius.md,
    },
    file: {
        height: hp(30),
        width: "100%",
        borderRadius: theme.radius.xl,
        overflow: "hidden",
        borderCurve: "continuous",
    },
    video: {},
    closeIcon: {
        position: "absolute",
        top: 10,
        right: 10,
        padding: 7,
        borderRadius: 50,
        backgroundColor: "rgba(255,0,0,0.6)",
    },
});
