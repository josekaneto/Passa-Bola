'use client';
import React, { useState, useEffect } from 'react';
import LoadingScreen from '@/app/Components/LoadingScreen';
import AuthGuard from '../../../Components/AuthGuard';
import Header from '@/app/Components/Header';
import Input from '../../../Components/Input';
import ColorInput from '../../../Components/ColorInput';
import Link from 'next/link';
import VoltarButton from '../../../Components/VoltarButton';
import { useParams, useRouter } from 'next/navigation';
import MainContainer from '@/app/Components/MainContainer';
import SectionContainer from '@/app/Components/SectionContainer';
import CustomAlert from '@/app/Components/CustomAlert';
import PageBanner from '@/app/Components/PageBanner';
import Footer from '@/app/Components/Footer';


export default function CadastrarTime() {
    const router = useRouter();
    const { id: usuarioId } = useParams();
    const [loading, setLoading] = useState(true);
    const [hasTeam, setHasTeam] = useState(false);
    const links = [
        { label: "Inicio", href: `/inicioposlogin/${usuarioId}` },
        { label: "Perfil", href: `/perfil/${usuarioId}` },
        { label: "Times", href: `/times/${usuarioId}` },
        { label: "Loja", href: `/loja/${usuarioId}` },
        { label: "Copas PAB", href: `/copasPab/${usuarioId}` },
        { label: "Sair", href: "/" }
    ];

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [cor1, setCor1] = useState('#FFFFFF');
    const [cor2, setCor2] = useState('#000000');
    const [imagem, setImagem] = useState(null); // base64
    const [preview, setPreview] = useState('/time_padrao.png'); // Inicializa com imagem padrão
    const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

    const handleNomeChange = (e) => setNome(e.target.value);
    const handleDescricaoChange = (e) => setDescricao(e.target.value);

    // Tratamento do upload de imagem
    const handleImagemChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagem(reader.result);
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Salva time no MongoDB
    const handleSubmit = async (e) => {
        e.preventDefault();
        const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (!authToken) {
            router.replace("/");
            return;
        }
        try {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    nome,
                    descricao,
                    cor1,
                    cor2,
                    imagem: imagem || null // Se não houver imagem, envia null
                })
            });
            if (response.ok) {
                const data = await response.json();
                setAlert({
                    show: true,
                    message: 'Time criado com sucesso!',
                    type: 'success'
                });
                setTimeout(() => {
                    router.push(`/times/meutime/${data.team.id}`);
                }, 1500);
            } else {
                const errorData = await response.json();
                setAlert({ show: true, message: errorData.error || 'Erro ao criar time', type: 'error' });
            }
        } catch (error) {
            console.error('Error creating team:', error);
            setAlert({ show: true, message: 'Erro ao criar time', type: 'error' });
        }
    };

    useEffect(() => {
        const checkUserTeam = async () => {
            setLoading(true);
            const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
            if (!authToken) {
                router.replace("/");
                return;
            }
            try {
                // Get user data
                const userResponse = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    console.log('User data:', userData);

                    // Get all teams
                    const teamsResponse = await fetch('/api/teams', {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });

                    if (teamsResponse.ok) {
                        const teamsData = await teamsResponse.json();
                        console.log('Teams data:', teamsData);

                        // Check if user is captain or member of any team
                        const userTeam = teamsData.teams?.find(team =>
                            team.captainId === userData.user.id ||
                            team.members?.some(member => member.userId === userData.user.id)
                        );

                        if (userTeam) {
                            console.log('User already has a team:', userTeam);
                            setHasTeam(true);
                            setAlert({
                                show: true,
                                message: 'Você já tem um time cadastrado! Redirecionando...',
                                type: 'warning'
                            });
                            setTimeout(() => {
                                router.push(`/times/${usuarioId}`);
                            }, 2000);
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking user team:', error);
            }
            setLoading(false);
        };
        checkUserTeam();
    }, [router, usuarioId]);

    if (loading) {
        return <LoadingScreen />;
    }

    // Se o usuário já tem um time, mostra apenas o alerta
    if (hasTeam) {
        return (
            <AuthGuard>
                <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-green-50">
                    <CustomAlert
                        show={alert.show}
                        message={alert.message}
                        type={alert.type}
                        onClose={() => {
                            setAlert({ show: false, message: "", type: "info" });
                            router.push(`/times/${usuarioId}`);
                        }}
                    />
                    <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
                    <PageBanner
                        title="Time Já Cadastrado"
                        subtitle="Você já possui um time na Copa Passa a Bola!"
                    />
                    <div className="flex items-center justify-center py-20">
                        <LoadingScreen />
                    </div>
                </div>
            </AuthGuard>
        );
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
                    title="Cadastrar Time"
                    subtitle="Crie seu time e participe da Copa Passa a Bola!"
                />


                <div className="w-full max-w-7xl mx-auto px-4 py-10">
                    <div className="flex justify-end mb-6" data-aos="fade-right">
                        <VoltarButton onClick={() => router.back()} />
                    </div>

                    <div className="flex flex-col lg:flex-row items-start gap-8 w-full">
                        {/* Sidebar - Logo do Time */}
                        <div className="w-full lg:w-80 flex flex-col gap-6" data-aos="fade-right" data-aos-delay="100">
                            {/* Card de Logo */}
                            <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple/20">
                                <div className="flex flex-col items-center gap-4">
                                    <h3 className="text-xl font-bold text-purple font-title text-center mb-4">Logo do Time</h3>

                                    <div className="relative">
                                        <img
                                            src={preview}
                                            alt="Logo do Time"
                                            className="w-40 h-40 rounded-full object-cover shadow-2xl border-4 border-purple ring-4 ring-purple/20 transition-transform duration-300 hover:scale-105"
                                            onError={(e) => {
                                                e.target.src = '/time_padrao.png'; // Fallback se a imagem não carregar
                                            }}
                                        />
                                        <div className="absolute bottom-2 right-2 bg-pink rounded-full p-2 shadow-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <label className="w-full cursor-pointer">
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImagemChange} />
                                        <div className="bg-gray-100 hover:bg-purple/10 text-purple font-semibold py-3 px-4 rounded-xl text-center transition-all duration-300 border-2 border-dashed border-purple/30 hover:border-purple flex items-center justify-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {imagem ? 'Alterar Logo' : 'Selecionar Logo'}
                                        </div>
                                    </label>

                                    {imagem && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagem(null);
                                                setPreview('/time_padrao.png');
                                            }}
                                            className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Remover Logo
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Card de Dica */}
                            <div className="bg-gradient-to-br from-purple/10 to-pink/10 rounded-3xl shadow-lg p-6 border-2 border-purple/20">
                                <div className="flex items-start gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-purple mb-2">Dica Importante</h4>
                                        <p className="text-sm text-gray-700 mb-2">
                                            Você só pode criar um time. Escolha o nome e as cores com cuidado!
                                        </p>
                                        <p className="text-xs text-gray-600 italic">
                                            * Se não adicionar uma logo, será usada a imagem padrão.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Formulário */}
                        <div className="flex-1 w-full" data-aos="fade-left" data-aos-delay="150">
                            <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple/10">
                                <h3 className="text-3xl font-bold text-purple font-title mb-8 flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Informações do Time
                                </h3>

                                <form onSubmit={handleSubmit} className="w-full space-y-6">
                                    {/* Nome do Time */}
                                    <div className="flex flex-col gap-2 group">
                                        <label className="font-bold text-gray-700 text-sm">
                                            Nome do Time
                                        </label>
                                        <input
                                            value={nome}
                                            onChange={handleNomeChange}
                                            placeholder="Digite o nome do time"
                                            required
                                            className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-black w-full focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all duration-300 group-hover:border-purple/30"
                                        />
                                    </div>

                                    {/* Descrição */}
                                    <div className="flex flex-col gap-2 group">
                                        <label className="font-bold text-gray-700 text-sm">
                                            Descrição do Time
                                        </label>
                                        <textarea
                                            rows="5"
                                            value={descricao}
                                            onChange={handleDescricaoChange}
                                            placeholder="Descreva seu time..."
                                            required
                                            className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-black w-full focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all duration-300 group-hover:border-purple/30 resize-none"
                                        />
                                    </div>

                                    {/* Cores Principais */}
                                    <div className="flex flex-col gap-3">
                                        <label className="font-bold text-gray-700 text-sm">
                                            Cores do Time
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-purple/30 transition-all group">
                                                <label className="text-xs font-semibold text-gray-600 mb-2 block">Cor Principal</label>
                                                <div className="flex items-center gap-3">
                                                    <ColorInput
                                                        id="cor1"
                                                        value={cor1}
                                                        onChange={e => setCor1(e.target.value)}
                                                        title="Escolha a cor principal"
                                                    />
                                                    <span className="text-sm font-mono text-gray-600">{cor1}</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-purple/30 transition-all group">
                                                <label className="text-xs font-semibold text-gray-600 mb-2 block">Cor Secundária</label>
                                                <div className="flex items-center gap-3">
                                                    <ColorInput
                                                        id="cor2"
                                                        value={cor2}
                                                        onChange={e => setCor2(e.target.value)}
                                                        title="Escolha a cor secundária"
                                                        colorClass="purple"
                                                    />
                                                    <span className="text-sm font-mono text-gray-600">{cor2}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 p-3 bg-purple/5 rounded-xl border border-purple/20">
                                            <div className="flex gap-1">
                                                <div
                                                    className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                                                    style={{ backgroundColor: cor1 }}
                                                ></div>
                                                <div
                                                    className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                                                    style={{ backgroundColor: cor2 }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-600 font-semibold">Preview das cores</span>
                                        </div>
                                    </div>

                                    {/* Botão Salvar */}
                                    <div className="flex justify-end pt-6 border-t-2 border-gray-200">
                                        <button
                                            type="submit"
                                            className="bg-gradient-to-r from-purple to-pink hover:from-purple-700 hover:to-pink-600 text-white rounded-xl px-8 py-4 font-bold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Salvar Time
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer links={links} />
            </div>
        </AuthGuard>
    );
}