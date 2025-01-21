
import { useEffect, useState } from 'react'
import { fetchPostDetail } from '@/services/postService';
import { getUserData } from '@/services/userService';

const useGetUserDetail = (userId) => {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);

    useEffect(() => {
        getUserDetail(userId);
    }, [userId]);

    const getUserDetail = async (uId) => {
        if (userId) {
            setLoadingUser(true);
            let res = await getUserData(uId);
            setLoadingUser(false);
            if (res.success) {
                setUser(res.data)
            }
        }
    };

    return {
        user,
        setUser,
        loadingUser,
        setLoadingUser,
        getUserDetail,
    }
}

export default useGetUserDetail