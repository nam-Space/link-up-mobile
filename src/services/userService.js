import { supabase } from "@/lib/supabase"

export const getUserData = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select()
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