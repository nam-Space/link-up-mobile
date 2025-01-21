
import { useEffect, useRef, useState } from 'react'
import { PAGE_SIZE_FOLLOWER } from '@/constants';
import { fetchFollowers } from '@/services/followService';

const useGetFollowers = (userId) => {
    const limitRef = useRef(0);
    const [followers, setFollowers] = useState([]);
    const [loadingFollowers, setLoadingFollowers] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        getFollowers(PAGE_SIZE_FOLLOWER, userId);
    }, [userId]);

    const getFollowers = async (cnt, uId) => {
        if (userId) {
            limitRef.current += cnt;
            let res = await fetchFollowers(limitRef.current, uId);
            if (res.success) {
                if (followers?.length === res.data.length) setHasMore(false);
                setFollowers(res.data)
            }

        }
    };

    const onRefresh = async () => {
        setHasMore(true);
        setLoadingFollowers(true);
        setFollowers([]);
        limitRef.current = 0;
        await setTimeout(() => {
            setLoadingFollowers(false);
        }, 300);
    };


    return {
        followers,
        setFollowers,
        loadingFollowers,
        setLoadingFollowers,
        hasMore,
        setHasMore,
        getFollowers,
        onRefresh
    }
}

export default useGetFollowers