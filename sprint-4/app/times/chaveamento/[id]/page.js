'use client';
import Header from "../../../Components/Header";
import MainContainer from "../../../Components/MainContainer";
import VoltarButton from "../../../Components/VoltarButton";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import LoadingScreen from "../../../Components/LoadingScreen";
import AuthGuard from "../../../Components/AuthGuard";
import { SingleEliminationBracket, Match, SVGViewer } from "@elyasasmad/react-tournament-brackets";

export default function ChaveamentoPage() {
    const { id: usuarioId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [times, setTimes] = useState([]);

    useEffect(() => {
        setLoading(true);
        const usuarios = typeof window !== "undefined" ? localStorage.getItem("usuarios") : null;
        if (!usuarios) {
            router.replace("/");
            return;
        }
        const timesLocal = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("times") || "[]") : [];
        setTimes(Array.isArray(timesLocal) ? timesLocal : []);
        setLoading(false);
    }, [router]);

    const links = [
        { label: "Inicio", href: `/inicioposlogin/${usuarioId}` },
        { label: "Perfil", href: `/perfil/${usuarioId}` },
        { label: "Times", href: `/times/${usuarioId}` },
        { label: "Loja", href: `/loja/${usuarioId}` },
        { label: "Copas PAB", href: `/copasPab/${usuarioId}` },
        { label: "Sair", href: "/" }
    ];

    // Função para gerar partidas no formato esperado pelo pacote
    function generateMatches(timesArr) {
        if (!Array.isArray(timesArr) || timesArr.length < 2) return [];
        let matches = [];
        let matchId = 1;
        let round = 1;
        let currentTeams = timesArr.map((t, idx) => ({
            id: t.id || t.nome || `team${idx + 1}`,
            name: t.nome || `Time ${idx + 1}`
        }));
        let prevMatchIds = [];

        while (currentTeams.length > 1) {
            let roundMatches = [];
            for (let i = 0; i < currentTeams.length; i += 2) {
                const teamA = currentTeams[i] || { id: `bye${matchId}a`, name: "A Definir" };
                const teamB = currentTeams[i + 1] || { id: `bye${matchId}b`, name: "A Definir" };
                roundMatches.push({
                    id: matchId,
                    name: `Rodada ${round} - Jogo ${Math.floor(i / 2) + 1}`,
                    nextMatchId: null, // será preenchido depois
                    tournamentRoundText: `Rodada ${round}`,
                    startTime: "",
                    state: "SCHEDULED",
                    participants: [
                        { id: teamA.id, name: teamA.name },
                        { id: teamB.id, name: teamB.name }
                    ]
                });
                matchId++;
            }
            matches = matches.concat(roundMatches);
            // Prepara times para próxima rodada (vencedores fictícios)
            currentTeams = roundMatches.map((m, idx) => ({
                id: `winner${round}-${idx + 1}`,
                name: `Vencedor ${round}-${idx + 1}`
            }));
            prevMatchIds.push(roundMatches.map(m => m.id));
            round++;
        }

        // Preenche nextMatchId para cada partida
        for (let r = 0; r < prevMatchIds.length - 1; r++) {
            const currRound = prevMatchIds[r];
            const nextRound = prevMatchIds[r + 1];
            for (let i = 0; i < currRound.length; i++) {
                const nextIdx = Math.floor(i / 2);
                const match = matches.find(m => m.id === currRound[i]);
                if (match && nextRound[nextIdx]) {
                    match.nextMatchId = nextRound[nextIdx];
                }
            }
        }

        return matches;
    }

    // Divide os times em grupos de até 16
    const brackets = [];
    if (Array.isArray(times) && times.length > 1) {
        for (let i = 0; i < times.length; i += 16) {
            const group = times.slice(i, i + 16);
            const matches = generateMatches(group);
            // Só adiciona brackets com pelo menos 1 partida
            if (Array.isArray(matches) && matches.length > 0) {
                brackets.push(matches);
            }
        }
    } else {
        // Exemplo de bracket fictício (apenas se não houver times suficientes)
        const matches = generateMatches([
            { nome: "Time A" }, { nome: "Time B" },
            { nome: "Time C" }, { nome: "Time D" }
        ]);
        brackets.push(matches);
    }

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <AuthGuard>
            <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
            {/* <MainContainer>
                <div className="min-h-screen w-full flex flex-col items-center px-2 md:px-8 py-6 md:py-10">
                    <div className="w-full max-w-xs md:max-w-2xl flex flex-col items-center justify-center gap-2 mb-6 text-center bg-white rounded-2xl shadow-lg p-2 md:p-6 border-2 border-pink-300">
                        <div className="w-full flex justify-end px-2 md:px-4">
                            <VoltarButton onClick={() => router.back()} />
                        </div>
                        <h1 className="text-xl md:text-5xl font-bold mb-2 font-title text-black drop-shadow">Chaveamento</h1>
                        <p className="text-xs md:text-lg font-semibold text-black">Veja o chaveamento dos times para a Copa Passa Bola!</p>
                    </div>
                    <div className="w-full flex flex-col items-center gap-4 md:gap-8">
                        {brackets.length === 0 && (
                            <div className="text-center text-red-500 font-semibold">
                                Não há times suficientes para gerar o chaveamento.
                            </div>
                        )}
                        {brackets.map((matches, idx) =>
                            Array.isArray(matches) && matches.length > 0 ? (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl shadow-lg p-2 md:p-6 w-full max-w-xs md:max-w-xl overflow-x-auto border-2 border-pink-300"
                                    style={{ minWidth: 'fit-content' }}
                                >
                                    <h2 className="text-xs md:text-2xl text-center font-semibold mb-4 md:mb-8 tracking-wide text-purple">Chaveamento {idx + 1}</h2>
                                    <div className="w-full">
                                        <SingleEliminationBracket
                                            matches={matches}
                                            matchComponent={Match}
                                            svgWrapper={SVGViewer}
                                            style={{ width: "100%" }}
                                        />
                                    </div>
                                </div>
                            ) : null
                        )}
                    </div>
                </div>
            </MainContainer> */}
        </AuthGuard>
    );
}
