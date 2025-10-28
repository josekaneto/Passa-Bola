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
    const handleSave = (e) => {
        e.preventDefault();
        const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
        const idx = usuarios.findIndex(u => String(u.id) === String(usuarioId));
        if (idx !== -1) {
            usuarios[idx] = { ...usuarios[idx], ...usuario };
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
        }
    };

    useEffect(() => {
        setLoading(true);
        const usuarios = typeof window !== "undefined" ? localStorage.getItem("usuarios") : null;
        if (!usuarios) {
            router.replace("/");
            return;
        }
        setLoading(false);
    }, [router]);

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
    useEffect(() => {
        const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
        const user = usuarios.find(u => String(u.id) === String(usuarioId));
        if (user) {
            setUsuario({
                nomeCompleto: user.nomeCompleto || "",
                dataNascimento: user.dataNascimento || "",
                email: user.email || "",
                telefone: user.telefone || "",
                nomeCamisa: user.nomeCamisa || "",
                numeroCamisa: user.numeroCamisa || "",
                altura: user.altura || "",
                peso: user.peso || "",
                posicao: user.posicao || "",
                pernaDominante: user.pernaDominante || "",
                senha: user.senha || ""
            });
        }
        // Busca nome do time do usuário
        const times = JSON.parse(localStorage.getItem("times") || "[]");
        const meuTime = times.find(t => String(t.id) === String(usuarioId));
        setNomeTime(meuTime?.nome || "Você ainda não tem um time");
    }, [usuarioId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario((prev) => ({ ...prev, [name]: value }));
    }

    // Estado para imagem de perfil
    const [fotoPerfil, setFotoPerfil] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("fotoPerfil") || "/fotoDePerfil.png";
        }
        return "/fotoDePerfil.png";
    });

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPerfil(reader.result);
                if (typeof window !== "undefined") {
                    localStorage.setItem("fotoPerfil", reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }
    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
                <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
                {/* <MainContainer>
                    <SectionContainer tamanho={700}>
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
                    </SectionContainer>
                </MainContainer> */}
            </div>
        </AuthGuard>
    );
    }