"use client";
import React, { useState } from "react";
import VoltarButton from "../../Components/VoltarButton";
import Input from "../../Components/Input";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import CustomAlert from "../../Components/CustomAlert";

function CadastreSe() {
    const router = useRouter();
    const [form, setForm] = useState({
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
        senha: "",
        confirmacaoSenha: ""
    });
    const [erro, setErro] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");
        setIsSubmitting(true);

        // Client-side validation
        if (form.senha !== form.confirmacaoSenha) {
            setErro("As senhas não coincidem.");
            setIsSubmitting(false);
            return;
        }

        // Validate and normalize pernaDominante (case-insensitive)
        const pernaDominanteLower = form.pernaDominante.trim().toLowerCase();
        let normalizedPernaDominante = null;
        
        if (pernaDominanteLower === 'direita') {
            normalizedPernaDominante = 'Direita';
        } else if (pernaDominanteLower === 'esquerda') {
            normalizedPernaDominante = 'Esquerda';
        } else {
            setAlert({ 
                show: true, 
                message: 'Perna dominante deve ser "Direita" ou "Esquerda"', 
                type: 'error' 
            });
            setIsSubmitting(false);
            return;
        }

        // Prepare form data with normalized pernaDominante
        const formData = {
            ...form,
            pernaDominante: normalizedPernaDominante
        };

        try {
            // Call MongoDB API
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle error response
                setAlert({
                    show: true,
                    message: data.error || 'Erro ao criar conta',
                    type: 'error'
                });
                setIsSubmitting(false);
                return;
            }

            // Success! Show success message
            setAlert({
                show: true,
                message: 'Conta criada com sucesso! Redirecionando...',
                type: 'success'
            });

            // Success! Save token and redirect after 2 seconds
            if (data.token && data.user && data.user.id) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_id', data.user.id);

                setTimeout(() => {
                    window.location.href = `/inicioposlogin/${data.user.id}`;
                }, 2000);
            } else {
                setTimeout(() => {
                    window.location.href = "/user/login";
                }, 2000);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setAlert({
                show: true,
                message: 'Erro ao conectar com o servidor. Tente novamente.',
                type: 'error'
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-svh lg:bg-[url('/campo.jpg')] lg:bg-cover lg:bg-center flex items-center justify-center bg-none font-corpo">
            <CustomAlert 
                show={alert.show} 
                message={alert.message} 
                type={alert.type} 
                onClose={() => setAlert({ show: false, message: "", type: "info" })} 
            />
            <div className="mx-auto w-full max-w-3xl md:max-w-6xl bg-white/90 bg-opacity-90 rounded-3xl flex flex-col justify-center items-center py-8 px-4 md:px-10" data-aos="fade-down" data-aos-delay="100">
                <div className="w-3/4 flex justify-end" data-aos="fade-down" data-aos-delay="150">
                    <VoltarButton onClick={() => router.back()} />
                </div>
                <div className="w-3/4 flex flex-col gap-10">
                    <img className="w-24 md:w-32 mx-auto md:mx-0" src="/Logo.svg" alt="Logo Passa Bola Preta" data-aos="zoom-in" data-aos-delay="200" />
                    <h2 className="text-2xl md:text-4xl font-bold text-center md:text-left font-title" data-aos="fade-down" data-aos-delay="250">Cadastre-se</h2>
                </div>
                <form onSubmit={handleSubmit} className="w-3/4 flex flex-col gap-6 mt-8" data-aos="fade-down" data-aos-delay="300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        <Input name="nomeCompleto" type="text" placeholder="Nome completo" value={form.nomeCompleto} onChange={handleChange} required disabled={isSubmitting} />
                        <Input name="dataNascimento" type="text" placeholder="Data de nascimento (DD/MM/AAAA)" value={form.dataNascimento} onChange={handleChange} required mask="date" disabled={isSubmitting} />                        <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={isSubmitting} />
                        <Input name="telefone" type="tel" placeholder="Número do telefone" value={form.telefone} onChange={handleChange} required disabled={isSubmitting} />
                        <Input name="nomeCamisa" type="text" placeholder="Nome na camisa" value={form.nomeCamisa} onChange={handleChange} required disabled={isSubmitting} />
                        <Input name="numeroCamisa" type="number" placeholder="Número da camisa" value={form.numeroCamisa} onChange={handleChange} required disabled={isSubmitting} />
                        <Input name="posicao" type="text" placeholder="Posição" value={form.posicao} onChange={handleChange} required disabled={isSubmitting} />
                        <Input name="altura" type="number" placeholder="Altura (cm)" value={form.altura} onChange={handleChange} required disabled={isSubmitting} />
                        <Input name="peso" type="number" placeholder="Peso (kg)" value={form.peso} onChange={handleChange} required disabled={isSubmitting} />
                        <Input name="pernaDominante" type="text" placeholder="Perna dominante (Direita ou Esquerda)" value={form.pernaDominante} onChange={handleChange} required disabled={isSubmitting} />
                        <div className="relative">
                            <Input name="senha" type={showPassword ? "text" : "password"} placeholder="Senha" value={form.senha} onChange={handleChange} required disabled={isSubmitting} />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-lg text-gray-600 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                        <div className="relative">
                            <Input name="confirmacaoSenha" type={showConfirmPassword ? "text" : "password"} placeholder="Confirmação de senha" value={form.confirmacaoSenha} onChange={handleChange} required disabled={isSubmitting} />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-lg text-gray-600 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                    </div>
                    <button className={`bg-pink-500 text-white text-center py-3 rounded-lg font-bold w-full text-lg hover:border-green border cursor-pointer ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`} type="submit" data-aos="zoom-in" data-aos-delay="400" disabled={isSubmitting}>
                        {isSubmitting ? 'Criando...' : 'Criar'}
                    </button>
                    {erro && <p className="text-center text-red-500 text-lg" data-aos="fade-down" data-aos-delay="450">{erro}</p>}
                    <p className="text-center text-lg">Já tem uma conta? <a className="text-pink font-bold" href="/user/login">Entrar</a></p>
                </form>
            </div>
        </div>
    );
}

export default CadastreSe;