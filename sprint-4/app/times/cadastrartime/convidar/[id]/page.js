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
    return (
        <AuthGuard>
            <CustomAlert 
                show={alert.show} 
                message={alert.message} 
                type={alert.type} 
                onClose={() => setAlert({ show: false, message: "", type: "info" })} 
            />
            <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
            <MainContainer classeAdicional="md:py-10">
                <SectionContainer tamanho={650}>
                    <div className="h-full min-h-screen sm:min-h-0 sm:h-auto flex flex-col justify-between">
                        <div className="w-full flex justify-end mb-2">
                            <VoltarButton onClick={() => router.back()} />
                        </div>
                        <div className="flex flex-col items-center gap-4 mb-8">
                            <h2 className="text-3xl font-extrabold text-purple drop-shadow mb-2 text-center font-title">Convidar Jogadoras</h2>
                            <p className="text-lg text-gray-700 text-center max-w-xl">Convide jogadoras do sistema para seu time! Busque pelo nome e envie convites.</p>
                        </div>

                        {/* Search */}
                        <div className="mb-6 w-full">
                            <Input
                                type="text"
                                name="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar jogadoras pelo nome..."
                                className="w-full"
                            />
                        </div>

                        {/* Available Users List */}
                        <div className="bg-white/90 rounded-xl shadow-lg p-6 mb-8 border border-purple/30 max-w-4/5 mx-auto w-full">
                            <h3 className="text-xl font-bold text-purple mb-4 text-center">Jogadoras Disponíveis</h3>
                            {users.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">
                                    {searchTerm ? 'Nenhuma jogadora encontrada.' : 'Nenhuma jogadora disponível para convite.'}
                                </p>
                            ) : (
                                <ul className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                                    {users.map((user) => (
                                        <li key={user.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-4 bg-purple/10 rounded-xl shadow-md border border-purple/30">
                                            <div className="flex-1 flex flex-col gap-1">
                                                <span className="font-semibold text-lg text-black">{user.nomeCompleto}</span>
                                                {user.posicao && (
                                                    <span className="text-sm text-gray-600">Posição: {user.posicao}</span>
                                                )}
                                                {user.teamId && (
                                                    <span className="text-xs text-orange-600">Já está em um time</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleInviteUser(user.id)}
                                                disabled={sendingInvites[user.id] || !!user.teamId}
                                                className={`px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-colors duration-200 ${
                                                    sendingInvites[user.id]
                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                        : user.teamId
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-pink text-white hover:bg-pink-600'
                                                }`}
                                            >
                                                {sendingInvites[user.id] ? 'Enviando...' : user.teamId ? 'Em outro time' : 'Convidar'}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Current Team Members */}
                        <div className="bg-white/80 rounded-2xl shadow-lg p-3 border border-purple/20 max-w-4/5 mx-auto w-full">
                            <h3 className="text-xl font-bold text-purple mb-4 text-center">Jogadoras do Time</h3>
                            {jogadoras.length === 0 ? (
                                <p className="text-gray-400 text-center">Nenhuma jogadora cadastrada.</p>
                            ) : (
                                <ul className="flex flex-col gap-4">
                                    {jogadoras.map((j, idx) => (
                                        <li key={j.userId || idx} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 p-4 bg-purple/10 rounded-xl shadow-md border border-purple/30">
                                            <span className="font-semibold text-lg text-black"><strong className="text-pink">Nome:</strong> {j.nomeCompleto}</span>
                                            <span className="text-md text-gray-700"><strong className="text-purple">Perna dominante:</strong> {j.pernaDominante || 'N/A'}</span>
                                            <span className="text-md text-gray-700"><strong className="text-purple">Posição:</strong> {j.posicao}</span>
                                            <button className="text-red-500 font-bold ml-auto hover:underline hover:text-red-700 transition" onClick={() => handleRemoveJogadora(j.userId)}>Remover</button>
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
