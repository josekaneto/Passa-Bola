"use client";
import Header from "../../Components/Header";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "../../Components/LoadingScreen";
import AuthGuard from "../../Components/AuthGuard";
import { useRouter } from "next/navigation";
export default function PaginaUsuario() {
    const [loading, setLoading] = useState(true);
    const { id: usuarioId } = useParams();
    const router = useRouter();

    const handleLogout = () => {
        // Remove o token de autenticação do localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
         // Redireciona para a página inicial
    };
    
    const links = [
        { label: "Inicio", href: `/inicioposlogin/${usuarioId}` },
        { label: "Perfil", href: `/perfil/${usuarioId}` },
        { label: "Times", href: `/times/${usuarioId}` },
        { label: "Loja", href: `/loja/${usuarioId}` },
        { label: "Copas PAB", href: "/copasPab" },
        { label: "Sair", href: "/", onClick: () => handleLogout() }
    ];
    useEffect(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 500);
    }, []);
    if (loading) {
        return <LoadingScreen />;
    }
    
    return (
        <AuthGuard>
            <>
                <section className="w-screen h-screen bg-center bg-no-repeat bg-cover bg-[url(/background2.png)] flex flex-col items-center relative font-corpo">
                    <Header links={links} />

                    <section className="w-full max-w-[80%] flex flex-col justify-start items-start absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 min-h-[400px]">
                        <span className="bg-pink text-white px-3 py-1 rounded-full mb-4 text-sm font-semibold">
                            Bem-vindo de volta!
                        </span>
                        <h1 className="text-5xl font-bold font-title text-white mb-6 w-2/5">
                            Explore as Novidades e Atualizações
                        </h1>
                        <p className="text-lg text-white w-7/12">
                            Descubra as últimas funcionalidades, eventos e ofertas exclusivas disponíveis para você. Aproveite ao máximo sua experiência conosco!
                        </p>
                    </section>
                </section>

                <section className="w-full max-w-[80%] mx-auto my-12 flex flex-col justify-start items-start min-h-[200px]">
                    <span className="bg-pink text-white px-3 py-1 rounded-full mb-4 text-sm font-semibold">
                        Copa PAB 2025
                    </span>
                    <h1 className="text-5xl font-bold font-title text-gray-800 mb-6 w-full">
                        ELAS NO COMANDO: O FUTURO DO FUTEBOL COMEÇA AQUI
                    </h1>
                    <p className="text-lg text-gray-700 w-full">
                        Uma Copa que celebra a garra, o talento e a união das mulheres no futebol.
                        Mais do que partidas, vivemos histórias de superação, força e conquista.
                        Cada jogo é um símbolo de resistência, e cada vitória coletiva ou individual é um passo rumo à igualdade, à inspiração e a um novo capítulo no esporte.
                    </p>
                </section>
            </>
        </AuthGuard>
    );
}