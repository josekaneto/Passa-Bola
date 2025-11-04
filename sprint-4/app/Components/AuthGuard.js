import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AuthGuard({ children }) {
    const router = useRouter();
    const { id: usuarioId } = useParams();

    useEffect(() => {
        const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (!authToken) {
            router.replace("/");
        }
    }, [router, usuarioId]);

    return children;
}
