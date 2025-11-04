import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthRoute({ children }) {
    const [isAuth, setIsAuth] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/me", {
                    credentials: "include",
                });

                setIsAuth(res.ok);
            } catch (err) {
                setIsAuth(false);
            }
        };

        checkAuth();
    }, []);

    return isAuth ? children : navigate("/login");
};

export default AuthRoute;