"use client";
import { useState, useEffect } from "react";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/app/Components/AuthGuard";
import LoadingScreen from "@/app/Components/LoadingScreen";
import Header from "@/app/Components/Header";
import MainContainer from "@/app/Components/MainContainer";
import SectionContainer from "@/app/Components/SectionContainer";
import VoltarButton from "@/app/Components/VoltarButton";
import Input from "@/app/Components/Input";
import CustomAlert from "@/app/Components/CustomAlert";
import PageBanner from "@/app/Components/PageBanner";


export default function ConvidarJogadoras() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [jogadoras, setJogadoras] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [alert, setAlert] = useState({ show: false, message: "", type: "info" });
    const [sendingInvites, setSendingInvites] = useState({});
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
        const fetchData = async () => {
            setLoading(true);
            const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
            if (!authToken) {
                router.replace("/");
                return;
            }
            try {
                // Fetch team members
                const teamResponse = await fetch(`/api/teams/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                if (teamResponse.ok) {
                    const teamData = await teamResponse.json();
                    setJogadoras(teamData.team.members || []);
                }

                // Fetch available users (excluding current team members)
                const usersResponse = await fetch(`/api/users?excludeTeamId=${id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setUsers(usersData.users || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            setLoading(false);
        };
        fetchData();
    }, [router, id]);

    // Debounced search
    useEffect(() => {
        const fetchUsers = async () => {
            const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
            if (!authToken) return;

            try {
                const url = `/api/users?excludeTeamId=${id}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data.users || []);
                }
            } catch (error) {
                console.error('Error searching users:', error);
            }
        };

        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, id]);

    const handleInviteUser = async (userId) => {
        const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (!authToken) return;

        setSendingInvites(prev => ({ ...prev, [userId]: true }));

        try {
            const response = await fetch('/api/invitations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    teamId: id,
                    userId: userId
                })
            });

            if (response.ok) {
                setAlert({ show: true, message: 'Convite enviado com sucesso!', type: 'success' });
                // Remove user from list (they now have a pending invitation)
                setUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                const errorData = await response.json();
                setAlert({ show: true, message: errorData.error || 'Erro ao enviar convite', type: 'error' });
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
            setAlert({ show: true, message: 'Erro ao enviar convite', type: 'error' });
        } finally {
            setSendingInvites(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleRemoveJogadora = async (memberUserId) => {
        const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (!authToken) return;
        
        try {
            const response = await fetch(`/api/teams/${id}/members?memberId=${memberUserId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                const updated = jogadoras.filter((j) => j.userId !== memberUserId);
                setJogadoras(updated);
                setAlert({ show: true, message: 'Jogadora removida com sucesso!', type: 'success' });
            } else {
                const errorData = await response.json();
                setAlert({ show: true, message: errorData.error || 'Erro ao remover jogadora', type: 'error' });
            }
        } catch (error) {
            console.error('Error removing player:', error);
            setAlert({ show: true, message: 'Erro ao remover jogadora', type: 'error' });
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    // Icon Components
    const InviteIcon = () => (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    );

    const SearchIcon = () => (
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );

    const UserIcon = () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );

    const TeamMembersIcon = () => (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );

    return (
        <AuthGuard>
            <CustomAlert 
                show={alert.show} 
                message={alert.message} 
                type={alert.type} 
                onClose={() => setAlert({ show: false, message: "", type: "info" })} 
            />
            <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />

            <PageBanner
                title="Convidar Jogadoras"
                subtitle="Convide jogadoras para seu time e monte o elenco perfeito"
            />
            
            <MainContainer>
                <div className="w-full max-w-7xl mx-auto px-4">
                    {/* Banner Header */}
                    <div className="bg-gradient-to-r from-purple via-pink to-green rounded-2xl p-8 mb-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <InviteIcon />
                                <div>
                                    <h1 className="text-4xl font-bold text-white">Convidar Jogadoras</h1>
                                    <p className="text-white/90 mt-1">Convide jogadoras para seu time</p>
                                </div>
                            </div>
                            <VoltarButton 
                                textColor="text-white" 
                                hoverColor="hover:text-green"
                                onClick={() => router.back()} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Left Side */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Search Box */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <label className="block text-gray-700 font-bold mb-3 text-lg">Buscar Jogadoras</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <SearchIcon />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Digite o nome da jogadora..."
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Available Users List */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-purple flex items-center gap-2">
                                        <UserIcon />
                                        Jogadoras Disponíveis
                                    </h3>
                                    <span className="bg-purple/10 text-purple px-4 py-2 rounded-full font-bold text-sm">
                                        {users.length} {users.length === 1 ? 'jogadora' : 'jogadoras'}
                                    </span>
                                </div>
                                
                                {users.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 mb-3">
                                            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 text-lg">
                                            {searchTerm ? 'Nenhuma jogadora encontrada.' : 'Nenhuma jogadora disponível para convite.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                        {users.map((user) => (
                                            <div 
                                                key={user.id} 
                                                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple/5 to-pink/5 rounded-xl border-2 border-purple/10 hover:border-purple/30 transition-all group"
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="bg-purple/10 p-3 rounded-full group-hover:bg-purple/20 transition-colors">
                                                        <svg className="w-6 h-6 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-lg text-gray-800">{user.nomeCompleto}</h4>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {user.posicao && (
                                                                <span className="text-sm bg-green/10 text-green px-3 py-1 rounded-full font-semibold">
                                                                    {user.posicao}
                                                                </span>
                                                            )}
                                                            {user.teamId && (
                                                                <span className="text-sm bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-semibold">
                                                                    Já está em um time
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleInviteUser(user.id)}
                                                    disabled={sendingInvites[user.id] || !!user.teamId}
                                                    className={`px-6 py-3 rounded-xl font-bold shadow-md transition-all duration-200 flex items-center gap-2 ${
                                                        sendingInvites[user.id]
                                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                                            : user.teamId
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-pink to-purple text-white hover:shadow-lg hover:scale-105'
                                                    }`}
                                                >
                                                    {sendingInvites[user.id] ? (
                                                        <>
                                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Enviando...
                                                        </>
                                                    ) : user.teamId ? (
                                                        'Indisponível'
                                                    ) : (
                                                        <>
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            Convidar
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar - Right Side */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Current Team Members */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-purple flex items-center gap-2">
                                        <TeamMembersIcon />
                                        Membros Atuais
                                    </h3>
                                    <span className="bg-green/10 text-green px-3 py-1.5 rounded-full font-bold text-sm">
                                        {jogadoras.length}
                                    </span>
                                </div>
                                
                                {jogadoras.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 mb-3">
                                            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 text-sm">Nenhuma jogadora no time ainda</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                        {jogadoras.map((j, idx) => (
                                            <div 
                                                key={j.userId || idx} 
                                                className="p-4 bg-green/5 rounded-xl border border-green/20 hover:border-green/40 transition-all group"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-bold text-gray-800 flex-1">{j.nomeCompleto}</h4>
                                                    <button 
                                                        onClick={() => handleRemoveJogadora(j.userId)}
                                                        className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                                                        title="Remover jogadora"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <svg className="w-4 h-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        </svg>
                                                        <span><strong>Posição:</strong> {j.posicao}</span>
                                                    </div>
                                                    {j.pernaDominante && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <svg className="w-4 h-4 text-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            <span><strong>Perna:</strong> {j.pernaDominante}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Button */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <Link 
                                        href={`/times/meutime/${id}`} 
                                        className="w-full bg-gradient-to-r from-purple to-pink hover:from-purple-700 hover:to-pink-600 text-white rounded-xl px-6 py-3 font-bold shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Visualizar Time
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MainContainer>
        </AuthGuard>
    );
}
