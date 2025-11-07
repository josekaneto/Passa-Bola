'use client';

import Header from "@/app/Components/Header";
import TimeCard from "../../Components/TimeCard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "@/app/Components/LoadingScreen";
import AuthGuard from "@/app/Components/AuthGuard";
import PageBanner from "@/app/Components/PageBanner";

export default function PaginaUsuario() {

    const { id: usuarioId } = useParams();
    const router = useRouter();
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
    const [myTeamId, setMyTeamId] = useState(null);

    // Função para mascarar descrição por caracteres
    function mascaraDescricao(descricao) {
        if (!descricao) return "";
        const limite = 43; // limite de caracteres
        if (descricao.length > limite) {
            return descricao.slice(0, limite) + "...";
        }
        return descricao;
    }

    useEffect(() => {
        const fetchTimes = async () => {
            setLoading(true);
            const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
            if (!authToken) {
                router.replace("/");
                return;
            }
            try {
                // Fetch user data to get their team
                const userResponse = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    console.log('User data:', userData);
                    
                    // Fetch all teams
                    const response = await fetch('/api/teams', {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Fetched teams:', data.teams);
                        setTimes(data.teams || []);
                        
                        // Find the team where user is captain or member
                        const userTeam = data.teams.find(team => 
                            team.captainId === userData.user.id || 
                            team.members?.some(member => member.userId === userData.user.id)
                        );
                        
                        if (userTeam) {
                            console.log('User team found:', userTeam);
                            setMyTeamId(userTeam.id);
                        } else {
                            console.log('User has no team');
                        }
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.error('Error fetching teams:', errorData);
                        setTimes([]);
                    }
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
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-green-50">
                <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />

                <PageBanner
                    title="Times da Copa PAB"
                    subtitle="Encontre um time ou crie o seu próprio!"
                />

                <div className="w-full max-w-7xl mx-auto px-4 py-10">
                    {/* Cards de Ações Rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" data-aos="fade-up">
                        <Link 
                            href={`/times/cadastrartime/${usuarioId}`}
                            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green/20 hover:border-green hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-green/10 p-3 rounded-xl group-hover:bg-green/20 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-green font-title">Cadastrar Time</h3>
                                    <p className="text-sm text-gray-600">Crie seu próprio time</p>
                                </div>
                            </div>
                        </Link>

                        {myTeamId ? (
                            <Link 
                                href={`/times/meutime/${myTeamId}`}
                                className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink/20 hover:border-pink hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-pink/10 p-3 rounded-xl group-hover:bg-pink/20 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-pink font-title">Meu Time</h3>
                                        <p className="text-sm text-gray-600">Acesse seu time</p>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 opacity-50 cursor-not-allowed">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 p-3 rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-400 font-title">Meu Time</h3>
                                        <p className="text-sm text-gray-500">Você não tem um time</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Link 
                            href={`/times/chaveamento/${usuarioId}`}
                            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple/20 hover:border-purple hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-purple/10 p-3 rounded-xl group-hover:bg-purple/20 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-purple font-title">Chaveamento</h3>
                                    <p className="text-sm text-gray-600">Veja as partidas</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Seção de Times */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple/10" data-aos="fade-up" data-aos-delay="100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h2 className="text-3xl font-bold font-title text-purple">Times Disponíveis</h2>
                            </div>
                            <div className="bg-purple/10 px-4 py-2 rounded-xl">
                                <span className="text-purple font-bold">{times.length} {times.length === 1 ? 'time' : 'times'}</span>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Encontre um time para participar da Copa Passa a Bola! <strong className="text-pink">Identifique-se e solicite a entrada!</strong>
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {times.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                    <div className="bg-gray-100 rounded-full p-6 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum time cadastrado</h3>
                                    <p className="text-gray-500 mb-4">Seja o primeiro a criar um time!</p>
                                    <Link 
                                        href={`/times/cadastrartime/${usuarioId}`}
                                        className="bg-gradient-to-r from-purple to-pink text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                                    >
                                        Criar Meu Time
                                    </Link>
                                </div>
                            ) : (
                                times.map((time, idx) => (
                                    <TimeCard
                                        key={time.id || idx}
                                        nome={time.nome}
                                        descricao={mascaraDescricao(time.descricao)}
                                        imagem={time.imagem ? time.imagem : "/time_padrao.png"}
                                        membros={`${time.memberCount || 0}/${time.maxMembers || 15}`}
                                        link={`/times/meutime/${time.id}`}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}