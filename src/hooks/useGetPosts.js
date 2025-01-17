
import { useRef, useState } from 'react'
import { fetchPosts } from '@/services/postService';

const useGetPosts = () => {
    const limitRef = useRef(0);
    const [posts, setPosts] = useState([])
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const getPosts = async (cnt, userId) => {
        limitRef.current += cnt;
        let res = await fetchPosts(limitRef.current, userId);
        if (res.success) {
            if (posts.length === res.data.length) setHasMore(false);
            setPosts(res.data);
        }
    };

    const onRefresh = async () => {
        setHasMore(true);
        setRefreshing(true);
        setPosts([]);
        limitRef.current = 0;
        await setTimeout(() => {
            setRefreshing(false);
        }, 300);
    };


    return {
        posts,
        setPosts,
        refreshing,
        setRefreshing,
        hasMore,
        setHasMore,
        getPosts,
        onRefresh
    }
}

export default useGetPosts