"use client";
import Header from "../../../Components/Header";
import MainContainer from "../../../Components/MainContainer";
import SectionContainer from "../../../Components/SectionContainer";
import VoltarButton from "../../../Components/VoltarButton";
import JogadoraCard from "../../../Components/JogadoraCard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MeuTime() {
	const { id } = useParams();
	const router = useRouter();
	// Proteção de rota: redireciona se não estiver logado
	useEffect(() => {
	const usuarios = typeof window !== "undefined" ? localStorage.getItem("usuarios") : null;
	if (!usuarios) {
			router.replace("/");
		}
	}, [router]);
    const links = [
        { label: "Inicio", href: `/inicioposlogin/${id}` },
        { label: "Perfil", href: `/perfil/${id}` },
        { label: "Times", href: `/times/${id}` },
		{ label: "Loja", href: `/loja/${id}` },
        { label: "Copas PAB", href: `/copasPab/${id}` },
        { label: "Sair", href: "/" }
    ];
	const [time, setTime] = useState({ nome: "", descricao: "", cor1: "#3b82f6", cor2: "#d1d5db", id: id, imagem: null });
	const [jogadoras, setJogadoras] = useState([]);

	useEffect(() => {
		// Carrega time do localStorage
	const times = JSON.parse(localStorage.getItem("times") || "[]");
	const t = times.find(t => String(t.id) === String(id));
	if (t) setTime({ nome: t.nome, descricao: t.descricao, cor1: t.cor1 || "#3b82f6", cor2: t.cor2 || "#d1d5db", id: t.id, imagem: t.imagem || null });
		// Carrega jogadoras convidadas
		setJogadoras(JSON.parse(localStorage.getItem("jogadoras") || "[]"));
	}, [id]);

	// Atualiza cor no localStorage
	const handleColorChange = (corKey, value) => {
		setTime(prev => {
			const updated = { ...prev, [corKey]: value };
			// Atualiza localStorage
			const times = JSON.parse(localStorage.getItem("times") || "[]");
			const idx = times.findIndex(t => String(t.id) === String(id));
			if (idx !== -1) {
				times[idx] = { ...times[idx], [corKey]: value };
				localStorage.setItem("times", JSON.stringify(times));
			}
			return updated;
		});
	};

	return (
        <>
        <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
		{/* <MainContainer>
			<SectionContainer tamanho={800}>
                <div className="w-full flex justify-end mb-4">
                    <VoltarButton onClick={() => router.push(`/times/${id}`)} />
                </div>
				<div className="rounded-2xl p-4 md:p-8 bg-white">
					<div className="flex flex-col items-center justify-center gap-2 mb-2">
						<h1 className="text-3xl font-bold text-pink-500 mb-2">{time.nome || "Time"}</h1>
						{time.imagem ? (
							<img src={time.imagem} alt="Logo Time" className="w-32 h-32 object-contain mb-2 rounded-full border-4 border-purple shadow-lg" />
						) : (
							<img src="/womensTeams.png" alt="Logo Time" className="w-32 h-32 object-contain mb-2 rounded-full border-4 border-purple shadow-lg" />
						)}
					</div>
					<div className="flex flex-row justify-between items-center mb-2">
						<div className="flex flex-col gap-2">
							<span className="font-semibold text-gray-700">Cores do time:</span>
							<div className="flex gap-4 mt-1">
								<div className="flex flex-col items-center">
									<input type="color" value={time.cor1} onChange={e => handleColorChange("cor1", e.target.value)} className="w-8 h-8 rounded border border-gray-300 cursor-pointer" />
									<span className="text-xs mt-1 text-gray-500">{time.cor1}</span>
								</div>
								<div className="flex flex-col items-center">
									<input type="color" value={time.cor2} onChange={e => handleColorChange("cor2", e.target.value)} className="w-8 h-8 rounded border border-gray-300 cursor-pointer" />
									<span className="text-xs mt-1 text-gray-500">{time.cor2}</span>
								</div>
							</div>
							<span className="mt-2 font-semibold text-gray-700">Jogadoras: <span className="text-purple font-bold text-xl">{jogadoras.length}/15</span></span>
						</div>
						<div className="flex flex-col items-end gap-2">
                                <Link className="text-purple font-bold text-sm md:text-base" href={`/times/cadastrartime/convidar/${id}`}>Convidar Jogadoras</Link>
                                <Link className="text-green font-bold text-sm md:text-base" href={`/times/historico/${id}`}>Ver Histórico de Partidas</Link>
                                <button className="text-red-600 font-bold text-sm md:text-base" onClick={() => router.push("/times")}>Sair do time</button>
						</div>
					</div>
					<hr className="my-4 border-gray-300 rounded-xl" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[350px] overflow-y-auto pb-2">
						{jogadoras.length === 0 ? (
							<span className="text-gray-500">Nenhuma jogadora convidada.</span>
						) : (
							jogadoras.map((j, idx) => (
								<JogadoraCard key={idx} nomeCompleto={j.nomeCompleto} pernaDominante={j.pernaDominante} posicao={j.posicao} />
							))
						)}
					</div>
				</div>
			</SectionContainer>
		</MainContainer> */}
        </>
	);
}
