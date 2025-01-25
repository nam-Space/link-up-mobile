import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React from "react";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import useGetNotifications from "@/hooks/useGetNotifications";
import { useApp } from "@/context/AppContext";
import ScreenWrapper from "@/components/ScreenWrapper";
import { PAGE_SIZE_NOTIFICATION } from "@/constants";
import { router } from "expo-router";
import Loading from "@/components/Loading";
import NotificationItem from "@/components/NotificationItem";
import Header from "@/components/Header";

const Notifications = () => {
    const { user } = useApp();

    const {
        notifications,
        setNotifications,
        loadingNotifications,
        setLoadingNotifications,
        hasMore,
        setHasMore,
        getNotifications,
        onRefresh,
    } = useGetNotifications(user?.id);

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {notifications?.length > 0 && (
                    <FlatList
                        data={notifications}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={styles.listStyle}
                        keyExtractor={(item) => item?.id?.toString()}
                        renderItem={({ item, index }) => {
                            return (
                                <NotificationItem item={item} key={item?.id} />
                            );
                        }}
                        onEndReached={() => {
                            if (hasMore)
                                getNotifications(
                                    PAGE_SIZE_NOTIFICATION,
                                    user?.id
                                );
                        }}
                        ListHeaderComponent={<Header title="Notifications" />}
                        onEndReachedThreshold={0}
                        ListFooterComponent={
                            hasMore ? (
                                <View
                                    style={{
                                        marginVertical:
                                            notifications?.length === 0
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
                                    <Text style={styles.noData}>
                                        No more notifications
                                    </Text>
                                </View>
                            )
                        }
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default Notifications;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(4),
    },
    listStyle: {
        // paddingVertical: 20,
        gap: 10,
    },
    noData: {
        fontSize: hp(1.8),
        fontWeight: theme.fonts.medium,
        color: theme.colors.text,
        textAlign: "center",
    },
});
