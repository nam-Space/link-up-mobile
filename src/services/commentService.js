import { supabase } from "@/lib/supabase"

export const fetchComments = async (limit = 10, postId) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                    *,
                    user: users(id, name, image)
                `)
            .order('created_at', { ascending: false })
            .eq('postId', postId)
            .limit(limit)

        if (error) {
            console.log('fetchComments error: ', error)
            return {
                success: false,
                msg: 'Could not fetch the comments'
            }
        }
        return { success: true, data }
    } catch (error) {
        console.log('fetchComments error: ', error)
        return {
            success: false,
            msg: 'Could not fetch the comments'
        }
    }
}