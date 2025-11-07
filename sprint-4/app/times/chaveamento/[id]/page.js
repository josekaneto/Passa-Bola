'use client';
import Header from "@/app/Components/Header";
import VoltarButton from "../../../Components/VoltarButton";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import LoadingScreen from "@/app/Components/LoadingScreen";
import AuthGuard from "@/app/Components/AuthGuard";
import { SingleEliminationBracket, Match, SVGViewer, INITIAL_VALUE } from "@elyasasmad/react-tournament-brackets";
import Footer from "@/app/Components/Footer";
import PageBanner from "@/app/Components/PageBanner";
import CustomAlert from "@/app/Components/CustomAlert";

export default function ChaveamentoPage() {
    const { id: usuarioId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [times, setTimes] = useState([]);
    const [brackets, setBrackets] = useState([]);
    const [alert, setAlert] = useState({ show: false, message: "", type: "info" });
    
    // Estados para o SVGViewer - INICIALIZA CORRETAMENTE
    const [tool, setTool] = useState("none");
    const [value, setValue] = useState(INITIAL_VALUE);

    const links = [
        { label: "Inicio", href: `/inicioposlogin/${usuarioId}` },
        { label: "Perfil", href: `/perfil/${usuarioId}` },
        { label: "Times", href: `/times/${usuarioId}` },
        { label: "Loja", href: `/loja/${usuarioId}` },
        { label: "Copas PAB", href: `/copasPab/${usuarioId}` },
        { label: "Sair", href: "/" }
    ];

    // CORRIGIDO: useEffect separado para inicialização
    useEffect(() => {
        const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (!authToken) {
            router.replace("/");
            return;
        }

        const fetchTimes = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/teams', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const activeTeams = (data.teams || []).filter(team => team.memberCount >= 2);
                    setTimes(activeTeams);
                } else {
                    setTimes([]);
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
                setTimes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTimes();
    }, [router]); // REMOVIDO usuarioId para evitar loop

    // CORRIGIDO: useEffect separado para gerar brackets quando times mudam
    useEffect(() => {
        if (times.length > 0) {
            generateBrackets(times);
        } else {
            setBrackets([]);
        }
    }, [times]); // Só executa quando times muda

    // Função para simular pênaltis
    const simulatePenalties = (team1, team2) => {
        // Cada time cobra 5 pênaltis
        let penaltiesTeam1 = 0;
        let penaltiesTeam2 = 0;

        // Rodada de 5 pênaltis para cada time
        for (let i = 0; i < 5; i++) {
            // 70% de chance de fazer gol em pênalti
            if (Math.random() > 0.3) penaltiesTeam1++;
            if (Math.random() > 0.3) penaltiesTeam2++;
        }

        // Se ainda empatar nos 5 pênaltis, vai para morte súbita
        while (penaltiesTeam1 === penaltiesTeam2) {
            const team1Scores = Math.random() > 0.3;
            const team2Scores = Math.random() > 0.3;

            if (team1Scores) penaltiesTeam1++;
            if (team2Scores) penaltiesTeam2++;
        }

        return {
            team1Penalties: penaltiesTeam1,
            team2Penalties: penaltiesTeam2,
            winner: penaltiesTeam1 > penaltiesTeam2 ? team1 : team2
        };
    };

    // Função para simular partida entre dois times
    const simulateMatch = (team1, team2) => {
        // Verifica se ambos os times existem e não são "A Definir"
        if (!team1 || !team2 || team1.name === "A Definir" || team2.name === "A Definir") {
            return null;
        }

        const score1 = Math.floor(Math.random() * 7); // 0 a 6
        const score2 = Math.floor(Math.random() * 7); // 0 a 6

        // Se empatar, vai para os pênaltis
        if (score1 === score2) {
            const penalties = simulatePenalties(team1, team2);
            return {
                team1Score: score1,
                team2Score: score2,
                team1Penalties: penalties.team1Penalties,
                team2Penalties: penalties.team2Penalties,
                winner: penalties.winner,
                isPenalties: true
            };
        }

        return {
            team1Score: score1,
            team2Score: score2,
            winner: score1 > score2 ? team1 : team2,
            isPenalties: false
        };
    };

    // Função para gerar partidas com simulação
    function generateMatches(timesArr) {
        if (!Array.isArray(timesArr) || timesArr.length < 2) return [];
        
        let matches = [];
        let matchId = 1;
        let round = 1;
        
        // Inicializa os times
        let currentTeams = timesArr.map((t, idx) => ({
            id: t.id || t.nome || `team${idx + 1}`,
            name: t.nome || `Time ${idx + 1}`,
            originalData: t
        }));

        // Completa para potência de 2
        const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(currentTeams.length)));
        while (currentTeams.length < nextPowerOf2) {
            currentTeams.push({ id: `bye${currentTeams.length}`, name: "A Definir" });
        }

        let allRoundsMatchIds = [];

        while (currentTeams.length > 1) {
            let roundMatches = [];
            let winners = [];

            for (let i = 0; i < currentTeams.length; i += 2) {
                const teamA = currentTeams[i];
                const teamB = currentTeams[i + 1];

                // Simula a partida se ambos os times são reais
                const matchResult = simulateMatch(teamA, teamB);
                
                let participants = [];
                let state = "SCHEDULED";
                let matchName = `${getRoundName(round, nextPowerOf2)} - Jogo ${Math.floor(i / 2) + 1}`;
                
                if (matchResult) {
                    // Se foi para os pênaltis
                    if (matchResult.isPenalties) {
                        matchName += ` | Pênaltis: ${matchResult.team1Penalties} x ${matchResult.team2Penalties}`;
                        participants = [
                            { 
                                id: teamA.id, 
                                name: teamA.name,
                                resultText: matchResult.team1Score.toString(),
                                isWinner: matchResult.winner.id === teamA.id,
                                status: matchResult.winner.id === teamA.id ? "PLAYED" : null
                            },
                            { 
                                id: teamB.id, 
                                name: teamB.name,
                                resultText: matchResult.team2Score.toString(),
                                isWinner: matchResult.winner.id === teamB.id,
                                status: matchResult.winner.id === teamB.id ? "PLAYED" : null
                            }
                        ];
                    } else {
                        // Partida normal sem pênaltis
                        participants = [
                            { 
                                id: teamA.id, 
                                name: teamA.name,
                                resultText: matchResult.team1Score.toString(),
                                isWinner: matchResult.winner.id === teamA.id,
                                status: matchResult.winner.id === teamA.id ? "PLAYED" : null
                            },
                            { 
                                id: teamB.id, 
                                name: teamB.name,
                                resultText: matchResult.team2Score.toString(),
                                isWinner: matchResult.winner.id === teamB.id,
                                status: matchResult.winner.id === teamB.id ? "PLAYED" : null
                            }
                        ];
                    }
                    state = "DONE";
                    winners.push(matchResult.winner);
                } else {
                    // Se um dos times é "A Definir", apenas adiciona os participantes
                    participants = [
                        { id: teamA.id, name: teamA.name },
                        { id: teamB.id, name: teamB.name }
                    ];
                    
                    // Se apenas um time é real, ele avança automaticamente
                    if (teamA.name !== "A Definir" && teamB.name === "A Definir") {
                        winners.push(teamA);
                        state = "WALK_OVER";
                    } else if (teamB.name !== "A Definir" && teamA.name === "A Definir") {
                        winners.push(teamB);
                        state = "WALK_OVER";
                    } else {
                        winners.push({ id: `winner${round}-${Math.floor(i / 2) + 1}`, name: "A Definir" });
                    }
                }

                roundMatches.push({
                    id: matchId,
                    name: matchName,
                    nextMatchId: null,
                    tournamentRoundText: getRoundName(round, nextPowerOf2),
                    startTime: "",
                    state: state,
                    participants: participants
                });
                matchId++;
            }

            matches = matches.concat(roundMatches);
            allRoundsMatchIds.push(roundMatches.map(m => m.id));
            currentTeams = winners;
            round++;
        }

        // Preenche nextMatchId
        for (let r = 0; r < allRoundsMatchIds.length - 1; r++) {
            const currRound = allRoundsMatchIds[r];
            const nextRound = allRoundsMatchIds[r + 1];
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

    // Função para obter nome da rodada
    function getRoundName(roundNum, totalTeams) {
        const totalRounds = Math.ceil(Math.log2(totalTeams));
        const teamsInRound = Math.pow(2, totalRounds - roundNum + 1);

        if (teamsInRound === 2) return "Final";
        if (teamsInRound === 4) return "Semifinal";
        if (teamsInRound === 8) return "Quartas de Final";
        if (teamsInRound === 16) return "Oitavas de Final";

        return `Fase de ${teamsInRound}`;
    }

    // Gera brackets dividindo os times em grupos de 8
    function generateBrackets(timesArr) {
        const newBrackets = [];
        if (Array.isArray(timesArr) && timesArr.length > 1) {
            for (let i = 0; i < timesArr.length; i += 8) {
                const group = timesArr.slice(i, i + 8);
                // Só gera bracket se tiver pelo menos 2 times
                if (group.length >= 2) {
                    const matches = generateMatches(group);
                    if (Array.isArray(matches) && matches.length > 0) {
                        newBrackets.push(matches);
                    }
                }
            }
        }
        setBrackets(newBrackets);
    }

    // Função para simular todos os rounds
    const simularTodosRounds = () => {
        setAlert({
            show: true,
            message: 'Simulando todas as partidas...',
            type: 'info'
        });

        setTimeout(() => {
            // CORRIGIDO: Gera novos brackets sem chamar setTimes
            const newBrackets = [];
            if (times.length > 1) {
                for (let i = 0; i < times.length; i += 8) {
                    const group = times.slice(i, i + 8);
                    if (group.length >= 2) {
                        const matches = generateMatches(group);
                        if (Array.isArray(matches) && matches.length > 0) {
                            newBrackets.push(matches);
                        }
                    }
                }
            }
            setBrackets(newBrackets);
            
            setAlert({
                show: true,
                message: 'Simulação concluída com sucesso!',
                type: 'success'
            });
        }, 500);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-green-50">
                <CustomAlert
                    show={alert.show}
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert({ show: false, message: "", type: "info" })}
                />
                <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />

                <PageBanner
                    title="Chaveamento da Copa PAB"
                    subtitle="Acompanhe as partidas e torça pelo seu time!"
                />

                <div className="w-full max-w-[1600px] mx-auto px-4 py-10">
                    {/* Botões de Ação */}
                    <div className="flex justify-between items-center mb-6" data-aos="fade-left">
                        <button
                            onClick={simularTodosRounds}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl px-6 py-3 font-bold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Simular Todos os Rounds
                        </button>
                        <VoltarButton onClick={() => router.back()} />
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" data-aos="fade-up">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple/20">
                            <div className="flex items-center gap-4">
                                <div className="bg-purple/10 p-3 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-semibold">Times Inscritos</p>
                                    <p className="text-3xl font-bold text-purple">{times.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink/20">
                            <div className="flex items-center gap-4">
                                <div className="bg-pink/10 p-3 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-semibold">Total de Chaves</p>
                                    <p className="text-3xl font-bold text-pink">{brackets.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green/20">
                            <div className="flex items-center gap-4">
                                <div className="bg-green/10 p-3 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-semibold">Status</p>
                                    <p className="text-xl font-bold text-green">Em Andamento</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chaveamentos */}
                    <div className="space-y-8">
                        {brackets.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-xl p-12 border-2 border-purple/10 text-center" data-aos="fade-up">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-gray-100 rounded-full p-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-700">Chaveamento não disponível</h3>
                                    <p className="text-gray-600 max-w-md">
                                        Não há times suficientes para gerar o chaveamento. É necessário pelo menos 2 times inscritos com 2 ou mais membros.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            brackets.map((matches, idx) =>
                                Array.isArray(matches) && matches.length > 0 ? (
                                    <div
                                        key={idx}
                                        className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple/10"
                                        data-aos="fade-up"
                                        data-aos-delay={idx * 100}
                                    >
                                        {/* Bracket */}
                                        <div className="w-full overflow-x-auto bg-gradient-to-br from-purple/5 to-pink/5 rounded-2xl p-6">
                                            <div style={{ minWidth: '1400px' }}>
                                                <SingleEliminationBracket
                                                    matches={matches}
                                                    matchComponent={Match}
                                                    svgWrapper={({ children, ...props }) => (
                                                        <SVGViewer 
                                                            {...props}
                                                            background="#ffffff"
                                                            width={1600}
                                                            height={800}
                                                            tool={setTool}
                                                            value={setValue}
                                                            detectWheel={false}
                                                        >
                                                            {children}
                                                        </SVGViewer>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        {/* Legenda */}
                                        <div className="mt-6 bg-gradient-to-r from-purple/10 to-pink/10 rounded-xl p-6 border border-purple/20">
                                            <h4 className="text-lg font-bold text-purple mb-4 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Legenda
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-blue-300 shadow-sm">
                                                    <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0"></div>
                                                    <span className="text-sm text-gray-700 font-semibold">Time Vencedor</span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-yellow-300 shadow-sm">
                                                    <div className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0"></div>
                                                    <span className="text-sm text-gray-700 font-semibold">Time Perdedor</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null
                            )
                        )}
                    </div>
                </div>

                <Footer links={links} />
            </div>
        </AuthGuard>
    );
}