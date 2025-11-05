'use client';
import Header from "@/app/Components/Header";
import VoltarButton from "../../../Components/VoltarButton";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import LoadingScreen from "@/app/Components/LoadingScreen";
import AuthGuard from "@/app/Components/AuthGuard";
import { SingleEliminationBracket, Match, SVGViewer } from "@elyasasmad/react-tournament-brackets";
import MainContainer from "@/app/Components/MainContainer";

export default function ChaveamentoPage() {
    const { id: usuarioId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [times, setTimes] = useState([]);
    const [shuffledTeams, setShuffledTeams] = useState([]);
    const [hasRandomized, setHasRandomized] = useState(false);

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
                    const fetchedTeams = data.teams || [];
                    setTimes(fetchedTeams);
                    
                    // Only auto-shuffle if we haven't randomized yet
                    if (!hasRandomized && fetchedTeams.length > 1) {
                        randomizeTeams(fetchedTeams);
                    }
                } else {
                    setTimes([]);
                }
            } catch (error) {
                console.error('Error fetching teams:', error);
                setTimes([]);
            }
            setLoading(false);
        };
        fetchTimes();
    }, [router, hasRandomized]);

    // Fisher-Yates shuffle algorithm for randomizing teams
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Function to randomize teams
    const randomizeTeams = (teamsToShuffle = times) => {
        if (!Array.isArray(teamsToShuffle) || teamsToShuffle.length < 2) {
            return;
        }
        const shuffled = shuffleArray(teamsToShuffle);
        setShuffledTeams(shuffled);
        setHasRandomized(true);
    };

    // Function to generate matches in the format expected by the tournament bracket library
    const generateMatches = (teamsArr) => {
        if (!Array.isArray(teamsArr) || teamsArr.length < 2) return [];

        // Pad teams to next power of 2 for proper bracket structure
        const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(teamsArr.length)));
        const paddedTeams = [...teamsArr];
        
        // Add "bye" teams if needed
        while (paddedTeams.length < nextPowerOf2) {
            paddedTeams.push({
                id: `bye-${paddedTeams.length}`,
                name: "Bye"
            });
        }

        let matches = [];
        let matchId = 1;
        let round = 1;
        let currentTeams = paddedTeams.map((t, idx) => ({
            id: t.id || t._id?.toString() || `team${idx + 1}`,
            name: t.nome || t.name || `Time ${idx + 1}`
        }));
        let prevMatchIds = [];

        // Generate matches round by round
        while (currentTeams.length > 1) {
            let roundMatches = [];
            for (let i = 0; i < currentTeams.length; i += 2) {
                const teamA = currentTeams[i];
                const teamB = currentTeams[i + 1];
                
                roundMatches.push({
                    id: matchId,
                    name: `Rodada ${round} - Jogo ${Math.floor(i / 2) + 1}`,
                    nextMatchId: null, // Will be filled later
                    tournamentRoundText: `Rodada ${round}`,
                    startTime: "",
                    state: "SCHEDULED",
                    participants: [
                        { id: teamA.id, name: teamA.name, resultText: null, isWinner: false },
                        { id: teamB.id, name: teamB.name, resultText: null, isWinner: false }
                    ]
                });
                matchId++;
            }
            matches = matches.concat(roundMatches);
            prevMatchIds.push(roundMatches.map(m => m.id));
            
            // Prepare teams for next round (winners)
            currentTeams = roundMatches.map((m, idx) => ({
                id: `winner-${round}-${idx + 1}`,
                name: `Vencedor ${round}-${idx + 1}`
            }));
            round++;
        }

        // Link matches: set nextMatchId for each match
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
    };

    // Generate brackets from shuffled teams using useMemo
    const brackets = useMemo(() => {
        const teamsToUse = shuffledTeams.length > 0 ? shuffledTeams : times;
        
        if (!Array.isArray(teamsToUse) || teamsToUse.length < 2) {
            return [];
        }

        const bracketGroups = [];
        // Divide teams into groups of up to 16 for manageable brackets
        for (let i = 0; i < teamsToUse.length; i += 16) {
            const group = teamsToUse.slice(i, i + 16);
            const matches = generateMatches(group);
            if (Array.isArray(matches) && matches.length > 0) {
                bracketGroups.push({
                    groupNumber: Math.floor(i / 16) + 1,
                    matches: matches
                });
            }
        }

        return bracketGroups;
    }, [shuffledTeams, times]);

    const links = [
        { label: "Inicio", href: `/inicioposlogin/${usuarioId}` },
        { label: "Perfil", href: `/perfil/${usuarioId}` },
        { label: "Times", href: `/times/${usuarioId}` },
        { label: "Loja", href: `/loja/${usuarioId}` },
        { label: "Copas PAB", href: `/copasPab/${usuarioId}` },
        { label: "Sair", href: "/" }
    ];

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <AuthGuard>
            <style dangerouslySetInnerHTML={{__html: `
                .bracket-container svg {
                    width: 100% !important;
                    height: auto !important;
                    max-width: 100% !important;
                }
                .bracket-container {
                    width: 100% !important;
                    display: block !important;
                }
                .bracket-container > div {
                    width: 100% !important;
                }
                .bracket-container svg > g {
                    transform-origin: center;
                }
            `}} />
            <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
            <MainContainer>
                <div className="min-h-screen w-full flex flex-col items-center px-2 md:px-8 py-6 md:py-10">
                    <div className="w-full max-w-md md:max-w-3xl flex flex-col items-center justify-center gap-2 mb-6 text-center bg-white rounded-2xl shadow-lg p-4 md:p-8 border-2 border-pink-300">
                        <div className="w-full flex justify-end px-2 md:px-4">
                            <VoltarButton onClick={() => router.back()} />
                        </div>
                        <h1 className="text-xl md:text-5xl font-bold mb-2 font-title text-black drop-shadow">
                            Chaveamento
                        </h1>
                        <p className="text-xs md:text-lg font-semibold text-black mb-4">
                            Veja o chaveamento dos times para a Copa Passa Bola!
                        </p>
                        
                        {/* Randomize Button */}
                        {times.length > 1 && (
                            <button
                                onClick={() => randomizeTeams()}
                                className="bg-purple text-white px-6 py-3 rounded-xl font-bold text-sm md:text-base hover:bg-pink transition-colors shadow-lg flex items-center gap-2"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                                </svg>
                                Randomizar Chaveamento
                            </button>
                        )}
                    </div>

                    <div className="w-full flex flex-col items-center gap-4 md:gap-8">
                        {brackets.length === 0 && (
                            <div className="text-center text-red-500 font-semibold p-4 bg-red-50 rounded-xl border border-red-200">
                                {times.length === 0 
                                    ? "Não há times cadastrados para gerar o chaveamento."
                                    : times.length === 1
                                    ? "É necessário pelo menos 2 times para gerar o chaveamento."
                                    : "Carregando chaveamento..."
                                }
                            </div>
                        )}
                        
                        {brackets.map((bracketGroup, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl shadow-lg p-4 md:p-8 w-full max-w-6xl md:max-w-7xl lg:max-w-[95vw] xl:max-w-[98vw] border-2 border-pink-300"
                            >
                                <h2 className="text-base md:text-3xl text-center font-semibold mb-6 md:mb-10 tracking-wide text-purple">
                                    {brackets.length > 1 ? `Chaveamento ${bracketGroup.groupNumber}` : "Chaveamento"}
                                </h2>
                                <div className="w-full overflow-x-auto">
                                    <div className="bracket-container" style={{ 
                                        width: '100%',
                                        minWidth: '1400px',
                                        maxWidth: '100%'
                                    }}>
                                        <SingleEliminationBracket
                                            matches={bracketGroup.matches}
                                            matchComponent={Match}
                                            svgWrapper={SVGViewer}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </MainContainer>
        </AuthGuard>
    );
}

