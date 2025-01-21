
import { useEffect, useRef, useState } from 'react'
import { PAGE_SIZE_FOLLOWING } from '@/constants';
import { fetchFollowing } from '@/services/followService';

const useGetFollowing = (userId) => {
    const limitRef = useRef(0);
    const [following, setFollowing] = useState([]);
    const [loadingFollowing, setLoadingFollowing] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        getFollowing(PAGE_SIZE_FOLLOWING, userId);
    }, [userId]);

    const getFollowing = async (cnt, uId) => {
        if (userId) {
            limitRef.current += cnt;
            let res = await fetchFollowing(limitRef.current, uId);
            if (res.success) {
                if (following?.length === res.data.length) setHasMore(false);
                setFollowing(res.data)
            }

        }
    };

    const onRefresh = async () => {
        setHasMore(true);
        setLoadingFollowing(true);
        setFollowing([]);
        limitRef.current = 0;
        await setTimeout(() => {
            setLoadingFollowing(false);
        }, 300);
    };


    return {
        following,
        setFollowing,
        loadingFollowing,
        setLoadingFollowing,
        hasMore,
        setHasMore,
        getFollowing,
        onRefresh
    }
}

export default useGetFollowing