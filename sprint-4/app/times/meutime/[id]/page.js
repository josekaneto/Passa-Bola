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
			<div className="w-full max-w-[1400px] flex flex-col lg:flex-row gap-6">
				<SectionContainer tamanho={800}>
                <div className="w-full flex justify-end mb-4">
                    <VoltarButton onClick={async (e) => {
                        e?.preventDefault?.();
                        try {
                            console.log('VoltarButton clicked. Current userId:', userId);
                            console.log('Current id from params:', id);
                            
                            if (userId) {
                                console.log('Navigating to /times/' + userId);
                                router.push(`/times/${userId}`);
                                return;
                            }
                            
                            // Fallback: try to get userId from localStorage or fetch it
                            const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
                            console.log('Auth token exists:', !!authToken);
                            
                            if (authToken) {
                                try {
                                    const res = await fetch('/api/auth/me', {
                                        headers: {
                                            'Authorization': `Bearer ${authToken}`
                                        }
                                    });
                                    console.log('API response status:', res.status);
                                    const data = await res.json();
                                    console.log('API response data:', data);
                                    
                                    if (data.user && data.user.id) {
                                        console.log('Navigating to /times/' + data.user.id);
                                        router.push(`/times/${data.user.id}`);
                                    } else {
                                        console.error('No user ID in response:', data);
                                        setAlert({ show: true, message: 'Erro: ID do usuário não encontrado', type: 'error' });
                                    }
                                } catch (fetchError) {
                                    console.error('Error fetching user data:', fetchError);
                                    setAlert({ show: true, message: 'Erro ao buscar dados do usuário: ' + fetchError.message, type: 'error' });
                                }
                            } else {
                                console.error('No auth token found');
                                setAlert({ show: true, message: 'Erro: Token de autenticação não encontrado', type: 'error' });
                            }
                        } catch (error) {
                            console.error('Error in VoltarButton onClick:', error);
                            setAlert({ show: true, message: 'Erro ao navegar: ' + error.message, type: 'error' });
                        }
                    }} />
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
							<span className="mt-2 font-semibold text-gray-700">Jogadoras: <span className="text-purple font-bold text-xl">{jogadoras.length}/{time.maxMembers || 15}</span></span>
						</div>
						<div className="flex flex-col items-end gap-2">
                                <Link className="text-purple font-bold text-sm md:text-base" href={`/times/cadastrartime/convidar/${id}`}>Convidar Jogadoras</Link>
                                <Link className="text-green font-bold text-sm md:text-base" href={`/times/historico/${id}`}>Ver Histórico de Partidas</Link>
								{isCaptain && (
									<>
										<button className="text-blue-600 font-bold text-sm md:text-base hover:underline" onClick={() => setIsEditing(!isEditing)}>
											{isEditing ? 'Cancelar Edição' : 'Editar Time'}
										</button>
										<button className="text-red-600 font-bold text-sm md:text-base hover:underline" onClick={handleDeleteTeam}>
											Excluir Time
										</button>
									</>
								)}
                                <button className="text-red-600 font-bold text-sm md:text-base hover:underline" onClick={handleLeaveTeam}>Sair do time</button>
						</div>
					</div>
					{/* Solicitar para entrar button - only show if user is not captain, not a member, and hasn't already requested */}
					{!isCaptain && !isMember && (
						<div className="mt-4 flex justify-center">
							<button
								onClick={handleRequestToJoin}
								disabled={hasJoinRequest}
								className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-colors duration-200 ${
									hasJoinRequest
										? 'bg-gray-400 text-white cursor-not-allowed'
										: 'bg-pink text-white hover:bg-pink-600'
								}`}
							>
								{hasJoinRequest ? 'Solicitação Enviada' : 'Solicitar para Entrar'}
							</button>
						</div>
					)}
					{isEditing && isCaptain && (
						<div className="my-4 p-4 bg-purple/10 rounded-xl border border-purple/30">
							<h3 className="text-xl font-bold text-purple mb-4">Editar Time</h3>
							<form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									<label className="font-semibold text-gray-700">Nome do Time:</label>
									<input
										type="text"
										value={editForm.nome}
										onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
										className="border rounded-lg px-3 py-2 text-black bg-white border-gray-400 focus:border-pink focus:outline-none"
										required
									/>
								</div>
								<div className="flex flex-col gap-2">
									<label className="font-semibold text-gray-700">Descrição:</label>
									<textarea
										rows="4"
										value={editForm.descricao}
										onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
										className="border rounded-lg px-3 py-2 text-black bg-white resize-none border-gray-400 focus:border-pink focus:outline-none"
										required
									/>
								</div>
								<div className="flex flex-col gap-2">
									<label className="font-semibold text-gray-700">Cores:</label>
									<div className="flex gap-4">
										<div className="flex flex-col items-center">
											<label className="text-sm text-gray-600 mb-1">Cor 1</label>
											<input
												type="color"
												value={editForm.cor1}
												onChange={(e) => setEditForm({ ...editForm, cor1: e.target.value })}
												className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
											/>
										</div>
										<div className="flex flex-col items-center">
											<label className="text-sm text-gray-600 mb-1">Cor 2</label>
											<input
												type="color"
												value={editForm.cor2}
												onChange={(e) => setEditForm({ ...editForm, cor2: e.target.value })}
												className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
											/>
										</div>
									</div>
								</div>
								<div className="flex flex-col gap-2">
									<label className="font-semibold text-gray-700">Imagem:</label>
									<div className="flex items-center gap-4">
										{preview && (
											<img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-full border-2 border-purple" />
										)}
										<label className="cursor-pointer">
											<input
												type="file"
												accept="image/*"
												onChange={handleImageChange}
												className="hidden"
											/>
											<span className="bg-purple text-white px-4 py-2 rounded-lg hover:bg-pink transition-colors">
												Selecionar Imagem
											</span>
										</label>
									</div>
								</div>
								<div className="flex gap-2 justify-end">
									<button
										type="button"
										onClick={() => setIsEditing(false)}
										className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
									>
										Cancelar
									</button>
									<button
										type="submit"
										className="bg-purple text-white px-6 py-2 rounded-lg hover:bg-pink transition-colors"
									>
										Salvar Alterações
									</button>
								</div>
							</form>
						</div>
					)}
					<hr className="my-4 border-gray-300 rounded-xl" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[350px] overflow-y-auto pb-2">
							{jogadoras.length === 0 ? (
								<span className="text-gray-500">Nenhuma jogadora convidada.</span>
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
			</SectionContainer>
			{/* Chat Section - Right side - Only visible to team members */}
			{isMember && (
				<div className="w-full lg:w-[400px] flex-shrink-0">
					<TeamChat teamId={id} userId={userId} />
				</div>
			)}
		</div>
		</MainContainer>
            </>
        </AuthGuard>
	);
}
