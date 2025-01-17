import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    VirtualizedList,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
    createComment,
    fetchPostDetail,
    removeComment,
    removePost,
} from "@/services/postService";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import Loading from "@/components/Loading";
import PostCard from "@/components/PostCard";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import Input from "@/components/input";
import Icon from "@/assets/icons";
import CommentItem from "@/components/CommentItem";

const PostDetail = () => {
    const { id } = useLocalSearchParams();
    const { user } = useApp();

    const inputRef = useRef(null);
    const commentRef = useRef("");
    const [loadingPost, setLoadingPost] = useState(false);
    const [loading, setLoading] = useState(false);

    const [post, setPost] = useState(null);

    useEffect(() => {
        getPostDetail();
    }, [id]);

    const getPostDetail = async () => {
        setLoadingPost(true);
        let res = await fetchPostDetail(id);
        setLoadingPost(false);
        if (res.success) setPost(res.data);
    };

    const onNewComment = async () => {
        if (!commentRef.current) return null;
        let data = {
            userId: user?.id,
            postId: id,
            text: commentRef.current,
        };
        setLoading(true);
        let res = await createComment(data);
        setLoading(false);
        if (res.success) {
            setPost({
                ...post,
                comments: [
                    {
                        ...res.data,
                        user: {
                            id: user.id,
                            name: user.name,
                            image: user.image,
                        },
                    },
                    ...post.comments,
                ],
            });
            inputRef?.current?.clear();
            commentRef.current = "";
        } else {
            Alert.alert("Comment", res.msg);
            return;
        }
    };

    const onDeleteComment = async (comment) => {
        let res = await removeComment(comment?.id);
        if (res.success) {
            setPost((prevPost) => {
                let updatedPost = { ...prevPost };
                updatedPost.comments = updatedPost.comments.filter(
                    (c) => c.id != comment.id
                );
                return updatedPost;
            });
        } else {
            Alert.alert("Delete comment error", res.msg);
            return;
        }
    };

    const onDeletePost = async (item) => {
        let res = await removePost(post?.id);
        if (res.success) {
            router.back();
        } else {
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
                    {loadingPost ? (
                        <View
                            style={{
                                marginVertical: 200,
                            }}
                        >
                            <Loading />
                        </View>
                    ) : !post ? (
                        <View
                            style={[
                                styles.center,
                                {
                                    justifyContent: "flex-start",
                                    marginTop: 100,
                                },
                            ]}
                        >
                            <Text style={styles.notFound}>Post not found!</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={post?.comments}
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={styles.list}
                            keyExtractor={(item) => item?.id?.toString()}
                            renderItem={({ item, index }) => (
                                <View
                                    style={{ marginTop: index > 0 ? 17 : 15 }}
                                >
                                    <CommentItem
                                        item={item}
                                        canDelete={
                                            user.id === item.userId ||
                                            user.id === post.userId
                                        }
                                        onDelete={() => onDeleteComment(item)}
                                    />
                                </View>
                            )}
                            ListHeaderComponent={
                                <>
                                    <PostCard
                                        item={{
                                            ...post,
                                            comments: [
                                                {
                                                    count: post?.comments
                                                        ?.length,
                                                },
                                            ],
                                        }}
                                        showDelete={post?.userId == user?.id}
                                        onDelete={onDeletePost}
                                        onEdit={onEditPost}
                                    />
                                    <View style={styles.inputContainer}>
                                        <Input
                                            inputRef={inputRef}
                                            placeholder="Type comment..."
                                            onChangeText={(val) =>
                                                (commentRef.current = val)
                                            }
                                            placeholderTextColor={
                                                theme.colors.textLight
                                            }
                                            containerStyle={{
                                                flex: 1,
                                                height: hp(6.2),
                                                borderRadius: theme.radius.xl,
                                            }}
                                        />
                                        {loading ? (
                                            <View style={styles.loading}>
                                                <Loading size="small" />
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.sendIcon}
                                                onPress={onNewComment}
                                            >
                                                <Icon
                                                    name="send"
                                                    color={
                                                        theme.colors.primaryDark
                                                    }
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    {post?.comments?.length === 0 && (
                                        <View
                                            style={{
                                                marginTop: 17,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: theme.colors.text,
                                                    marginLeft: 5,
                                                }}
                                            >
                                                Be first to comment!
                                            </Text>
                                        </View>
                                    )}
                                </>
                            }
                            onEndReached={() => {
                                // if (hasMore) getPosts(5);
                            }}
                            onEndReachedThreshold={0}
                            // ListFooterComponent={
                            //     hasMore ? (
                            //         <View
                            //             style={{
                            //                 marginVertical:
                            //                     posts.length === 0
                            //                         ? 200
                            //                         : 30,
                            //             }}
                            //         >
                            //             <Loading />
                            //         </View>
                            //     ) : (
                            //         <View
                            //             style={{
                            //                 marginVertical: 30,
                            //             }}
                            //         >
                            //             <Text style={styles.noPosts}>
                            //                 No more posts
                            //             </Text>
                            //         </View>
                            //     )
                            // }
                        />
                    )}
                </View>
            </Animated.View>
        </Animated.View>
    );
};

export default PostDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingVertical: wp(7),
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    list: {
        paddingHorizontal: wp(4),
    },
    sendIcon: {
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 0.8,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        borderCurve: "continuous",
        height: hp(5.8),
        width: hp(5.8),
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    notFound: {
        fontSize: hp(2.5),
        color: theme.colors.text,
        fontWeight: theme.fonts.medium,
    },
    loading: {
        height: hp(5.8),
        width: hp(5.8),
        justifyContent: "center",
        alignItems: "center",
        transform: [{ scale: 1.3 }],
    },
});
