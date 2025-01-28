import {
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import Icon from "@/assets/icons";
import { router } from "expo-router";
import Avatar from "@/components/Avatar";
import { useApp } from "@/context/AppContext";
import { removePost } from "@/services/postService";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabase";
import { DELETE, INSERT } from "@/constants/channel";
import useGetPosts from "@/hooks/useGetPosts";
import { PAGE_SIZE_POST } from "@/constants";
import AntDesign from "@expo/vector-icons/AntDesign";

const Home = () => {
    const { posts, setPosts, refreshing, hasMore, getPosts, onRefresh } =
        useGetPosts();

    const { user, channels } = useApp();

    const totalUnread =
        channels.length > 0
            ? channels.reduce((sum, channel) => {
                  return sum + channel.countUnread();
              }, 0)
            : 0;

    const handleListenPost = (payload) => {
        if (payload.eventType === DELETE) {
            setPosts((prevPosts) => {
                let newPosts = prevPosts.filter((p) => p.id != payload.old.id);
                return newPosts;
            });
        }
    };

    const handleListenComment = (payload) => {
        if (payload.eventType === INSERT) {
            setPosts((prevPosts) => {
                let newPosts = prevPosts.map((p) => {
                    if (p.id == payload.new.postId) {
                        p.comments = [payload.new, ...p.comments];
                    }
                    return p;
                });
                return newPosts;
            });
        } else if (payload.eventType === DELETE) {
            setPosts((prevPosts) => {
                let newPosts = prevPosts.map((p) => {
                    p.comments = p.comments.filter(
                        (c) => c.id != payload.old.id
                    );
                    return p;
                });
                return newPosts;
            });
        }
    };

    const handleListenPostLike = (payload) => {
        if (payload.eventType === INSERT) {
            setPosts((prevPosts) => {
                let newPosts = prevPosts.map((p) => {
                    if (p.id == payload.new.postId) {
                        p.postLikes = [...p.postLikes, payload.new];
                    }
                    return p;
                });
                return newPosts;
            });
        } else if (payload.eventType === DELETE) {
            setPosts((prevPosts) => {
                let newPosts = prevPosts.map((p) => {
                    p.postLikes = p.postLikes.filter(
                        (pl) => pl.id != payload.old.id
                    );
                    return p;
                });
                return newPosts;
            });
        }
    };

    useEffect(() => {
        let postChannel = supabase
            .channel("posts")
            .on(
                "postgres_changes",
                { event: DELETE, schema: "public", table: "posts" },
                handleListenPost
            )
            .subscribe();
        let commentChannel = supabase
            .channel("comments")
            .on(
                "postgres_changes",
                { event: INSERT, schema: "public", table: "comments" },
                handleListenComment
            )
            .on(
                "postgres_changes",
                { event: DELETE, schema: "public", table: "comments" },
                handleListenComment
            )
            .subscribe();

        let postLikeChannel = supabase
            .channel("postLikes")
            .on(
                "postgres_changes",
                { event: INSERT, schema: "public", table: "postLikes" },
                handleListenPostLike
            )
            .on(
                "postgres_changes",
                { event: DELETE, schema: "public", table: "postLikes" },
                handleListenPostLike
            )
            .subscribe();

        return () => {
            supabase.removeChannel(postChannel);
            supabase.removeChannel(commentChannel);
            supabase.removeChannel(postLikeChannel);
        };
    }, []);

    const onDeletePost = async (item) => {
        let res = await removePost(item?.id);
        if (!res.success) {
            Alert.alert("Delete post", res.msg);
        }
    };

    const onEditPost = (item) => {
        router.push({
            pathname: "newPost",
            params: { ...item },
        });
    };

    return (
        <ScreenWrapper bg="white">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>LinkUp</Text>
                    <View style={styles.icons}>
                        <Pressable onPress={() => router.push("notifications")}>
                            <Icon
                                name={"heart"}
                                size={hp(3.2)}
                                strokeWidth={2}
                                color={theme.colors.text}
                            />
                        </Pressable>
                        <Pressable onPress={() => router.push("newPost")}>
                            <Icon
                                name={"plus"}
                                size={hp(3.2)}
                                strokeWidth={2}
                                color={theme.colors.text}
                            />
                        </Pressable>
                        <Pressable onPress={() => router.push("conversation")}>
                            <View>
                                <AntDesign
                                    name="message1"
                                    size={hp(3.2)}
                                    strokeWidth={2}
                                    color={theme.colors.text}
                                />
                                {totalUnread > 0 && (
                                    <View
                                        style={{
                                            position: "absolute",
                                            right: -5,
                                            backgroundColor: "red",
                                            borderRadius: hp(2) / 2,
                                            color: "white",
                                            width: hp(2),
                                            height: hp(2),
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: hp(1.4),
                                                color: "white",
                                            }}
                                        >
                                            {totalUnread}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                        <Pressable
                            onPress={() => router.push(`profile/${user.id}`)}
                        >
                            <Avatar
                                uri={user?.image}
                                size={hp(4.3)}
                                rounded={theme.radius.sm}
                                style={{ borderWidth: 2 }}
                            />
                        </Pressable>
                    </View>
                </View>
                <FlatList
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    data={posts}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.listStyle}
                    keyExtractor={(item) => item?.id?.toString()}
                    renderItem={({ item }) => (
                        <PostCard
                            item={{
                                ...item,
                                comments: [
                                    {
                                        count: item?.comments?.length,
                                    },
                                ],
                            }}
                            showDelete={item?.userId == user?.id}
                            onDelete={onDeletePost}
                            onEdit={onEditPost}
                        />
                    )}
                    onEndReached={async () => {
                        if (hasMore) await getPosts(PAGE_SIZE_POST);
                    }}
                    onEndReachedThreshold={0}
                    ListFooterComponent={
                        hasMore ? (
                            <View
                                style={{
                                    marginVertical:
                                        posts.length === 0 ? 200 : 30,
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
                                <Text style={styles.noPosts}>
                                    No more posts
                                </Text>
                            </View>
                        )
                    }
                />
            </View>
        </ScreenWrapper>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        marginHorizontal: wp(4),
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(3.2),
        fontWeight: theme.fonts.bold,
    },
    avatarImage: {
        height: hp(4.3),
        width: hp(4.3),
        borderRadius: theme.radius.sm,
        borderCurve: "continuous",
        borderColor: theme.colors.gray,
        borderWidth: 3,
    },
    icons: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 18,
    },
    listStyle: {
        paddingTop: 20,
        paddingHorizontal: wp(4),
    },
    noPosts: {
        fontSize: hp(2),
        textAlign: "center",
        color: theme.colors.text,
    },
    pill: {
        position: "absolute",
        right: -10,
        top: -4,
        height: hp(2.2),
        width: hp(2.2),
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: theme.colors.roseLight,
    },
});
