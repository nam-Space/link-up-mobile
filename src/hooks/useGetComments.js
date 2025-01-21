
import { useEffect, useRef, useState } from 'react'
import { PAGE_SIZE_COMMENT } from '@/constants';
import { fetchComments } from '@/services/commentService';

const useGetComments = (postId) => {
    const limitRef = useRef(0);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        getComments(PAGE_SIZE_COMMENT, postId);
    }, [postId]);

    const getComments = async (cnt, pId) => {
        if (postId) {
            limitRef.current += cnt;
            let res = await fetchComments(limitRef.current, pId);
            if (res.success) {
                if (comments?.length === res.data.length) setHasMore(false);
                setComments(res.data)
            }

        }
    };

    const onRefresh = async () => {
        setHasMore(true);
        setLoadingComments(true);
        setComments([]);
        limitRef.current = 0;
        await setTimeout(() => {
            setLoadingComments(false);
        }, 300);
    };


    return {
        comments,
        setComments,
        loadingComments,
        setLoadingComments,
        hasMore,
        setHasMore,
        getComments,
        onRefresh
    }
}

export default useGetComments