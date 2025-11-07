import React, { useState, useEffect, useContext, createContext } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [currentOrgId, setCurrentOrgId] = useState(() => {
        // ambil dari localStorage kalau ada (persist antar reload)
        return localStorage.getItem("currentOrgId") || null;
    });

    const persistOrg = (orgId) => {
        setCurrentOrgId(orgId);
        if (orgId) localStorage.setItem("currentOrgId", orgId);
        else localStorage.removeItem("currentOrgId");
    };

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
                persistOrg(null);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!user) return;

        // Kalau currentOrgId belum ada, coba infer:
        // 1) user.currentOrganizationId (kalau backend kirim field ini)
        // 2) organisasi pertama dari user.organizations (array of {_id} / string)
        if (!currentOrgId) {
        const fromUserField =
            user.currentOrganizationId ||
            user.lastOrganizationId ||
            null;

        const fromList =
            (Array.isArray(user.organizations) && user.organizations.length > 0
            ? user.organizations[0]?._id || user.organizations[0]
            : null);

        const inferred = fromUserField || fromList || null;
        if (inferred) persistOrg(String(inferred));
        }
    }, [user, currentOrgId]);

    return (
        <UserContext.Provider value={{ 
            user, 
            loading, 
            setUser, 
            clearUser, 
            refetchUser: fetchUser,
            currentOrgId,
            setCurrentOrgId: persistOrg
            }}>
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