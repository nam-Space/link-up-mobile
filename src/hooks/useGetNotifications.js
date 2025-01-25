
import { useEffect, useRef, useState } from 'react'
import { PAGE_SIZE_NOTIFICATION } from '@/constants';
import { fetchNotifications } from '@/services/notificationService';

const useGetNotifications = (userId) => {
    const limitRef = useRef(0);
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        getNotifications(PAGE_SIZE_NOTIFICATION, userId);
    }, [userId]);

    const getNotifications = async (cnt, uId) => {
        if (userId) {
            limitRef.current += cnt;
            let res = await fetchNotifications(limitRef.current, uId);
            if (res.success) {
                if (notifications?.length === res.data.length) setHasMore(false);
                setNotifications(res.data)
            }

        }
    };

    const onRefresh = async () => {
        setHasMore(true);
        setLoadingNotifications(true);
        setNotifications([]);
        limitRef.current = 0;
        await setTimeout(() => {
            setLoadingNotifications(false);
        }, 300);
    };


    return {
        notifications,
        setNotifications,
        loadingNotifications,
        setLoadingNotifications,
        hasMore,
        setHasMore,
        getNotifications,
        onRefresh
    }
}

export default useGetNotifications