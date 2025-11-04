import React, { useState, useEffect, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/me", {
                    credentials: "include"
                });

                const data = await res.json();

                if (res.ok) {
                    setUser(data.user);                
                }
            } 
            catch (err) {
                console.error(err);
            }
            finally {
                setLoading(false);
            }           
        }

        fetchUser();

    }, []);

    return (
        <UserContext.Provider value={{ user, loading, setUser }}>
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