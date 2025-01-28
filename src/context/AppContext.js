import { client } from "@/utils/streamChat";
import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext()

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [channels, setChannels] = useState([])

    const setUserData = userData => {
        setUser({
            ...userData
        })
    }

    useEffect(() => {
        const handleGetChannels = async () => {
            if (client?.userID && user?.id) {
                const filter = {
                    type: "messaging",
                    members: { $in: [user?.id] },
                };

                const sort = { last_message_at: -1 };

                const channels = await client.queryChannels(filter, sort, {
                    watch: true, // this is the default
                    state: true,
                });

                setChannels(channels)
            }
        };

        handleGetChannels();

        if (client?.userID) {
            client.on("channel.updated", handleGetChannels);
            client.on("channel.deleted", handleGetChannels);
            client.on("message.new", handleGetChannels);
            client.on("message.read", handleGetChannels);
        }


        return () => {
            if (client?.userID) {
                client.off("channel.updated", handleGetChannels);
                client.off("channel.deleted", handleGetChannels);
                client.off("message.new", handleGetChannels);
                client.off("message.read", handleGetChannels);
            }

        };
    }, [user, client])

    return (
        <AppContext.Provider value={{ user, setUser, setUserData, channels }}>
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => useContext(AppContext)