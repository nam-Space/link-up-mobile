import {
    Alert,
    Image,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { theme } from "@/constants/theme";
import { hp, stripHtmlTags, wp } from "@/helpers/common";
import moment from "moment";
import Avatar from "./Avatar";
import Icon from "@/assets/icons";
import RenderHtml from "react-native-render-html";
import {
    downloadFile,
    getFileUri,
    getSupabaseFileUri,
} from "@/services/imageService";
import { useVideoPlayer, VideoView } from "expo-video";
import { router } from "expo-router";
import { useApp } from "@/context/AppContext";
import { createPostLike, removePostLike } from "@/services/postService";
import Loading from "./Loading";
import Popover from "react-native-popover-view";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const textStyle = {
    color: theme.colors.dark,
    fontSize: hp(1.75),
};

const tagsStyles = {
    div: textStyle,
    p: textStyle,
    il: textStyle,
    h1: {
        color: theme.colors.dark,
    },
    h2: {
        color: theme.colors.dark,
    },
    h3: {
        color: theme.colors.dark,
    },
    h4: {
        color: theme.colors.dark,
    },
    h5: {
        color: theme.colors.dark,
    },
    h6: {
        color: theme.colors.dark,
    },
};

const PostCard = ({
    item,
    hasShadow = true,
    showDelete = false,
    onDelete = () => {},
    onEdit = () => {},
}) => {
    const { user } = useApp();
    const shadowStyles = {
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1,
    };
    const [showThreeDot, setShowThreeDot] = useState(false);
    const [countComment, setCountComment] = useState(0);
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLikes(item?.postLikes);
        setCountComment(item?.comments[0]?.count);
    }, [JSON.stringify(item)]);

    const player = useVideoPlayer(getFileUri(item?.file), (player) => {
        player.loop = true;
    });

    const createdAt = moment(item?.created_at).format("MMM D");

    const openPostDetails = () => {
        router.push(`/postDetail/${item?.id}`);
    };

    const openPostLikes = () => {
        router.push(`/postLikes/${item?.id}`);
    };

    const onLike = async () => {
        if (liked) {
            let updateLikes = likes.filter((like) => like.userId != user?.id);
            setLikes([...updateLikes]);
            let res = await removePostLike(item?.id, user?.id);
            if (!res.success) {
                Alert.alert("Post", "Something went wrong!");
                return;
            }
        } else {
            let data = {
                userId: user?.id,
                postId: item?.id,
            };
            setLikes([...likes, data]);
            let res = await createPostLike(data);
            if (!res.success) {
                Alert.alert("Post", "Something went wrong!");
                return;
            }
        }
    };

    const onShare = async () => {
        let content = { message: stripHtmlTags(item?.body) };
        if (item?.file) {
            setLoading(true);
            let url = await downloadFile(getSupabaseFileUri(item?.file)?.uri);
            content.url = url;
            setLoading(false);
        }
        Share.share(content);
    };

    const handlePostDelete = () => {
        Alert.alert("Confirm", "Are you sure you want to delete?", [
            {
                text: "Cancel",
                onPress: () => {},
                style: "cancel",
            },
            {
                text: "Delete",
                onPress: () => {
                    setShowThreeDot(false);
                    onDelete(item);
                },
                style: "destructive",
            },
        ]);
    };

    const handlePostEdit = () => {
        setShowThreeDot(false);
        onEdit(item);
    };

    const handleReportPost = () => {
        Alert.alert("Notification", "Sorry! This feature is updating");
    };

    const liked = likes?.find((like) => like.userId == user?.id) ? true : false;

    return (
        <View style={[styles.container, hasShadow && shadowStyles]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.push(`profile/${item?.user?.id}`)}
                >
                    <View style={styles.userInfo}>
                        <Avatar
                            size={hp(4.5)}
                            uri={item?.user?.image}
                            rounded={theme.radius.md}
                        />
                        <View style={{ gap: 2 }}>
                            <Text style={styles.username}>
                                {item?.user?.name}
                            </Text>
                            <Text style={styles.postTime}>{createdAt}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <Popover
                    isVisible={showThreeDot}
                    onRequestClose={() => setShowThreeDot(false)}
                    from={
                        <TouchableOpacity onPress={() => setShowThreeDot(true)}>
                            <Icon
                                name="threeDotsHorizontal"
                                size={hp(3.4)}
                                strokeWidth={3}
                                color={theme.colors.text}
                            />
                        </TouchableOpacity>
                    }
                >
                    {showDelete ? (
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={handlePostEdit}>
                                <Icon
                                    name="edit"
                                    size={hp(2.5)}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlePostDelete}>
                                <Icon
                                    name="delete"
                                    size={hp(2.5)}
                                    color={theme.colors.rose}
                                />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={handleReportPost}>
                            <View style={[styles.actions, { gap: 5 }]}>
                                <MaterialIcons
                                    name="report-problem"
                                    size={24}
                                    color="black"
                                />
                                <Text>Report this post</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </Popover>
            </View>
            <View style={styles.content}>
                <View style={styles.postBody}>
                    {item?.body && (
                        <RenderHtml
                            contentWidth={wp(100)}
                            source={{ html: item?.body }}
                            tagsStyles={tagsStyles}
                        />
                    )}
                </View>
                {item?.file && item?.file?.includes("postImages") && (
                    <Image
                        source={getSupabaseFileUri(item?.file)}
                        transition={100}
                        style={styles.postMedia}
                        contentFit="cover"
                    />
                )}
                {item?.file && item?.file?.includes("postVideos") && (
                    <VideoView
                        style={styles.postMedia}
                        player={player}
                        allowsFullscreen
                        allowsPictureInPicture
                    />
                )}
            </View>
            <View style={styles.footer}>
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={onLike}>
                        <Icon
                            name="heart"
                            size={24}
                            fill={liked ? theme.colors.rose : "transparent"}
                            color={
                                liked
                                    ? theme.colors.rose
                                    : theme.colors.textLight
                            }
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={openPostLikes}>
                        <Text style={styles.count}>{likes?.length}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={openPostDetails}>
                        <Icon
                            name="comment"
                            size={24}
                            color={theme.colors.textLight}
                        />
                    </TouchableOpacity>
                    <Text style={styles.count}>{countComment || "0"}</Text>
                </View>
                <View style={styles.footerButton}>
                    {loading ? (
                        <Loading size="small" />
                    ) : (
                        <TouchableOpacity onPress={onShare}>
                            <Icon
                                name="share"
                                size={24}
                                color={theme.colors.textLight}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

export default PostCard;

const styles = StyleSheet.create({
    container: {
        gap: 10,
        marginBottom: 15,
        borderRadius: theme.radius.xxl * 1.1,
        borderCurve: "continuous",
        padding: 10,
        paddingVertical: 12,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: theme.colors.gray,
        shadowColor: "#000",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    username: {
        fontSize: hp(1.7),
        color: theme.colors.textDark,
        fontWeight: theme.fonts.medium,
    },
    postTime: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontWeight: theme.fonts.medium,
    },
    content: {
        gap: 10,
    },
    postMedia: {
        height: hp(40),
        width: "100%",
        borderRadius: theme.radius.xl,
        borderCurve: "continuous",
    },
    postBody: {
        marginLeft: 5,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    footerButton: {
        marginLeft: 5,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 18,
        padding: 10,
    },
    count: {
        color: theme.colors.text,
        fontSize: hp(1.8),
    },
});
