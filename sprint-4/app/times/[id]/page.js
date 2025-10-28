'use client';

import Header from "@/app/Components/Header";
import TimeCard from "../../Components/TimeCard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "@/app/Components/LoadingScreen";
import AuthGuard from "@/app/Components/AuthGuard";


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
    const [jogadoras, setJogadoras] = useState([]);

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
        setLoading(true);
        const usuarios = typeof window !== "undefined" ? localStorage.getItem("usuarios") : null;
        if (!usuarios) {
            router.replace("/");
            return;
        }
        let times = [];
        try {
            times = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("times")) || [] : [];
            if (!Array.isArray(times)) times = [];
        } catch {
            times = [];
        }
        setTimes(times);
        setJogadoras(typeof window !== "undefined" ? JSON.parse(localStorage.getItem("jogadoras") || "[]") : []);
        setLoading(false);
    }, [router]);

    if (loading) {
        return <LoadingScreen />;
    }
    return (
        <AuthGuard>
            <div >
                <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
                {/* <MainContainer>
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
                                            membros={`${jogadoras.length}/15`}
                                            link={`/times/meutime/${time.id}`}
                                        />
                                    ))
                                )}
                            </div>
                        </form>
                    </SectionContainer>
                </MainContainer> */}
            </div>
        </AuthGuard>
    );
}