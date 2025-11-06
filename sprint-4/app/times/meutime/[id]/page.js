"use client";
import Header from "@/app/Components/Header";
import VoltarButton from "../../../Components/VoltarButton";
import JogadoraCard from "../../../Components/JogadoraCard";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainContainer from "@/app/Components/MainContainer";
import SectionContainer from "@/app/Components/SectionContainer";
import LoadingScreen from "@/app/Components/LoadingScreen";
import CustomAlert from "@/app/Components/CustomAlert";
import CustomConfirm from "@/app/Components/CustomConfirm";
import AuthGuard from "@/app/Components/AuthGuard";
import TeamChat from "@/app/Components/TeamChat";

export default function MeuTime() {
	const { id } = useParams();
	const router = useRouter();
	const [time, setTime] = useState({ nome: "", descricao: "", cor1: "#3b82f6", cor2: "#d1d5db", id: id, imagem: null });
	const [jogadoras, setJogadoras] = useState([]);
	const [loading, setLoading] = useState(true);
	const [userId, setUserId] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isCaptain, setIsCaptain] = useState(false);
	const [isMember, setIsMember] = useState(false);
	const [hasJoinRequest, setHasJoinRequest] = useState(false);
	const [editForm, setEditForm] = useState({ nome: "", descricao: "", cor1: "#3b82f6", cor2: "#d1d5db", imagem: null });
	const [preview, setPreview] = useState(null);
	const [alert, setAlert] = useState({ show: false, message: "", type: "info" });
	const [confirm, setConfirm] = useState({ show: false, message: "", onConfirm: null });

	const links = [
        { label: "Inicio", href: userId ? `/inicioposlogin/${userId}` : '/' },
        { label: "Perfil", href: userId ? `/perfil/${userId}` : '/' },
        { label: "Times", href: userId ? `/times/${userId}` : '/times' },
		{ label: "Loja", href: userId ? `/loja/${userId}` : '/loja' },
        { label: "Copas PAB", href: userId ? `/copasPab/${userId}` : '/copasPab' },
        { label: "Sair", href: "/" }
    ];

	useEffect(() => {
		const fetchTime = async () => {
			setLoading(true);
			const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
			if (!authToken) {
				router.replace("/");
				return;
			}
			try {
				// Fetch user ID first
				let userData = null;
				const userResponse = await fetch('/api/auth/me', {
					headers: {
						'Authorization': `Bearer ${authToken}`
					}
				});
				if (userResponse.ok) {
					userData = await userResponse.json();
					if (userData.user && userData.user.id) {
						console.log('Setting userId to:', userData.user.id);
						setUserId(userData.user.id);
					} else {
						console.error('User data missing user.id:', userData);
					}
				} else {
					console.error('Failed to fetch user data. Status:', userResponse.status);
					const errorData = await userResponse.json().catch(() => ({}));
					console.error('Error response:', errorData);
				}

				// Fetch team data
				const response = await fetch(`/api/teams/${id}`, {
					headers: {
						'Authorization': `Bearer ${authToken}`
					}
				});
				if (response.ok) {
					const data = await response.json();
					const team = data.team;
					setTime({ 
						nome: team.nome, 
						descricao: team.descricao, 
						cor1: team.cor1 || "#3b82f6", 
						cor2: team.cor2 || "#d1d5db", 
						id: team.id, 
						imagem: team.imagem || null 
					});
					setJogadoras(team.members || []);
					setEditForm({
						nome: team.nome,
						descricao: team.descricao,
						cor1: team.cor1 || "#3b82f6",
						cor2: team.cor2 || "#d1d5db",
						imagem: team.imagem || null
					});
					setPreview(team.imagem || null);
					// Check if current user is the captain
					if (userData && userData.user && userData.user.id === team.captainId) {
						setIsCaptain(true);
					}
					// Check if current user is a member
					if (userData && userData.user && team.members) {
						const isTeamMember = team.members.some(m => m.userId && (m.userId.toString() === userData.user.id || m.userId === userData.user.id));
						setIsMember(isTeamMember);
					}
					// Check if user has a pending join request
					if (userData && userData.user && !isCaptain) {
						try {
							const joinRequestResponse = await fetch(`/api/invitations?status=pending`, {
								headers: {
									'Authorization': `Bearer ${authToken}`
								}
							});
							if (joinRequestResponse.ok) {
								const joinRequestData = await joinRequestResponse.json();
								const hasPendingRequest = joinRequestData.invitations.some(
									inv => inv.type === 'invitation' && inv.teamId === team.id
								);
								setHasJoinRequest(hasPendingRequest);
							}
						} catch (error) {
							console.error('Error checking join request:', error);
						}
					}
				}
			} catch (error) {
				console.error('Error fetching team:', error);
			}
			setLoading(false);
		};
		fetchTime();
	}, [id, router]);

	// Atualiza cor no MongoDB
	const handleColorChange = async (corKey, value) => {
		const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
		if (!authToken) return;
		
		setTime(prev => {
			const updated = { ...prev, [corKey]: value };
			// Atualiza MongoDB
			fetch(`/api/teams/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authToken}`
				},
				body: JSON.stringify({ [corKey]: value })
			}).catch(error => {
				console.error('Error updating team color:', error);
			});
			return updated;
		});
	};

	// Handle edit form submission
	const handleEditSubmit = async (e) => {
		e.preventDefault();
		const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
		if (!authToken) return;

		try {
			const response = await fetch(`/api/teams/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authToken}`
				},
				body: JSON.stringify(editForm)
			});

			if (response.ok) {
				const data = await response.json();
				setTime({
					...time,
					nome: data.team.nome,
					descricao: data.team.descricao,
					cor1: data.team.cor1,
					cor2: data.team.cor2,
					imagem: data.team.imagem
				});
				setIsEditing(false);
				setAlert({ show: true, message: 'Time atualizado com sucesso!', type: 'success' });
			} else {
				const errorData = await response.json();
				setAlert({ show: true, message: errorData.error || 'Erro ao atualizar time', type: 'error' });
			}
		} catch (error) {
			console.error('Error updating team:', error);
			setAlert({ show: true, message: 'Erro ao atualizar time', type: 'error' });
		}
	};

	// Handle delete team
	const handleDeleteTeam = () => {
		setConfirm({
			show: true,
			message: 'Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita.',
			onConfirm: async () => {
				setConfirm({ show: false, message: "", onConfirm: null });
				const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
				if (!authToken) return;

				try {
					const response = await fetch(`/api/teams/${id}`, {
						method: 'DELETE',
						headers: {
							'Authorization': `Bearer ${authToken}`
						}
					});

					if (response.ok) {
						setAlert({ show: true, message: 'Time excluído com sucesso!', type: 'success' });
						setTimeout(() => {
							router.push(`/times/${userId}`);
						}, 1500);
					} else {
						const errorData = await response.json();
						setAlert({ show: true, message: errorData.error || 'Erro ao excluir time', type: 'error' });
					}
				} catch (error) {
					console.error('Error deleting team:', error);
					setAlert({ show: true, message: 'Erro ao excluir time', type: 'error' });
				}
			}
		});
	};

	// Handle leave team
	const handleLeaveTeam = () => {
		// Check if user is captain
		if (isCaptain) {
			setAlert({ 
				show: true, 
				message: 'Você não pode sair do time enquanto for a capitã. Transfira a capitania ou exclua o time.', 
				type: 'error' 
			});
			return;
		}

		setConfirm({
			show: true,
			message: 'Tem certeza que deseja sair deste time?',
			onConfirm: async () => {
				setConfirm({ show: false, message: "", onConfirm: null });
				const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
				if (!authToken || !userId) return;

				try {
					const response = await fetch(`/api/teams/${id}/members?memberId=${userId}`, {
						method: 'DELETE',
						headers: {
							'Authorization': `Bearer ${authToken}`
						}
					});

					if (response.ok) {
						setAlert({ show: true, message: 'Você saiu do time com sucesso!', type: 'success' });
						setTimeout(() => {
							router.push(`/times/${userId}`);
						}, 1500);
					} else {
						const errorData = await response.json();
						setAlert({ show: true, message: errorData.error || 'Erro ao sair do time', type: 'error' });
					}
				} catch (error) {
					console.error('Error leaving team:', error);
					setAlert({ show: true, message: 'Erro ao sair do time', type: 'error' });
				}
			}
		});
	};

	// Handle request to join team
	const handleRequestToJoin = async () => {
		const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
		if (!authToken) return;

		try {
			const response = await fetch(`/api/teams/${id}/join-request`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${authToken}`
				}
			});

			if (response.ok) {
				setAlert({ show: true, message: 'Solicitação enviada com sucesso! A capitã do time receberá uma notificação.', type: 'success' });
				setHasJoinRequest(true);
			} else {
				const errorData = await response.json();
				setAlert({ show: true, message: errorData.error || 'Erro ao enviar solicitação', type: 'error' });
			}
		} catch (error) {
			console.error('Error requesting to join:', error);
			setAlert({ show: true, message: 'Erro ao enviar solicitação', type: 'error' });
		}
	};

	// Handle image upload
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setEditForm({ ...editForm, imagem: reader.result });
				setPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	if (loading) {
		return <LoadingScreen />;
	}

	// Icon Components
	const TeamIcon = () => (
		<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
		</svg>
	);
	
	const ColorIcon = () => (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
		</svg>
	);

	const InviteIcon = () => (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
		</svg>
	);

	const HistoryIcon = () => (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	);

	const EditIcon = () => (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
		</svg>
	);

	const DeleteIcon = () => (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		</svg>
	);

	const ExitIcon = () => (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
		</svg>
	);

	return (
        <AuthGuard>
            <>
                <CustomAlert 
                    show={alert.show} 
                    message={alert.message} 
                    type={alert.type} 
                    onClose={() => setAlert({ show: false, message: "", type: "info" })} 
                />
                <CustomConfirm
                    show={confirm.show}
                    message={confirm.message}
                    onConfirm={confirm.onConfirm || (() => {})}
                    onCancel={() => setConfirm({ show: false, message: "", onConfirm: null })}
                />
                <Header links={links} bgClass="bg-white" src="/Logo-preta.png" color="text-black" />
		
		<MainContainer>
			<div className="w-full max-w-7xl mx-auto px-4">
				{/* Banner Header */}
				<div className="bg-gradient-to-r from-purple via-pink to-green rounded-2xl p-8 mb-6 shadow-lg">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<TeamIcon />
							<h1 className="text-4xl font-bold text-white">Meu Time</h1>
						</div>
						<VoltarButton 
							textColor="text-white" 
							hoverColor="hover:text-green"
							onClick={async (e) => {
							e?.preventDefault?.();
							try {
								if (userId) {
									router.push(`/times/${userId}`);
									return;
								}
								const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
								if (authToken) {
									try {
										const res = await fetch('/api/auth/me', {
											headers: {
												'Authorization': `Bearer ${authToken}`
											}
										});
										const data = await res.json();
										if (data.user && data.user.id) {
											router.push(`/times/${data.user.id}`);
										} else {
											setAlert({ show: true, message: 'Erro: ID do usuário não encontrado', type: 'error' });
										}
									} catch (fetchError) {
										setAlert({ show: true, message: 'Erro ao buscar dados do usuário: ' + fetchError.message, type: 'error' });
									}
								} else {
									setAlert({ show: true, message: 'Erro: Token de autenticação não encontrado', type: 'error' });
								}
							} catch (error) {
								setAlert({ show: true, message: 'Erro ao navegar: ' + error.message, type: 'error' });
							}
						}} />
					</div>
				</div>

				{/* Main Content */}
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Left Sidebar */}
					<div className="lg:w-80 flex-shrink-0 space-y-6">
						{/* Team Logo Card */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<div className="flex flex-col items-center gap-4">
								<h2 className="text-2xl font-bold text-pink text-center">{time.nome || "Time"}</h2>
								{time.imagem ? (
									<img src={time.imagem} alt="Logo Time" className="w-32 h-32 object-cover rounded-full border-4 border-purple shadow-lg" />
								) : (
									<img src="/womensTeams.png" alt="Logo Time" className="w-32 h-32 object-cover rounded-full border-4 border-purple shadow-lg" />
								)}
							</div>
						</div>

						{/* Team Info Card */}
						<div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
							<div className="flex items-center gap-2 text-purple">
								<ColorIcon />
								<h3 className="font-bold text-lg">Cores do Time</h3>
							</div>
							<div className="flex gap-4 justify-center">
								<div className="flex flex-col items-center gap-2">
									<div 
										className="w-16 h-16 rounded-lg shadow-md border-2 border-gray-300"
										style={{ backgroundColor: time.cor1 }}
									></div>
									<span className="text-xs text-gray-600 font-mono">{time.cor1}</span>
									<input 
										type="color" 
										value={time.cor1} 
										onChange={e => handleColorChange("cor1", e.target.value)} 
										className="w-10 h-10 rounded cursor-pointer border-2 border-gray-300"
										disabled={!isCaptain}
									/>
								</div>
								<div className="flex flex-col items-center gap-2">
									<div 
										className="w-16 h-16 rounded-lg shadow-md border-2 border-gray-300"
										style={{ backgroundColor: time.cor2 }}
									></div>
									<span className="text-xs text-gray-600 font-mono">{time.cor2}</span>
									<input 
										type="color" 
										value={time.cor2} 
										onChange={e => handleColorChange("cor2", e.target.value)} 
										className="w-10 h-10 rounded cursor-pointer border-2 border-gray-300"
										disabled={!isCaptain}
									/>
								</div>
							</div>
							<div className="pt-4 border-t border-gray-200 text-center">
								<span className="text-gray-700 font-semibold">Total de Jogadoras</span>
								<div className="text-3xl font-bold text-purple mt-2">
									{jogadoras.length}<span className="text-gray-400">/{time.maxMembers || 15}</span>
								</div>
							</div>
						</div>

						{/* Quick Actions Card */}
						<div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
							<h3 className="font-bold text-lg text-purple mb-4">Ações Rápidas</h3>
							
							<Link 
								href={`/times/cadastrartime/convidar/${id}`}
								className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple/10 transition-colors text-purple font-semibold"
							>
								<InviteIcon />
								<span>Convidar Jogadoras</span>
							</Link>

							<Link 
								href={`/times/historico/${id}`}
								className="flex items-center gap-3 p-3 rounded-lg hover:bg-green/10 transition-colors text-green font-semibold"
							>
								<HistoryIcon />
								<span>Ver Histórico</span>
							</Link>

							{isCaptain && (
								<>
									<button 
										onClick={() => setIsEditing(!isEditing)}
										className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 font-semibold"
									>
										<EditIcon />
										<span>{isEditing ? 'Cancelar Edição' : 'Editar Time'}</span>
									</button>

									<button 
										onClick={handleDeleteTeam}
										className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-semibold"
									>
										<DeleteIcon />
										<span>Excluir Time</span>
									</button>
								</>
							)}

							{isMember && (
								<button 
									onClick={handleLeaveTeam}
									className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-semibold"
								>
									<ExitIcon />
									<span>Sair do Time</span>
								</button>
							)}
						</div>
					</div>

					{/* Main Content Area */}
					<div className="flex-1 space-y-6">
						{/* Join Request Button - only show if user is not captain, not a member, and hasn't already requested */}
						{!isCaptain && !isMember && (
							<div className="bg-white rounded-2xl shadow-lg p-6">
								<button
									onClick={handleRequestToJoin}
									disabled={hasJoinRequest}
									className={`w-full px-6 py-4 rounded-xl font-bold text-lg shadow-md transition-all duration-200 ${
										hasJoinRequest
											? 'bg-gray-400 text-white cursor-not-allowed'
											: 'bg-gradient-to-r from-pink to-purple text-white hover:shadow-lg hover:scale-[1.02]'
									}`}
								>
									{hasJoinRequest ? 'Solicitação Enviada' : 'Solicitar para Entrar'}
								</button>
							</div>
						)}

						{/* Edit Form */}
						{isEditing && isCaptain && (
							<div className="bg-white rounded-2xl shadow-lg p-6">
								<h3 className="text-2xl font-bold text-purple mb-6 flex items-center gap-2">
									<EditIcon />
									Editar Time
								</h3>
								<form onSubmit={handleEditSubmit} className="space-y-6">
									<div className="space-y-2">
										<label className="font-semibold text-gray-700">Nome do Time:</label>
										<input
											type="text"
											value={editForm.nome}
											onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
											className="w-full border rounded-lg px-4 py-3 text-black bg-white border-gray-400 focus:border-pink focus:outline-none"
											required
										/>
									</div>

									<div className="space-y-2">
										<label className="font-semibold text-gray-700">Descrição:</label>
										<textarea
											rows="4"
											value={editForm.descricao}
											onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
											className="w-full border rounded-lg px-4 py-3 text-black bg-white resize-none border-gray-400 focus:border-pink focus:outline-none"
											required
										/>
									</div>

									<div className="space-y-2">
										<label className="font-semibold text-gray-700">Cores:</label>
										<div className="flex gap-6">
											<div className="flex flex-col items-center gap-2">
												<label className="text-sm text-gray-600">Cor Principal</label>
												<input
													type="color"
													value={editForm.cor1}
													onChange={(e) => setEditForm({ ...editForm, cor1: e.target.value })}
													className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
												/>
											</div>
											<div className="flex flex-col items-center gap-2">
												<label className="text-sm text-gray-600">Cor Secundária</label>
												<input
													type="color"
													value={editForm.cor2}
													onChange={(e) => setEditForm({ ...editForm, cor2: e.target.value })}
													className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
												/>
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<label className="font-semibold text-gray-700">Imagem:</label>
										<div className="flex items-center gap-4">
											{preview && (
												<img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-full border-4 border-purple shadow-md" />
											)}
											<label className="cursor-pointer">
												<input
													type="file"
													accept="image/*"
													onChange={handleImageChange}
													className="hidden"
												/>
												<span className="bg-gradient-to-r from-purple to-pink text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold inline-block">
													Selecionar Imagem
												</span>
											</label>
										</div>
									</div>

									<div className="flex gap-3 justify-end pt-4">
										<button
											type="button"
											onClick={() => setIsEditing(false)}
											className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
										>
											Cancelar
										</button>
										<button
											type="submit"
											className="bg-gradient-to-r from-purple to-pink text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
										>
											Salvar Alterações
										</button>
									</div>
								</form>
							</div>
						)}

						{/* Players List */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-2xl font-bold text-purple flex items-center gap-2">
									<TeamIcon />
									Jogadoras do Time
								</h3>
								<span className="bg-purple/10 text-purple px-4 py-2 rounded-full font-bold">
									{jogadoras.length} {jogadoras.length === 1 ? 'jogadora' : 'jogadoras'}
								</span>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
								{jogadoras.length === 0 ? (
									<div className="col-span-full text-center py-12">
										<div className="text-gray-400 mb-3">
											<svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
											</svg>
										</div>
										<span className="text-gray-500 text-lg">Nenhuma jogadora no time ainda</span>
										{isCaptain && (
											<p className="text-gray-400 mt-2">Use o botão &quot;Convidar Jogadoras&quot; para adicionar membros</p>
										)}
									</div>
								) : (
									jogadoras.map((j, idx) => (
										<JogadoraCard 
											key={j.userId || idx} 
											nomeCompleto={j.nomeCompleto} 
											pernaDominante={j.pernaDominante || ''} 
											posicao={j.posicao}
											userId={j.userId}
											onViewProfile={(userId) => router.push(`/perfil/${userId}`)}
										/>
									))
								)}
							</div>
						</div>
					</div>

					{/* Chat Section - Right side - Only visible to team members */}
					{isMember && (
						<div className="lg:w-96 flex-shrink-0">
							<TeamChat teamId={id} userId={userId} />
						</div>
					)}
				</div>
			</div>
		</MainContainer>
            </>
        </AuthGuard>
	);
}
