import { supabase } from "@/lib/supabase"

export const createNotification = async (notification) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert(notification)
            .select()
            .single()

        if (error) {
            console.log('createNotification error: ', error)
            return {
                success: false,
                msg: 'Could not create the notifications'
            }
        }
        return { success: true, data }
    } catch (error) {
        console.log('createNotification error: ', error)
        return {
            success: false,
            msg: 'Could not create the notifications'
        }
    }
}

export const fetchNotifications = async (limit = 10, receiverId) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                    *,
                    sender: senderId(id, name, image)
                `)
            .order('created_at', { ascending: false })
            .eq('receiverId', receiverId)
            .limit(limit)

        if (error) {
            console.log('fetchNotifications error: ', error)
            return {
                success: false,
                msg: 'Could not fetch the notifications'
            }
        }
        return { success: true, data }
    } catch (error) {
        console.log('fetchNotifications error: ', error)
        return {
            success: false,
            msg: 'Could not fetch the notifications'
        }
    }
}