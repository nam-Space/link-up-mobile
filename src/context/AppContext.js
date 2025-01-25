import { supabase } from "@/lib/supabase";
import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext()

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const setUserData = userData => {
        setUser({
            ...userData
        })
    }

    useEffect(() => {
        // const channel = supabase.channel('tracking1')
        // channel
        //     .on('presence', { event: 'join' }, ({ newPresences }) => {
        //         console.log('Newly joined presences: ', newPresences)
        //     })
        //     .subscribe(async (status) => {
        //         if (status === 'SUBSCRIBED') {
        //             await channel.track({ online_at: new Date().toISOString(), userId: user?.id })
        //         }
        //     })

        // const channel2 = supabase.channel('tracking2')
        // channel2
        //     .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        //         console.log('Newly left presences: ', leftPresences)
        //     })
        //     .subscribe(async (status) => {
        //         if (status === 'SUBSCRIBED') {
        //             // await channel2.track({ online_at: new Date().toISOString() })
        //             await channel2.untrack()
        //         }
        //     })

        // return () => {
        //     channel.unsubscribe()
        //     channel2.unsubscribe()
        // }
    }, [user?.id])

    return (
        <AppContext.Provider value={{ user, setUser, setUserData }}>
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => useContext(AppContext)