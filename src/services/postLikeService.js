import { supabase } from "@/lib/supabase"

export const fetchPostLikes = async (limit = 10, postId) => {
    try {
        const { data, error } = await supabase
            .from('postLikes')
            .select(`
                    *,
                    user: users(id, name, image, email, followers:follows!follows_followeeId_fkey(*))
                `)
            .order('created_at', { ascending: false })
            .eq('postId', postId)
            .limit(limit)

        if (error) {
            console.log('fetchPostLikes error: ', error)
            return {
                success: false,
                msg: 'Could not fetch the postLikes'
            }
        }
        return { success: true, data }
    } catch (error) {
        console.log('fetchPostLikes error: ', error)
        return {
            success: false,
            msg: 'Could not fetch the postLikes'
        }
    }
}