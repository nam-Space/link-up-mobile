import {
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/Header";
import { hp, wp } from "@/helpers/common";
import Icon from "@/assets/icons";
import { theme } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import Button from "@/components/Button";
import Avatar from "@/components/Avatar";
import { removePost } from "@/services/postService";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";
import useGetPosts from "@/hooks/useGetPosts";
import { PAGE_SIZE_POST } from "@/constants";
import useGetUserDetail from "@/hooks/useGetUserDetail";
import { createFollow, removeFollow } from "@/services/followService";
import Popover from "react-native-popover-view";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { DELETE, INSERT, UPDATE } from "@/constants/channel";
import { useChatContext } from "stream-chat-expo";

const Profile = () => {
    const { user: currentUser } = useApp();
    const { id } = useLocalSearchParams();
    const { user, setUser } = useGetUserDetail(id);

    const {
        posts,
        setPosts,
        refreshing,
        setRefreshing,
        hasMore,
        setHasMore,
        getPosts,
        onRefresh,
    } = useGetPosts();

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
            {user && (
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
                            showDelete={item?.userId == currentUser?.id}
                            onDelete={onDeletePost}
                            onEdit={onEditPost}
                        />
                    )}
                    onEndReached={async () => {
                        if (hasMore) await getPosts(PAGE_SIZE_POST, id);
                    }}
                    onEndReachedThreshold={100}
                    ListHeaderComponent={
                        <UserHeader handleLogout={handleLogout} />
                    }
                    ListHeaderComponentStyle={{ marginBottom: 30 }}
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
            )}
        </ScreenWrapper>
    );
};

export default Profile;

const UserHeader = ({ handleLogout }) => {
    const { client } = useChatContext();
    const { user: currentUser, setUser: setCurrentUser } = useApp();
    const { id } = useLocalSearchParams();

    const { user, setUser } = useGetUserDetail(id);
    const [showThreeDot, setShowThreeDot] = useState(false);

    const [loadingFollow, setLoadingFollow] = useState(false);

    const handleListenFollowers = (payload) => {
        if (payload.eventType === INSERT) {
            setUser((prevUser) => {
                let newFollowers = [payload.new, ...prevUser.followers];
                const newUser = { ...prevUser };
                newUser.followers = newFollowers;
                return newUser;
            });
            setCurrentUser((prevUser) => {
                let newFollowing = [payload.new, ...prevUser.following];
                const newUser = { ...prevUser };
                newUser.following = newFollowing;
                return newUser;
            });
        } else if (payload.eventType === DELETE) {
            setUser((prevUser) => {
                const newUser = { ...prevUser };
                newUser.followers = [...newUser.followers].filter((item) => {
                    return item.id != payload.old.id;
                });
                return newUser;
            });
            setCurrentUser((prevUser) => {
                const newUser = { ...prevUser };
                newUser.following = [...newUser.following].filter((item) => {
                    return item.id != payload.old.id;
                });
                return newUser;
            });
        }
    };

    useEffect(() => {
        let followerChannel = supabase
            .channel("follows")
            .on(
                "postgres_changes",
                {
                    event: INSERT,
                    schema: "public",
                    table: "follows",
                    filter: `followeeId=eq.${id}`,
                },
                handleListenFollowers
            )
            .on(
                "postgres_changes",
                {
                    event: DELETE,
                    schema: "public",
                    table: "follows",
                },
                handleListenFollowers
            )
            .subscribe();

        return () => {
            supabase.removeChannel(followerChannel);
        };
    }, [id]);

    useEffect(() => {
        if (currentUser?.id === id) {
            setUser({ ...currentUser });
        }
    }, [currentUser]);

    const handleCreateFollow = async () => {
        setLoadingFollow(true);
        let res = await createFollow({
            followerId: currentUser?.id,
            followeeId: user?.id,
        });
        setLoadingFollow(false);
        if (res.success) {
            // setUser((prevUser) => {
            //     let newFollowers = [res.data, ...prevUser.followers];
            //     prevUser.followers = newFollowers;
            //     return prevUser;
            // });
        } else {
            Alert.alert("Follow user error", res.msg);
        }
    };

    const handleDeleteFollow = async () => {
        setLoadingFollow(true);
        let res = await removeFollow(currentUser?.id, user?.id);
        setLoadingFollow(false);
        if (res.success) {
            // setUser((prevUser) => {
            //     const newUser = { ...prevUser };
            //     newUser.followers = [...newUser.followers].filter((item) => {
            //         return item.followerId != currentUser?.id;
            //     });
            //     return prevUser;
            // });
        } else {
            Alert.alert("Unfollow user error", res.msg);
        }
    };

    const handleReportPost = () => {
        Alert.alert("Notification", "Sorry! This feature is updating");
    };

    const handleNavigateChat = async () => {
        const channel = client.channel("messaging", {
            members: [currentUser?.id, user?.id],
        });
        await channel.watch();
        router.push(`/chat/${channel.cid}`);
    };

    const checkUserFollow = user?.followers?.some(
        (item) => item?.followerId == currentUser?.id
    );

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
                    <Popover
                        isVisible={showThreeDot}
                        onRequestClose={() => setShowThreeDot(false)}
                        from={
                            <TouchableOpacity
                                style={[
                                    styles.logoutButton,
                                    {
                                        backgroundColor: theme.colors.gray,
                                        padding: 2,
                                    },
                                ]}
                                onPress={() => setShowThreeDot(true)}
                            >
                                <Icon
                                    name="threeDotsHorizontal"
                                    size={hp(3.4)}
                                    strokeWidth={3}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
                        }
                    >
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
                    </Popover>
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
                            <TouchableOpacity
                                onPress={() =>
                                    router.push(`/followers/${user?.id}`)
                                }
                            >
                                <Text style={styles.infoFollow}>
                                    {user?.followers?.length} followers
                                </Text>
                            </TouchableOpacity>
                            <Text style={styles.infoText}>|</Text>
                            <TouchableOpacity
                                onPress={() =>
                                    router.push(`/following/${user?.id}`)
                                }
                            >
                                <Text style={styles.infoFollow}>
                                    {user?.following?.length} following
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {currentUser?.id !== user?.id && (
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "center",
                                gap: 15,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                }}
                            >
                                {checkUserFollow ? (
                                    <Button
                                        loading={loadingFollow}
                                        onPress={handleDeleteFollow}
                                        title="Unfollow"
                                        buttonStyle={{
                                            borderWidth: loadingFollow ? 0 : 2,
                                            backgroundColor: "white",
                                            paddingHorizontal: 10,
                                            height: hp(4),
                                        }}
                                        textStyle={{
                                            color: theme.colors.textDark,
                                            fontSize: hp(2),
                                        }}
                                        hasShadow={false}
                                    />
                                ) : (
                                    <Button
                                        loading={loadingFollow}
                                        onPress={handleCreateFollow}
                                        title="Follow"
                                        buttonStyle={{
                                            backgroundColor:
                                                theme.colors.textDark,
                                            paddingHorizontal: 10,
                                            height: hp(4),
                                        }}
                                        textStyle={{
                                            fontSize: hp(2),
                                        }}
                                        hasShadow={false}
                                    />
                                )}
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                }}
                            >
                                <Button
                                    title="Chat"
                                    onPress={() => handleNavigateChat()}
                                    buttonStyle={{
                                        backgroundColor: theme.colors.gray,
                                        paddingHorizontal: 10,
                                        height: hp(4),
                                    }}
                                    textStyle={{
                                        color: theme.colors.textDark,
                                        fontSize: hp(2),
                                    }}
                                    hasShadow={false}
                                />
                            </View>
                        </View>
                    )}

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
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 18,
        padding: 10,
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
