import { supabase } from "@/lib/supabase"

export const fetchFollowers = async (limit = 10, userId) => {
    try {
        const { data, error } = await supabase
            .from('follows')
            .select(`
                    *,
                    user: followerId(id, name, email, image)
                `)
            .order('created_at', { ascending: false })
            .eq('followeeId', userId)
            .limit(limit)

        if (error) {
            console.log('fetchFollowers error: ', error)
            return {
                success: false,
                msg: 'Could not fetch the followers'
            }
        }
        return { success: true, data }
    } catch (error) {
        console.log('fetchFollowers error: ', error)
        return {
            success: false,
            msg: 'Could not fetch the followers'
        }
    }
}

export const fetchFollowing = async (limit = 10, userId) => {
    try {
        const { data, error } = await supabase
            .from('follows')
            .select(`
                    *,
                    user: followeeId(id, name, email, image)
                `)
            .order('created_at', { ascending: false })
            .eq('followerId', userId)
            .limit(limit)

        if (error) {
            console.log('fetchFollowing error: ', error)
            return {
                success: false,
                msg: 'Could not fetch the following'
            }
        }
        return { success: true, data }
    } catch (error) {
        console.log('fetchFollowing error: ', error)
        return {
            success: false,
            msg: 'Could not fetch the following'
        }
    }
}

export const createFollow = async (follow) => {
    try {
        const { data: dataFetch, error: errorFetch } = await supabase
            .from('follows')
            .select(`
                    *
                `)
            .eq('followerId', follow.followerId)
            .eq('followeeId', follow.followeeId)
            .single()

        if (dataFetch) {
            return {
                success: false,
                msg: 'You already have followed user'
            }
        }

        const { data, error } = await supabase
            .from('follows')
            .insert(follow)
            .select()
            .single()

        if (error) {
            console.log('createFollow error: ', error)
            return {
                success: false,
                msg: 'Could not create the follows'
            }
        }
        return { success: true, data }
    } catch (error) {
        console.log('createFollow error: ', error)
        return {
            success: false,
            msg: 'Could not create the follows'
        }
    }
}

export const removeFollow = async (followerId, followeeId) => {
    try {
        const { data: dataFetch, error: errorFetch } = await supabase
            .from('follows')
            .select(`
                    *
                `)
            .eq('followerId', followerId)
            .eq('followeeId', followeeId)
            .single()

        if (!dataFetch) {
            return {
                success: false,
                msg: 'You already have unfollowed user'
            }
        }

        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('followerId', followerId)
            .eq('followeeId', followeeId)

        if (error) {
            console.log('removeFollow error: ', error)
            return {
                success: false,
                msg: 'Could not remove the follows'
            }
        }
        return { success: true }
    } catch (error) {
        console.log('removeFollow error: ', error)
        return {
            success: false,
            msg: 'Could not remove the follows'
        }
    }
}