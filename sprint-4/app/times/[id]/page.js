'use client';

import Header from "@/app/Components/Header";
import TimeCard from "../../Components/TimeCard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "@/app/Components/LoadingScreen";
import AuthGuard from "@/app/Components/AuthGuard";
import MainContainer from "@/app/Components/MainContainer";
import SectionContainer from "@/app/Components/SectionContainer";
export default function PaginaUsuario() {

    const { id: usuarioId } = useParams();
    const links = [
        { label: "Inicio", href: `/inicioposlogin/${usuarioId}` },
        { label: "Perfil", href: `/perfil/${usuarioId}` },
        { label: "Times", href: `/times/${usuarioId}` },
        { label: "Loja", href: `/loja/${usuarioId}` },
        { label: "Copas PAB", href: `/copasPab/${usuarioId}` },
        { label: "Sair", href: "/" }
    ];
    const [loading, setLoading] = useState(true);
    const [times, setTimes] = useState([]);

    // Função para mascarar descrição por caracteres
    function mascaraDescricao(descricao) {
        if (!descricao) return "";
        const limite = 43; // limite de caracteres
        if (descricao.length > limite) {
            return descricao.slice(0, limite) + "...";
        }
        return descricao;
    }

    const router = useRouter();
    useEffect(() => {
        const fetchTimes = async () => {
            setLoading(true);
            const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
            if (!authToken) {
                router.replace("/");
                return;
            }
            try {
                const response = await fetch('/api/teams', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched teams:', data.teams);
                    setTimes(data.teams || []);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Error fetching teams:', errorData);
                    setTimes([]);
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
                setTimes([]);
            }
            setLoading(false);
        };
        fetchTimes();
    }, [router]);

    if (loading) {
        return <LoadingScreen />;
    }
    return (
        <AuthGuard>
            <div >
                <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
                <MainContainer>
                    <SectionContainer tamanho={850}>
                        <div className="w-full flex flex-col items-start justify-center gap-2 mb-6 text-center">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2 font-title">Entrar em um Time</h2>
                            <p>Encontre um time para a Copa Passa Bola! <strong className="text-pink">Se identifiquem e
                                solicite a entrada!</strong></p>
                        </div>
                        <div className="w-full flex flex-col items-end">
                            <Link className="text-green font-semibold" href={`/times/cadastrartime/${usuarioId}`}>Cadastrar um Time</Link>
                            <Link className="text-pink font-semibold" href={`/times/meutime/${usuarioId}`}>Meu Time</Link>
                            <Link className="text-purple font-semibold" href={`/times/chaveamento/${usuarioId}`}>Chaveamento</Link>
                        </div>
                        <hr className="my-6 w-full border-gray-300 rounded-xl" />
                        <form className="w-full" action="">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-7 max-h-[750px] md:max-h-[580px] overflow-auto w-full">
                                {times.length === 0 ? (
                                    <span className="text-gray-500">Nenhum time cadastrado.</span>
                                ) : (
                                    times.map((time, idx) => (
                                        <TimeCard
                                            key={time.id || idx}
                                            nome={time.nome}
                                            descricao={mascaraDescricao(time.descricao)}
                                            imagem={time.imagem ? time.imagem : "/time-feminino.png"}
                                            membros={`${time.memberCount || 0}/${time.maxMembers || 15}`}
                                            link={`/times/meutime/${time.id}`}
                                        />
                                    ))
                                )}
                            </div>
                        </form>
                    </SectionContainer>
                </MainContainer>
            </div>
        </AuthGuard>
    );
}