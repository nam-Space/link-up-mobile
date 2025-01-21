
import { useEffect, useState } from 'react'
import { fetchPostDetail } from '@/services/postService';

const useGetPostDetail = (postId) => {
    const [post, setPost] = useState(null);
    const [loadingPost, setLoadingPost] = useState(false);

    useEffect(() => {
        getPostDetail(postId);
    }, [postId]);

    const getPostDetail = async (pId) => {
        if (postId) {
            setLoadingPost(true);
            let res = await fetchPostDetail(pId);
            setLoadingPost(false);
            if (res.success) {
                setPost(res.data)
            }
        }
    };

    return {
        post,
        setPost,
        loadingPost,
        setLoadingPost,
        getPostDetail,
    }
}

export default useGetPostDetail