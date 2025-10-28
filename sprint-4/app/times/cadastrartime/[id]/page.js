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


export default function CadastrarTime() {
    const router = useRouter();
    const { id: usuarioId } = useParams();
    const [loading, setLoading] = useState(true);
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
    const [preview, setPreview] = useState(null); // para mostrar na tela

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

    // Salva time no localStorage
    const handleSubmit = (e) => {
        e.preventDefault();
        const times = JSON.parse(localStorage.getItem("times") || "[]");
        const idx = times.findIndex(t => String(t.id) === String(usuarioId));
        const teamData = { id: usuarioId, nome, descricao, cor1, cor2, imagem };
        if (idx !== -1) {
            times[idx] = teamData;
        } else {
            times.push(teamData);
        }
        localStorage.setItem("times", JSON.stringify(times));
        router.push(`/times/meutime/${usuarioId}`);
    };

    useEffect(() => {
        setLoading(true);
        const usuarios = typeof window !== "undefined" ? localStorage.getItem("usuarios") : null;
        if (!usuarios) {
            router.replace("/");
            return;
        }
        // Carregar imagem se já existir
        const times = JSON.parse(localStorage.getItem("times") || "[]");
        const time = times.find(t => String(t.id) === String(usuarioId));
        if (time && time.imagem) {
            setPreview(time.imagem);
        }
        setLoading(false);
    }, [router, usuarioId]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
            <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
            {/* <MainContainer>
                <SectionContainer tamanho={700}>
                    <div className="mb-6">
                        <div className="w-full flex justify-end">
                            <VoltarButton onClick={() => router.back()} />
                        </div>
                        <h2 className="text-3xl font-bold mb-5 font-title text-purple drop-shadow">Cadastrar um Time</h2>
                        <div className="w-full flex items-center gap-20">
                            <p className="text-lg text-gray-700">Cadastre o seu Time na Copa Passa a Bola!</p>
                        </div>
                        <hr className="my-6 w-full border-gray-300 rounded-xl" />
                    </div>
                    <div className="flex flex-col items-center md:flex-row md:items-center sm:items-center gap-2 bg-white/80 rounded-2xl shadow-xl">
                        <div className="flex flex-col items-center justify-start w-1/4 min-w-[180px] gap-4 pt-2">
                            {preview ? (
                                <img src={preview} alt="Avatar" className="w-24 h-24 sm:w-32 sm:h-32 object-cover mb-2 rounded-full border-4 border-purple shadow-lg transition-transform duration-300 hover:scale-105" />
                            ) : (
                                <img src="/womensTeams.png" alt="Avatar" className="w-24 h-24 sm:w-32 sm:h-32 object-cover mb-2 rounded-full border-4 border-purple shadow-lg transition-transform duration-300 hover:scale-105" />
                            )}
                            <div className="text-center w-full flex flex-col gap-5">
                                <label className="mb-4 cursor-pointer">
                                    <input type="file" accept="image/*" className="border hidden border-gray-300 rounded px-2 sm:px-4 py-2" onChange={handleImagemChange} />
                                    <span className="block text-center mt-2 text-sm sm:text-base text-purple hover:underline">Selecionar a Imagem</span>
                                </label>
                                <div className="flex flex-col gap-2">
                                    <Link href={`/times/cadastrartime/convidar/${usuarioId}`} className="text-purple font-bold text-sm sm:text-base hover:underline">Convidar</Link>
                                </div>
                            </div>
                        </div>
                        <form className="w-3/4 flex flex-col gap-6 bg-white rounded-xl p-6" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
                                    <span className="font-bold text-gray-600 text-sm sm:text-base">Nome do Time:</span>
                                    <input value={nome} onChange={handleNomeChange} placeholder="Nome do time" className="border rounded-lg px-2 sm:px-3 py-2 text-black bg-white w-full sm:w-48 border-gray-400 focus:border-[var(--color-pink)] focus:outline-none shadow-sm transition-all duration-200" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-gray-600 text-sm sm:text-base">Descrição do Time</span>
                                <textarea rows="7" value={descricao} onChange={handleDescricaoChange}
                                    className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-black bg-white resize-none text-sm sm:text-base focus:border-[var(--color-pink)] focus:outline-none shadow-sm transition-all duration-200" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-gray-600 text-sm sm:text-base">Cores Principais:</span>
                                <div className="flex flex-row gap-2 sm:gap-3 mt-1">
                                    <ColorInput
                                        id="cor1"
                                        value={cor1}
                                        onChange={e => setCor1(e.target.value)}
                                        title="Escolha a cor principal 1"
                                    />
                                    <ColorInput
                                        id="cor2"
                                        value={cor2}
                                        onChange={e => setCor2(e.target.value)}
                                        title="Escolha a cor principal 2"
                                        colorClass="purple"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <button type="submit" className="bg-purple text-white font-bold px-6 sm:px-10 py-2 rounded-lg text-sm sm:text-base shadow-md hover:bg-pink transition-colors duration-200">Salvar</button>
                            </div>
                        </form>
                    </div>
                </SectionContainer>
            </MainContainer> */}
        </div>
    );
}