import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import NotificationBell from "./NotificationBell";

export default function AuthGuard({ children }) {
    const router = useRouter();
    const params = useParams();
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (!authToken) {
            router.replace("/");
            return;
        }

        // Get userId from params or localStorage
        const idFromParams = params?.id;
        const idFromStorage = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
        
        if (idFromParams) {
            setUserId(idFromParams);
        } else if (idFromStorage) {
            setUserId(idFromStorage);
        } else {
            // Try to fetch user ID from API
            fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.user && data.user.id) {
                    setUserId(data.user.id);
                    if (typeof window !== "undefined") {
                        localStorage.setItem("user_id", data.user.id);
                    }
                }
            })
            .catch(err => console.error('Error fetching user ID:', err));
        }
    }, [router, params]);

    return (
        <>
            {userId && <NotificationBell userId={userId} />}
            {children}
        </>
    );
}
