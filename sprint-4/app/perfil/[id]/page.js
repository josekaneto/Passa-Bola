"use client";
import Header from "@/app/Components/Header";
import Input from "@/app/Components/Input";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import VoltarButton from "@/app/Components/VoltarButton";
import LoadingScreen from "@/app/Components/LoadingScreen";
import AuthGuard from "@/app/Components/AuthGuard";

export default function Perfil() {
    const [loading, setLoading] = useState(true);
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

                    // TODO: Fetch team name from team API when available
                    setNomeTime("Você ainda não tem um time");
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
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
                <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
                <div className="w-full max-w-7xl mx-auto px-4 py-8">
                    <div className="max-w-[700px] mx-auto">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
                            <div className="w-full md:w-1/3 flex flex-col gap-3 items-center bg-white rounded-2xl shadow-lg p-6 mb-6 md:mb-0">
                                <div className="w-full flex justify-start mb-4">
                                    <VoltarButton onClick={router.back} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-5 font-title text-center text-purple">Meu Perfil</h2>
                                <div className="w-full flex flex-col items-center gap-3">
                                    <h2 className="text-base md:text-lg font-semibold text-gray-700">Informações do seu perfil</h2>
                                    <p className="text-sm md:text-base text-gray-600">
                                        Time: <strong className="text-green font-black">{nomeTime}</strong>
                                    </p>
                                </div>
                                <hr className="my-4 w-full border-gray-300 rounded-xl" />
                                <img src={fotoPerfil} alt="Foto de Perfil" className="w-24 h-24 md:w-32 md:h-32 rounded-full mb-4 object-cover shadow-md border-4 border-purple" />
                                <span className="text-lg md:text-xl font-semibold mb-2 w-full text-center text-purple">{usuario.nomeCompleto}</span>
                                <label className="mb-4 cursor-pointer w-full">
                                    <input type="file" accept="image/*" className="border hidden" onChange={handleFotoChange} />
                                    <span className="block text-center mt-2 text-sm text-gray-500 hover:text-purple transition">Selecionar a Imagem</span>
                                </label>
                                <button className="bg-purple hover:bg-purple-700 transition text-white rounded-lg px-6 py-2 font-bold shadow-md mt-2 mb-4 w-full" onClick={handleSave}>Salvar</button>
                                <button 
                                    className="bg-red-500 hover:bg-red-600 transition text-white rounded-lg px-6 py-2 font-bold shadow-md mt-2 mb-4 w-full" 
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    Excluir Conta
                                </button>
                            </div>
                            <div className="w-full md:w-2/3 flex flex-col md:text-left text-center gap-5">
                                <form className="w-full" action="">
                                    <div className="flex flex-col gap-5 md:gap-7 md:max-h-[620px] md:overflow-auto w-full">
                                        {Object.entries(usuario).map(([key, value]) => {
                                            let label = "";
                                            let type = "text";
                                            switch (key) {
                                                case "nomeCompleto": label = "Nome completo"; break;
                                                case "dataNascimento": label = "Data de nascimento"; type = "date"; break;
                                                case "email": label = "Email"; type = "email"; break;
                                                case "telefone": label = "Número do telefone"; type = "tel"; break;
                                                case "nomeCamisa": label = "Nome na camisa"; break;
                                                case "numeroCamisa": label = "Número da camisa"; type = "number"; break;
                                                case "altura": label = "Altura (cm)"; type = "number"; break;
                                                case "peso": label = "Peso (kg)"; type = "number"; break;
                                                case "posicao": label = "Posição"; break;
                                                case "pernaDominante": label = "Perna dominante"; break;
                                                case "senha": label = "Senha Atual"; type = "password"; break;
                                                default: label = key.charAt(0).toUpperCase() + key.slice(1);
                                            }
                                            return (
                                                <div key={key} className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gray-50 shadow-sm border border-gray-200">
                                                    <label className="font-bold text-gray-600 w-full md:w-40 md:text-right md:mr-4">{label}</label>
                                                    <Input type={type} name={key} value={value} onChange={handleChange}
                                                        className={type === "password" ? "bg-white border border-gray-300 rounded-lg px-4 py-2 text-black w-full focus:outline-none focus:ring-2 focus:ring-purple transition" : "bg-white border border-gray-300 rounded-lg px-4 py-2 text-black flex-1 focus:outline-none focus:ring-2 focus:ring-purple transition"} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Account Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-red-600 font-title mb-4">Excluir Conta</h2>
                            <p className="text-gray-700 mb-6">
                                Tem certeza que deseja excluir sua conta? Esta ação <strong>não pode ser desfeita</strong> e todos os seus dados serão permanentemente removidos.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                >
                                    Confirmar Exclusão
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}