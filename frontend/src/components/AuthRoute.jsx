import React from "react";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext"; 
import { useNavigate } from "react-router-dom";

function AuthRoute({ children }) {
    const [isAuth, setIsAuth] = useState(null);
    const navigate = useNavigate();
    const [loadingData, setLoadingData] = useState(false);
    // const { user, loading } = useUser();    

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoadingData(true);
                const res = await fetch("http://localhost:8080/api/auth/me", {
                    credentials: "include",
                });

                setIsAuth(res.ok);
            } catch (err) {
                setIsAuth(false);
            } finally {
                setLoadingData(false);
            }
        };

        checkAuth();
    }, []);

    if (loadingData) {        
        return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
            <div className="text-lg text-gray-600 mb-2">Redirect to Home...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#23358B] mx-auto"></div>
            </div>
        </div>
        );
    }

    return isAuth ? children : navigate("/login");
};

export default AuthRoute;