import { supabase } from "@/lib/supabase"

export const getAllUserData = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *
            `)

        if (error) {
            console.log('getAllUserData error: ', error)
            return { success: false, msg: error?.message }
        }
        return { success: true, data }
    } catch (error) {
        console.log('getAllUserData error: ', error)
        return { success: false, msg: error.message }
    }
}

export const getUserData = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                following:follows!follows_followerId_fkey(*),
                followers:follows!follows_followeeId_fkey(*)
            `)
            .eq('id', userId)
            .single()

        if (error) {
            console.log('getUser error: ', error)
            return { success: false, msg: error?.message }
        }
        return { success: true, data }
    } catch (error) {
        console.log('getUser error: ', error)
        return { success: false, msg: error.message }
    }
}

export const updateUser = async (userId, data) => {
    try {
        const { error } = await supabase
            .from('users')
            .update({ ...data })
            .eq('id', userId)

        if (error) {
            console.log('updateUser error: ', error)
            return { success: false, msg: error?.message }
        }
        return { success: true, data }
    } catch (error) {
        console.log('updateUser error: ', error)
        return { success: false, msg: error.message }
    }
}