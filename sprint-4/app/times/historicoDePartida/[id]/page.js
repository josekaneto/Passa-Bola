"use client";
import Header from "@/app/Components/Header";
import Footer from "@/app/Components/Footer";
import PageBanner from "@/app/Components/PageBanner";
import VoltarButton from "@/app/Components/VoltarButton";
import LoadingScreen from "@/app/Components/LoadingScreen";
import AuthGuard from "@/app/Components/AuthGuard";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function HistoricoDePartida() {
    const { id: usuarioId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [partidas, setPartidas] = useState([]);
    const [estatisticasGerais, setEstatisticasGerais] = useState({
        jogos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        golsPro: 0,
        golsContra: 0,
        saldoGols: 0,
        aproveitamento: 0
    });

    const links = [
        { label: "Inicio", href: `/inicioposlogin/${usuarioId}` },
        { label: "Perfil", href: `/perfil/${usuarioId}` },
        { label: "Times", href: `/times/${usuarioId}` },
        { label: "Loja", href: `/loja/${usuarioId}` },
        { label: "Copas PAB", href: `/copasPab/${usuarioId}` },
        { label: "Sair", href: "/" }
    ];

    useEffect(() => {
        const fetchPartidas = async () => {
            setLoading(true);
            const authToken = localStorage.getItem("auth_token");
            
            try {
                const response = await fetch('/api/matches', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const partidasFormatadas = data.matches.map(match => {
                        const isTimeCasa = match.timeCasa === "Dragões FC"; // Ajuste para o time do usuário
                        const golsTime = isTimeCasa ? match.placarCasa : match.placarVisitante;
                        const golsAdversario = isTimeCasa ? match.placarVisitante : match.placarCasa;
                        
                        let resultado;
                        if (golsTime > golsAdversario) resultado = "vitoria";
                        else if (golsTime < golsAdversario) resultado = "derrota";
                        else resultado = "empate";

                        return {
                            id: match._id,
                            data: new Date(match.data).toISOString().split('T')[0],
                            horario: "20:00",
                            local: "Arena Copa PAB",
                            timeCasa: match.timeCasa,
                            timeVisitante: match.timeVisitante,
                            placarCasa: match.placarCasa,
                            placarVisitante: match.placarVisitante,
                            resultado,
                            competicao: match.competicao || "Copa PAB 2024",
                            destaques: [],
                            cartoes: { amarelos: 0, vermelhos: 0 }
                        };
                    });

                    setPartidas(partidasFormatadas);

                    // Calcula estatísticas
                    const stats = {
                        jogos: partidasFormatadas.length,
                        vitorias: partidasFormatadas.filter(p => p.resultado === "vitoria").length,
                        empates: partidasFormatadas.filter(p => p.resultado === "empate").length,
                        derrotas: partidasFormatadas.filter(p => p.resultado === "derrota").length,
                        golsPro: partidasFormatadas.reduce((sum, p) => {
                            const isTimeCasa = p.timeCasa === "Dragões FC";
                            return sum + (isTimeCasa ? p.placarCasa : p.placarVisitante);
                        }, 0),
                        golsContra: partidasFormatadas.reduce((sum, p) => {
                            const isTimeCasa = p.timeCasa === "Dragões FC";
                            return sum + (isTimeCasa ? p.placarVisitante : p.placarCasa);
                        }, 0)
                    };

                    stats.saldoGols = stats.golsPro - stats.golsContra;
                    stats.aproveitamento = stats.jogos > 0 
                        ? Math.round(((stats.vitorias * 3 + stats.empates) / (stats.jogos * 3)) * 100)
                        : 0;

                    setEstatisticasGerais(stats);
                }
            } catch (error) {
                console.error('Erro ao buscar partidas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPartidas();
    }, []);

    const getResultadoColor = (resultado) => {
        switch (resultado) {
            case "vitoria": return "bg-green-100 text-green-800 border-green-300";
            case "empate": return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "derrota": return "bg-red-100 text-red-800 border-red-300";
            default: return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getResultadoIcon = (resultado) => {
        switch (resultado) {
            case "vitoria": return "✓";
            case "empate": return "=";
            case "derrota": return "✗";
            default: return "-";
        }
    };

    if (loading) {
        return <LoadingScreen loading={loading} />;
    }

    return (
        <AuthGuard>
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple/10 via-pink/10 to-purple/10">
                <Header links={links} />
                <PageBanner
                    title="Histórico de Partidas"
                    subtitle="Acompanhe todos os jogos e resultados"
                />

                <main className="flex-1 container mx-auto px-4 py-8">
                    {/* Estatísticas Gerais */}
                    <div className="mb-8" data-aos="fade-up">
                        <h2 className="text-2xl font-bold text-purple mb-4">Estatísticas Gerais</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-md text-center border-2 border-purple/20">
                                <p className="text-3xl font-bold text-purple">{estatisticasGerais.jogos}</p>
                                <p className="text-sm text-gray-600 font-semibold">Jogos</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 shadow-md text-center border-2 border-green-300">
                                <p className="text-3xl font-bold text-green-700">{estatisticasGerais.vitorias}</p>
                                <p className="text-sm text-gray-600 font-semibold">Vitórias</p>
                            </div>
                            <div className="bg-yellow-50 rounded-xl p-4 shadow-md text-center border-2 border-yellow-300">
                                <p className="text-3xl font-bold text-yellow-700">{estatisticasGerais.empates}</p>
                                <p className="text-sm text-gray-600 font-semibold">Empates</p>
                            </div>
                            <div className="bg-red-50 rounded-xl p-4 shadow-md text-center border-2 border-red-300">
                                <p className="text-3xl font-bold text-red-700">{estatisticasGerais.derrotas}</p>
                                <p className="text-sm text-gray-600 font-semibold">Derrotas</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 shadow-md text-center border-2 border-blue-300">
                                <p className="text-3xl font-bold text-blue-700">{estatisticasGerais.golsPro}</p>
                                <p className="text-sm text-gray-600 font-semibold">Gols Pró</p>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4 shadow-md text-center border-2 border-orange-300">
                                <p className="text-3xl font-bold text-orange-700">{estatisticasGerais.golsContra}</p>
                                <p className="text-sm text-gray-600 font-semibold">Gols Contra</p>
                            </div>
                            <div className="bg-indigo-50 rounded-xl p-4 shadow-md text-center border-2 border-indigo-300">
                                <p className="text-3xl font-bold text-indigo-700">{estatisticasGerais.saldoGols > 0 ? '+' : ''}{estatisticasGerais.saldoGols}</p>
                                <p className="text-sm text-gray-600 font-semibold">Saldo</p>
                            </div>
                            <div className="bg-pink-50 rounded-xl p-4 shadow-md text-center border-2 border-pink-300">
                                <p className="text-3xl font-bold text-pink-700">{estatisticasGerais.aproveitamento}%</p>
                                <p className="text-sm text-gray-600 font-semibold">Aproveitamento</p>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Partidas */}
                    <div className="mb-8" data-aos="fade-up" data-aos-delay="100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-purple">Partidas Recentes</h2>
                            <VoltarButton onClick={() => router.back()} />
                        </div>

                        <div className="space-y-4">
                            {partidas.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                    <p className="text-gray-500 text-lg">Nenhuma partida registrada ainda</p>
                                </div>
                            ) : (
                                partidas.map((partida, index) => (
                                    <div
                                        key={partida.id}
                                        className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple/10 hover:border-purple/30 transition-all duration-300 hover:shadow-xl"
                                        data-aos="fade-up"
                                        data-aos-delay={index * 50}
                                    >
                                        {/* Cabeçalho da Partida */}
                                        <div className="flex justify-between items-start mb-4 border-b pb-4">
                                            <div>
                                                <p className="text-sm font-semibold text-purple">{partida.competicao}</p>
                                                <p className="text-xs text-gray-500">
                                                    📅 {new Date(partida.data).toLocaleDateString('pt-BR')} • ⏰ {partida.horario}
                                                </p>
                                                <p className="text-xs text-gray-500">📍 {partida.local}</p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-full border-2 font-bold ${getResultadoColor(partida.resultado)}`}>
                                                {getResultadoIcon(partida.resultado)} {partida.resultado.toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Placar */}
                                        <div className="flex items-center justify-center gap-8 mb-4">
                                            <div className="text-center flex-1">
                                                <p className="font-bold text-lg text-gray-800">{partida.timeCasa}</p>
                                            </div>
                                            <div className="bg-gradient-to-r from-purple to-pink rounded-2xl px-8 py-4 shadow-lg">
                                                <p className="text-4xl font-black text-white">
                                                    {partida.placarCasa} <span className="text-2xl">×</span> {partida.placarVisitante}
                                                </p>
                                            </div>
                                            <div className="text-center flex-1">
                                                <p className="font-bold text-lg text-gray-800">{partida.timeVisitante}</p>
                                            </div>
                                        </div>

                                        {/* Destaques e Cartões */}
                                        <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700 mb-2">⭐ Destaques:</p>
                                                {partida.destaques.length > 0 ? (
                                                    <ul className="text-sm text-gray-600 space-y-1">
                                                        {partida.destaques.map((destaque, i) => (
                                                            <li key={i}>• {destaque}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">Nenhum destaque</p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700 mb-2">🃏 Cartões:</p>
                                                <div className="flex gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-4 h-6 bg-yellow-400 rounded"></span>
                                                        <span className="text-gray-600">{partida.cartoes.amarelos}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-4 h-6 bg-red-500 rounded"></span>
                                                        <span className="text-gray-600">{partida.cartoes.vermelhos}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>

                <Footer links={links}/>
            </div>
        </AuthGuard>
    );
}