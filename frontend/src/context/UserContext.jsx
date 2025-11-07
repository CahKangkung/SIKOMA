import React, { useState, useEffect, useContext, createContext } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            // setLoading(true); // optional

            const res = await fetch("http://localhost:8080/api/auth/me", {
                credentials: "include"
            });

            const data = await res.json();

            if (res.ok) {
                setUser(data.user);                
            } else {
                setUser(null);
            }
        } 
        catch (err) {
            console.error("Fetch user error: ", err);
        }
        finally {
            setLoading(false);
        }           
    }

    const clearUser = () => {
        setUser(null);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, setUser, clearUser, refetchUser: fetchUser }}>
            {children}
        </UserContext.Provider>
    );    
}

export function useUser() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUser must be within UserProvider");
    }

    return context;
}