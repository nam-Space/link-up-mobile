import { createContext, useContext, useState } from "react";

const AppContext = createContext()

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const setUserData = userData => {
        setUser({
            ...userData
        })
    }

    return (
        <AppContext.Provider value={{ user, setUserData }}>
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => useContext(AppContext)