"use client";
import Header from "@/app/Components/Header";
import Input from "@/app/Components/Input";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import VoltarButton from "@/app/Components/VoltarButton";
import LoadingScreen from "@/app/Components/LoadingScreen";
import AuthGuard from "@/app/Components/AuthGuard";
import PageBanner from "@/app/Components/PageBanner";
import Footer from "@/app/Components/Footer";

export default function Perfil() {
    const [loading, setLoading] = useState(true);
    const { id: usuarioId } = useParams();
    const router = useRouter();
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const links = [
        { label: "Inicio", href: `/inicioposlogin/${usuarioId}` },
        { label: "Perfil", href: `/perfil/${usuarioId}` },
        { label: "Times", href: `/times/${usuarioId}` },
        { label: "Loja", href: `/loja/${usuarioId}` },
        { label: "Copas PAB", href: `/copasPab/${usuarioId}` },
        { label: "Sair", href: "/" }
    ];

    // Helper function to convert DD/MM/AAAA to YYYY-MM-DD for date input
    const convertToDateInputFormat = (dateString) => {
        if (!dateString) return "";
        // Check if already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        // Convert from DD/MM/AAAA to YYYY-MM-DD
        const parts = dateString.split("/");
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return dateString;
    };

    // Helper function to convert YYYY-MM-DD back to DD/MM/AAAA for storage
    const convertToStorageFormat = (dateString) => {
        if (!dateString) return "";
        // Check if already in DD/MM/AAAA format
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
            return dateString;
        }
        // Convert from YYYY-MM-DD to DD/MM/AAAA
        const parts = dateString.split("-");
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        }
        return dateString;
    };
    const handleSave = async (e) => {
        e.preventDefault();
        
        // Only allow saving if user is the owner
        if (!isOwner) {
            alert('Você não tem permissão para editar este perfil.');
            return;
        }
        
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                alert('Você precisa estar logado para atualizar o perfil.');
                return;
            }

            // Prepare update data (exclude senha as we don't update password here)
            const updateData = { ...usuario };
            delete updateData.senha;
            // Convert date back to DD/MM/AAAA format for storage
            if (updateData.dataNascimento) {
                updateData.dataNascimento = convertToStorageFormat(updateData.dataNascimento);
            }
            if (fotoPerfil && fotoPerfil !== "/fotoDePerfil.png") {
                updateData.avatar = fotoPerfil;
            }

            const response = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Erro ao atualizar perfil');
                return;
            }

            alert('Perfil atualizado com sucesso!');
            if (data.user) {
                setUsuario({
                    ...data.user,
                    senha: "" // Keep senha field empty in state
                });
                if (data.user.avatar) {
                    setFotoPerfil(data.user.avatar);
                }
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
        }
    };

    // Campos do cadastro
    const [usuario, setUsuario] = useState({
        nomeCompleto: "",
        dataNascimento: "",
        email: "",
        telefone: "",
        nomeCamisa: "",
        numeroCamisa: "",
        altura: "",
        peso: "",
        posicao: "",
        pernaDominante: "",
        senha: ""
    });

    const [nomeTime, setNomeTime] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.replace("/user/login");
                    return;
                }

                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user_id');
                        router.replace("/user/login");
                        return;
                    }
                    alert(data.error || 'Erro ao carregar perfil');
                    setLoading(false);
                    return;
                }

                if (data.user) {
                    // Set current user ID
                    setCurrentUserId(data.user.id);
                    
                    // Check if current user is the owner of this profile
                    const isProfileOwner = data.user.id === usuarioId;
                    setIsOwner(isProfileOwner);
                    
                    // If viewing own profile, use current user data
                    // If viewing someone else's profile, fetch their data
                    if (isProfileOwner) {
                        setUsuario({
                            nomeCompleto: data.user.nomeCompleto || "",
                            dataNascimento: convertToDateInputFormat(data.user.dataNascimento || ""),
                            email: data.user.email || "",
                            telefone: data.user.telefone || "",
                            nomeCamisa: data.user.nomeCamisa || "",
                            numeroCamisa: data.user.numeroCamisa || "",
                            altura: data.user.altura || "",
                            peso: data.user.peso || "",
                            posicao: data.user.posicao || "",
                            pernaDominante: data.user.pernaDominante || "",
                            senha: "" // Password is not returned from API
                        });

                        if (data.user.avatar) {
                            setFotoPerfil(data.user.avatar);
                        }

                        // Fetch team name if user has a team
                        if (data.user.teamId) {
                            try {
                                const teamResponse = await fetch(`/api/teams/${data.user.teamId}`, {
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    }
                                });
                                if (teamResponse.ok) {
                                    const teamData = await teamResponse.json();
                                    setNomeTime(teamData.team.nome);
                                } else {
                                    setNomeTime(isOwner ? "Você ainda não tem um time" : "Sem time");
                                }
                            } catch (teamError) {
                                console.error('Error fetching team:', teamError);
                                setNomeTime(isOwner ? "Você ainda não tem um time" : "Sem time");
                            }
                        } else {
                            setNomeTime(isOwner ? "Você ainda não tem um time" : "Sem time");
                        }
                    } else {
                        // Fetch the other user's profile data
                        try {
                            const profileResponse = await fetch(`/api/users/${usuarioId}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            
                            if (profileResponse.ok) {
                                const profileData = await profileResponse.json();
                                if (profileData.user) {
                                    setUsuario({
                                        nomeCompleto: profileData.user.nomeCompleto || "",
                                        dataNascimento: convertToDateInputFormat(profileData.user.dataNascimento || ""),
                                        email: profileData.user.email || "",
                                        telefone: profileData.user.telefone || "",
                                        nomeCamisa: profileData.user.nomeCamisa || "",
                                        numeroCamisa: profileData.user.numeroCamisa || "",
                                        altura: profileData.user.altura || "",
                                        peso: profileData.user.peso || "",
                                        posicao: profileData.user.posicao || "",
                                        pernaDominante: profileData.user.pernaDominante || "",
                                        senha: "" // Password is not returned from API
                                    });

                                    if (profileData.user.avatar) {
                                        setFotoPerfil(profileData.user.avatar);
                                    }
                                    
                                    // Fetch team name if user has a team
                                    if (profileData.user.teamId) {
                                        try {
                                            const teamResponse = await fetch(`/api/teams/${profileData.user.teamId}`, {
                                                headers: {
                                                    'Authorization': `Bearer ${token}`
                                                }
                                            });
                                            if (teamResponse.ok) {
                                                const teamData = await teamResponse.json();
                                                setNomeTime(teamData.team.nome);
                                            } else {
                                                setNomeTime("Sem time");
                                            }
                                        } catch (teamError) {
                                            console.error('Error fetching team:', teamError);
                                            setNomeTime("Sem time");
                                        }
                                    } else {
                                        setNomeTime("Sem time");
                                    }
                                }
                            } else {
                                const errorData = await profileResponse.json().catch(() => ({}));
                                alert(errorData.error || 'Erro ao carregar perfil do usuário');
                            }
                        } catch (profileError) {
                            console.error('Error fetching profile:', profileError);
                            alert('Erro ao carregar perfil do usuário');
                        }
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error('Fetch user error:', error);
                alert('Erro ao carregar perfil');
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router, usuarioId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario((prev) => ({ ...prev, [name]: value }));
    }

    // Estado para imagem de perfil
    const [fotoPerfil, setFotoPerfil] = useState("/fotoDePerfil.png");

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPerfil(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                alert('Você precisa estar logado.');
                return;
            }

            const response = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Erro ao excluir conta');
                return;
            }

            // Clear localStorage and redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_id');
            
            alert('Conta excluída com sucesso!');
            router.push('/user/login');
        } catch (error) {
            console.error('Delete account error:', error);
            alert('Erro ao conectar com o servidor. Tente novamente.');
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }
    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-green-50">
                <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />

                <PageBanner
                    title={isOwner ? "Meu Perfil" : `Perfil de ${usuario.nomeCompleto}`}
                    subtitle={isOwner ? "Gerencie suas informações pessoais" : "Informações da jogadora"}
                />

                <div className="w-full max-w-7xl mx-auto px-4 py-10">
                    <div className="flex justify-end mb-6" data-aos="fade-right">
                        <VoltarButton onClick={router.back} />
                    </div>

                    <div className="flex flex-col lg:flex-row items-start gap-8 w-full mb-15">
                        {/* Sidebar - Foto e Info Rápida */}
                        <div className="w-full lg:w-80 flex flex-col gap-6 lg:sticky lg:top-24" data-aos="fade-right" data-aos-delay="100">
                            {/* Card de Foto */}
                            <div className="bg-white rounded-3xl shadow-xl p-10 border-2 border-purple/20">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <img 
                                            src={fotoPerfil} 
                                            alt="Foto de Perfil" 
                                            className="w-40 h-40 rounded-full object-cover shadow-2xl border-4 border-purple ring-4 ring-purple/20 transition-transform duration-300 hover:scale-105" 
                                        />
                                        {isOwner && (
                                            <div className="absolute bottom-2 right-2 bg-pink rounded-full p-2 shadow-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <h2 className="text-2xl font-bold text-purple font-title text-center">
                                        {usuario.nomeCompleto}
                                    </h2>
                                    
                                    {usuario.nomeCamisa && (
                                        <div className="bg-gradient-to-r from-purple to-pink text-white px-4 py-2 rounded-full font-bold text-lg">
                                            {usuario.nomeCamisa} #{usuario.numeroCamisa}
                                        </div>
                                    )}

                                    {isOwner && (
                                        <label className="w-full cursor-pointer">
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                                            <div className="bg-gray-100 hover:bg-purple/10 text-purple font-semibold py-3 px-4 rounded-xl text-center transition-all duration-300 border-2 border-dashed border-purple/30 hover:border-purple flex items-center justify-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Alterar Foto
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Card de Info Rápida */}
                            <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-green/20 flex-1">
                                <h3 className="text-xl font-bold text-green font-title mb-4 text-center">Informações Rápidas</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-green/5 rounded-xl">
                                        <div className="bg-green/10 p-2 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold">Posição</p>
                                            <p className="font-bold text-gray-800">{usuario.posicao || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-purple/5 rounded-xl">
                                        <div className="bg-purple/10 p-2 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold">Time</p>
                                            <p className="font-bold text-gray-800">{nomeTime}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-pink/5 rounded-xl">
                                        <div className="bg-pink/10 p-2 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold">Perna Dominante</p>
                                            <p className="font-bold text-gray-800">{usuario.pernaDominante || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!isOwner && (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-blue-600 font-semibold">
                                        Você está visualizando o perfil de outra jogadora
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Main Content - Formulário */}
                        <div className="flex-1 w-full" data-aos="fade-left" data-aos-delay="150">
                            <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple/10">
                                <h3 className="text-3xl font-bold text-purple font-title mb-8 flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Dados Pessoais
                                </h3>

                                <form className="w-full">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {Object.entries(usuario).map(([key, value]) => {
                                            let label = "";
                                            let type = "text";
                                            let IconComponent = null;
                                            
                                            switch (key) {
                                                case "nomeCompleto": 
                                                    label = "Nome Completo"; 
                                                    IconComponent = function UserIcon() {
                                                        return (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        );
                                                    };
                                                    break;
                                                case "dataNascimento": 
                                                    label = "Data de Nascimento"; 
                                                    type = "date";
                                                    IconComponent = function CalendarIcon() {
                                                        return (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        );
                                                    };
                                                    break;
                                                case "email": 
                                                    label = "Email"; 
                                                    type = "email";
                                                    IconComponent = function EmailIcon() {
                                                        return (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        );
                                                    };
                                                    break;
                                                case "telefone": 
                                                    label = "Telefone"; 
                                                    type = "tel";
                                                    IconComponent = function PhoneIcon() {
                                                        return (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                        );
                                                    };
                                                    break;
                                                case "nomeCamisa": 
                                                    label = "Nome na Camisa";
                                                    IconComponent = function ShirtIcon() {
                                                        return (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                            </svg>
                                                        );
                                                    };
                                                    break;
                                                case "numeroCamisa": 
                                                    label = "Número da Camisa"; 
                                                    type = "number";
                                                    IconComponent = function NumberIcon() {
                                                        return (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                            </svg>
                                                        );
                                                    };
                                                    break;
                                                case "altura": 
                                                    label = "Altura (cm)"; 
                                                    type = "number";
                                                    IconComponent = function HeightIcon() {
                                                        return (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                            </svg>
                                                        );
                                                    };
                                                    break;
                                                case "peso": 
                                                    label = "Peso (kg)"; 
                                                    type = "number";
                                                    IconComponent = function WeightIcon() {
                                                        return (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                            </svg>
                                                        );
                                                    };
                                                    break;
                                                case "posicao": 
                                                    label = "Posição";
                                                    IconComponent = function PositionIcon() {
                                                        return (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        );
                                                    };
                                                    break;
                                                case "pernaDominante": 
                                                    label = "Perna Dominante";
                                                    IconComponent = function FootIcon() {
                                                        return (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                        );
                                                    };
                                                    break;
                                                case "senha": 
                                                    label = "Senha Atual"; 
                                                    type = "password";
                                                    IconComponent = function LockIcon() {
                                                        return (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                        );
                                                    };
                                                    break;
                                                default: 
                                                    label = key.charAt(0).toUpperCase() + key.slice(1);
                                            }

                                            return (
                                                <div key={key} className="flex flex-col gap-2 group">
                                                    <label className="font-bold text-gray-700 text-sm">
                                                        {label}
                                                    </label>
                                                    {isOwner ? (
                                                        <Input 
                                                            type={type} 
                                                            name={key} 
                                                            value={value} 
                                                            onChange={handleChange}
                                                            className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-black w-full focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all duration-300 group-hover:border-purple/30" 
                                                        />
                                                    ) : (
                                                        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 min-h-[44px] flex items-center">
                                                            {type === "password" ? "••••••••" : value || "N/A"}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </form>
                            </div>

                            {/* Botões de Ação */}
                            {isOwner && (
                                <div className="flex flex-col sm:flex-row gap-4 w-full mt-6" data-aos="fade-up" data-aos-delay="200">
                                    <button 
                                        className="flex-1 bg-gradient-to-r from-purple to-pink hover:from-purple-700 hover:to-pink-600 text-white rounded-xl px-6 py-4 font-bold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                                        onClick={handleSave}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Salvar Alterações
                                    </button>
                                    <button 
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl px-6 py-4 font-bold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Excluir Conta
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Delete Account Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-scaleIn border-4 border-red-500">
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-red-100 rounded-full p-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-red-600 font-title text-center">Excluir Conta</h2>
                                <p className="text-gray-700 text-center leading-relaxed">
                                    Tem certeza que deseja excluir sua conta? Esta ação <strong className="text-red-600">não pode ser desfeita</strong> e todos os seus dados serão permanentemente removidos.
                                </p>
                                <div className="w-full bg-red-50 border-2 border-red-200 rounded-xl p-4 mt-2 flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-sm text-red-600 font-semibold text-center">
                                        Você perderá acesso a times, mensagens e todo o histórico!
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 px-6 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Confirmar Exclusão
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer links={links} />
        </AuthGuard>
    );
}