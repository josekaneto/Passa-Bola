"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "@/app/Components/LoadingScreen";

export default function LojaPageWithId() {
    const { id } = useParams();
    const router = useRouter();

    useEffect(() => {
        // Redirect to base loja page
        router.replace("/loja");
    }, [router, id]);

    return <LoadingScreen />;
}

