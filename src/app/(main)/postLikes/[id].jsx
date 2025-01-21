import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import Header from "@/components/Header";
import { hp, wp } from "@/helpers/common";
import Avatar from "@/components/Avatar";
import { theme } from "@/constants/theme";
import Button from "@/components/Button";
import useGetPostLikes from "@/hooks/useGetPostLikes";
import { PAGE_SIZE_POSTLIKE } from "@/constants";
import Loading from "@/components/Loading";
import { useApp } from "@/context/AppContext";
import { createFollow, removeFollow } from "@/services/followService";

const PostLikes = () => {
    const { user: currentUser } = useApp();
    const { id } = useLocalSearchParams();
    const { postLikes, setPostLikes, hasMore, getPostLikes } =
        useGetPostLikes(id);

    const [loadingFollows, setLoadingFollows] = useState(
        Array(postLikes.length).fill(false)
    );

    useEffect(() => {
        setLoadingFollows(Array(postLikes.length).fill(false));
    }, [JSON.stringify(postLikes)]);

    const handleCreateFollow = async (item, index) => {
        setLoadingFollows((prevLoadingFollows) => {
            prevLoadingFollows[index] = true;
            return prevLoadingFollows;
        });
        let res = await createFollow({
            followerId: currentUser?.id,
            followeeId: item?.user?.id,
        });
        setLoadingFollows((prevLoadingFollows) => {
            prevLoadingFollows[index] = false;
            return prevLoadingFollows;
        });
        if (res.success) {
            setPostLikes((prevPostLikes) => {
                const newPostLikes = prevPostLikes.map((postLike) => {
                    if (postLike.id == item.id) {
                        postLike.user.followers = [
                            res.data,
                            ...postLike.user.followers,
                        ];
                    }
                    return postLike;
                });
                return newPostLikes;
            });
        } else {
            Alert.alert("Follow user error", res.msg);
        }
    };

    const handleDeleteFollow = async (item, index) => {
        setLoadingFollows((prevLoadingFollows) => {
            prevLoadingFollows[index] = true;
            return prevLoadingFollows;
        });
        let res = await removeFollow(currentUser?.id, item?.user?.id);
        setLoadingFollows((prevLoadingFollows) => {
            prevLoadingFollows[index] = false;
            return prevLoadingFollows;
        });
        if (res.success) {
            setPostLikes((prevPostLikes) => {
                const newPostLikes = prevPostLikes.map((postLike) => {
                    if (postLike.id == item.id) {
                        postLike.user.followers =
                            postLike.user.followers.filter(
                                (fl) => fl.followerId != currentUser?.id
                            );
                    }
                    return postLike;
                });
                return newPostLikes;
            });
        } else {
            Alert.alert("Unfollow user error", res.msg);
        }
    };

    return (
        <Animated.View
            entering={FadeIn}
            style={{
                flex: 1,
                justifyContent: "flex-end",
                backgroundColor: "#00000040",
            }}
        >
            <Pressable
                onPress={() => router.back()}
                style={StyleSheet.absoluteFill}
            />
            <Animated.View
                entering={SlideInDown}
                style={{
                    height: "80%",
                    width: "100%",
                    backgroundColor: "white",
                }}
            >
                <View style={styles.container}>
                    <Header
                        title={`Post Likes`}
                        textStyle={{ fontSize: hp(2) }}
                        showBackButton={false}
                    />
                    <View
                        style={{
                            borderTopWidth: 0.5,
                            borderColor: theme.colors.gray,
                        }}
                    ></View>
                    {postLikes.length > 0 && (
                        <FlatList
                            data={postLikes}
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={styles.listStyle}
                            keyExtractor={(item) => item?.id?.toString()}
                            renderItem={({ item, index }) => {
                                const checkUserFollow =
                                    item?.user?.followers?.some(
                                        (item) =>
                                            item?.followerId == currentUser?.id
                                    );

                                return (
                                    <TouchableOpacity
                                        onPress={() =>
                                            router.push(
                                                `/profile/${item?.user?.id}`
                                            )
                                        }
                                    >
                                        <View style={styles.userLikes}>
                                            <View style={styles.userInfo}>
                                                <Avatar
                                                    size={hp(4.5)}
                                                    uri={item?.user?.image}
                                                    rounded={theme.radius.md}
                                                />
                                                <View style={{ gap: 2 }}>
                                                    <Text
                                                        style={styles.username}
                                                    >
                                                        {item?.user?.name}
                                                    </Text>
                                                    <Text style={styles.email}>
                                                        {item?.user?.email}
                                                    </Text>
                                                </View>
                                            </View>
                                            {currentUser?.id !=
                                                item?.user?.id &&
                                                (checkUserFollow ? (
                                                    <Button
                                                        loading={
                                                            loadingFollows[
                                                                index
                                                            ]
                                                        }
                                                        onPress={() =>
                                                            handleDeleteFollow(
                                                                item,
                                                                index
                                                            )
                                                        }
                                                        title="Unfollow"
                                                        buttonStyle={{
                                                            borderWidth:
                                                                loadingFollows[
                                                                    index
                                                                ]
                                                                    ? 0
                                                                    : 2,
                                                            backgroundColor:
                                                                "white",
                                                            paddingHorizontal: 10,
                                                            height: hp(4),
                                                        }}
                                                        textStyle={{
                                                            color: theme.colors
                                                                .textDark,
                                                            fontSize: hp(2),
                                                        }}
                                                        hasShadow={false}
                                                    />
                                                ) : (
                                                    <Button
                                                        loading={
                                                            loadingFollows[
                                                                index
                                                            ]
                                                        }
                                                        onPress={() =>
                                                            handleCreateFollow(
                                                                item,
                                                                index
                                                            )
                                                        }
                                                        title="Follow"
                                                        buttonStyle={{
                                                            backgroundColor:
                                                                theme.colors
                                                                    .textDark,
                                                            paddingHorizontal: 10,
                                                            height: hp(4),
                                                        }}
                                                        textStyle={{
                                                            fontSize: hp(2),
                                                        }}
                                                        hasShadow={false}
                                                    />
                                                ))}
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                            onEndReached={() => {
                                if (hasMore)
                                    getPostLikes(PAGE_SIZE_POSTLIKE, id);
                            }}
                            onEndReachedThreshold={0}
                            ListFooterComponent={
                                hasMore ? (
                                    <View
                                        style={{
                                            marginVertical:
                                                postLikes?.length === 0
                                                    ? 200
                                                    : 30,
                                        }}
                                    >
                                        <Loading />
                                    </View>
                                ) : (
                                    <View
                                        style={{
                                            marginVertical: 30,
                                        }}
                                    >
                                        <Text style={styles.noUsers}>
                                            No more users
                                        </Text>
                                    </View>
                                )
                            }
                        />
                    )}
                </View>
            </Animated.View>
        </Animated.View>
    );
};

export default PostLikes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listStyle: {
        paddingHorizontal: wp(4),
    },
    userLikes: {
        paddingVertical: wp(2),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
    email: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontWeight: theme.fonts.medium,
    },
    noUsers: {
        fontSize: hp(2),
        textAlign: "center",
        color: theme.colors.text,
    },
});
