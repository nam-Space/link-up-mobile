import { supabase } from "@/lib/supabase"
import { uploadFile } from "./imageService"

export const createOrUpdatePost = async (post) => {
    try {
        if (post.file && typeof post.file == 'object') {
            let isImage = post?.file?.type == 'image'
            let folderName = isImage ? 'postImages' : 'postVideos'
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage)
            if (fileResult.success) post.file = fileResult.data
            else return fileResult
        }
        const { data, error } = await supabase
            .from('posts')
            .upsert(post)
            .select()
            .single()

        if (error) {
            console.log('createPost error: ', error)
            return {
                success: false, msg: 'Could not create your post'
            }
        }
        return {
            success: true,
            data
        }

    } catch (error) {
        console.log('createPost error: ', error)
        return {
            success: false,
            msg: 'Could not create your post'
        }
    }
}

export const fetchPosts = async (limit = 10) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                user: users(id, name, image),
                postLikes (*)
            `)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.log('fetchPosts error: ', error)
            return {
                success: false,
                msg: 'Could not fetch the posts'
            }
        }
        return { success: true, data }
    } catch (error) {
        console.log('fetchPosts error: ', error)
        return {
            success: false,
            msg: 'Could not fetch the posts'
        }
    }
}

export const fetchPostDetail = async (postId) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                user: users(id, name, image),
                postLikes (*)
            `)
            .eq('id', postId)
            .single()

        if (error) {
            console.log('fetchPostDetail error: ', error)
            return {
                success: false,
                msg: 'Could not fetch the post detail'
            }
        }
        return { success: true, data }
    } catch (error) {
        console.log('fetchPostDetail error: ', error)
        return {
            success: false,
            msg: 'Could not fetch the post detail'
        }
    }
}

export const createPostLike = async (postLike) => {
    try {
        const { data, error } = await supabase
            .from('postLikes')
            .insert(postLike)
            .select()
            .single()

        if (error) {
            console.log('createPostLike error: ', error)
            return {
                success: false,
                msg: 'Could not create the postLikes'
            }
        }
        return { success: true, data }
    } catch (error) {
        console.log('createPostLike error: ', error)
        return {
            success: false,
            msg: 'Could not create the postLikes'
        }
    }
}

export const removePostLike = async (postId, userId) => {
    try {
        const { error } = await supabase
            .from('postLikes')
            .delete()
            .eq('userId', userId)
            .eq('postId', postId)

        if (error) {
            console.log('removePostLike error: ', error)
            return {
                success: false,
                msg: 'Could not remove the postLikes'
            }
        }
        return { success: true }
    } catch (error) {
        console.log('removePostLike error: ', error)
        return {
            success: false,
            msg: 'Could not remove the postLikes'
        }
    }
}