"use client";
import { useState, useEffect } from "react";
import MainContainer from "../../../../Components/MainContainer";
import SectionContainer from "../../../../Components/SectionContainer";
import Input from "../../../../Components/Input";
import VoltarButton from "../../../../Components/VoltarButton";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../../../Components/Header";
import LoadingScreen from "../../../../Components/LoadingScreen";
import AuthGuard from "../../../../Components/AuthGuard";

export default function ConvidarJogadoras() {
    const [loading, setLoading] = useState(true);
    const [novaJogadora, setNovaJogadora] = useState({ nomeCompleto: "", pernaDominante: "", posicao: "" });
    const [jogadoras, setJogadoras] = useState([]);
    const router = useRouter();
    const { id } = useParams();
    const links = [
        { label: "Inicio", href: `/inicioposlogin/${id}` },
        { label: "Perfil", href: `/perfil/${id}` },
        { label: "Times", href: `/times/${id}` },
        { label: "Loja", href: `/loja/${id}` },
        { label: "Copas PAB", href: `/copasPab/${id}` },
        { label: "Sair", href: "/" }
    ];

    useEffect(() => {
        setLoading(true);
    const usuarios = typeof window !== "undefined" ? localStorage.getItem("usuarios") : null;
    if (!usuarios) {
            router.replace("/");
            return;
        }
        if (typeof window !== "undefined") {
            setJogadoras(JSON.parse(localStorage.getItem("jogadoras") || "[]"));
        }
        setLoading(false);
    }, [router]);

    const saveJogadoras = (list) => {
        localStorage.setItem("jogadoras", JSON.stringify(list));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNovaJogadora((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddJogadora = (e) => {
        e.preventDefault();
        if (!novaJogadora.nomeCompleto) return;
        const updated = [...jogadoras, novaJogadora];
        setJogadoras(updated);
        saveJogadoras(updated);
        setNovaJogadora({ nomeCompleto: "", pernaDominante: "", posicao: "" });
    };

    const handleRemoveJogadora = (idx) => {
        const updated = jogadoras.filter((_, i) => i !== idx);
        setJogadoras(updated);
        saveJogadoras(updated);
    };

    if (loading) {
        return <LoadingScreen />;
    }
    return (
        <AuthGuard>
            <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
            <MainContainer classeAdicional="md:py-10">
                <SectionContainer tamanho={650}>
                    <div className="h-full min-h-screen sm:min-h-0 sm:h-auto flex flex-col justify-between">
                        <div className="w-full flex justify-end mb-2">
                            <VoltarButton onClick={() => router.back()} />
                        </div>
                        <div className="flex flex-col items-center gap-4 mb-8">
                            <h2 className="text-3xl font-extrabold text-purple drop-shadow mb-2 text-center font-title">Cadastrar Jogadoras</h2>
                            <p className="text-lg text-gray-700 text-center max-w-xl">Adicione as jogadoras do seu time para participar da Copa Passa a Bola! Preencha os dados abaixo e clique em <span className='text-pink font-bold'>Adicionar Jogadora</span>.</p>
                        </div>
                        <form className="flex flex-col gap-5 items-center justify-center bg-white/90 rounded-xl shadow-lg p-6 mb-8 border border-purple/30 max-w-4/5 mx-auto w-full" onSubmit={handleAddJogadora}>
                            <Input
                                type="text"
                                name="nomeCompleto"
                                value={novaJogadora.nomeCompleto}
                                onChange={handleChange}
                                placeholder="Nome completo da jogadora"
                                required
                            />
                            <Input
                                type="text"
                                name="pernaDominante"
                                value={novaJogadora.pernaDominante}
                                onChange={handleChange}
                                placeholder="Perna dominante (ex: Direita, Esquerda)"
                            />
                            <Input
                                type="text"
                                name="posicao"
                                value={novaJogadora.posicao}
                                onChange={handleChange}
                                placeholder="Posição (ex: Atacante, Goleira)"
                            />
                            <button type="submit" className="bg-pink text-white rounded-xl px-6 py-2 font-bold text-base shadow-md transition-colors duration-200 w-full">Adicionar Jogadora</button>
                        </form>
                        <div className="bg-white/80 rounded-2xl shadow-lg p-3 border border-purple/20 max-w-4/5 mx-auto w-full">
                            <h3 className="text-xl font-bold text-purple mb-4 text-center">Jogadoras cadastradas</h3>
                            {jogadoras.length === 0 ? (
                                <p className="text-gray-400 text-center">Nenhuma jogadora cadastrada.</p>
                            ) : (
                                <ul className="flex flex-col gap-4">
                                    {jogadoras.map((j, idx) => (
                                        <li key={idx} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 p-4 bg-purple/10 rounded-xl shadow-md border border-purple/30">
                                            <span className="font-semibold text-lg text-black"><strong className="text-pink">Nome:</strong> {j.nomeCompleto}</span>
                                            <span className="text-md text-gray-700"><strong className="text-purple">Perna dominante:</strong> {j.pernaDominante}</span>
                                            <span className="text-md text-gray-700"><strong className="text-purple">Posição:</strong> {j.posicao}</span>
                                            <button className="text-red-500 font-bold ml-auto hover:underline hover:text-red-700 transition" onClick={() => handleRemoveJogadora(idx)}>Remover</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="w-full flex justify-end mt-8">
                            <Link href={`/times/meutime/${id}`} className="bg-purple hover:bg-pink text-white rounded-xl px-6 py-2 font-bold text-lg shadow-lg text-center transition-colors duration-200">Visualizar Time</Link>
                        </div>
                    </div>
                </SectionContainer>
            </MainContainer>
        </AuthGuard>
    );
}



