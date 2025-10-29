"use client";
import React, { useState } from "react";
import VoltarButton from "../../Components/VoltarButton";
import Input from "../../Components/Input";
import { useRouter } from "next/navigation";

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

        try {
            // Call MongoDB API
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle error response
                setErro(data.error || 'Erro ao criar conta');
                setIsSubmitting(false);
                return;
            }

            // Success! Save token and redirect
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_id', data.user.id);
            }
            
            // Redirect to login page
            window.location.href = "/user/login";
        } catch (error) {
            console.error('Registration error:', error);
            setErro('Erro ao conectar com o servidor. Tente novamente.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-svh lg:bg-[url('/campo.jpg')] lg:bg-cover lg:bg-center flex items-center justify-center bg-none font-corpo">
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
                        <Input name="pernaDominante" type="text" placeholder="Perna dominante" value={form.pernaDominante} onChange={handleChange} required disabled={isSubmitting} />
                        <Input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required disabled={isSubmitting} />
                        <Input name="confirmacaoSenha" type="password" placeholder="Confirmação de senha" value={form.confirmacaoSenha} onChange={handleChange} required disabled={isSubmitting} />
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