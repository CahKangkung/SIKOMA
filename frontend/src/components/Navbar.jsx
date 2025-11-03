import { userEffect, useState } from "react";
import { getCurrentUser } from "../api/authApi";

function Navabr() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        getCurrentUser()
        .then((res) => setUser(res.data.user))
        .catch(() => setUser(null));
    }, []);

    return (
        <nav>
           {user ? <p>Hi, {user.username}</p> : <p>Not logged in</p>}
        </nav>
    );
}