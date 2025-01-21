
import { useEffect, useRef, useState } from 'react'
import { PAGE_SIZE_POSTLIKE } from '@/constants';
import { fetchPostLikes } from '@/services/postLikeService';

const useGetPostLikes = (postId) => {
    const limitRef = useRef(0);
    const [postLikes, setPostLikes] = useState([]);
    const [loadingPostLike, setLoadingPostLike] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        getPostLikes(PAGE_SIZE_POSTLIKE, postId);
    }, [postId]);

    const getPostLikes = async (cnt, pId) => {
        if (postId) {
            limitRef.current += cnt;
            let res = await fetchPostLikes(limitRef.current, pId);
            if (res.success) {
                if (postLikes?.length === res.data.length) setHasMore(false);
                setPostLikes(res.data)
            }

        }
    };

    const onRefresh = async () => {
        setHasMore(true);
        setLoadingPostLike(true);
        setPostLikes([]);
        limitRef.current = 0;
        await setTimeout(() => {
            setLoadingPostLike(false);
        }, 300);
    };


    return {
        postLikes, setPostLikes,
        loadingPostLike, setLoadingPostLike,
        hasMore, setHasMore,
        getPostLikes,
        onRefresh
    }
}

export default useGetPostLikes