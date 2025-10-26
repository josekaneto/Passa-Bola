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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.senha !== form.confirmacaoSenha) {
            setErro("As senhas não coincidem.");
            return;
        }
        setErro("");
        // Gerar ID aleatório
    const id = Math.random().toString(36).substring(2, 18);
        // Salvar usuário no localStorage
        const usuario = { ...form, id };
        // Recupera lista existente ou inicia nova
        const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
        usuarios.push(usuario);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        // Redirecionar para tela de login
        window.location.href = "/user/login";
    };

    return (
        <div className="w-full min-h-svh lg:bg-[url('/campo.jpg')] lg:bg-cover lg:bg-center flex items-center justify-center bg-none font-corpo">
            <div className="mx-auto w-full max-w-3xl md:max-w-6xl bg-white/90 bg-opacity-90 rounded-3xl flex flex-col justify-center items-center py-8 px-4 md:px-10">
                <div className="w-3/4 flex justify-end">
                    <VoltarButton onClick={() => router.back()} />
                </div>
                <div className="w-3/4 flex flex-col gap-10">
                    <img className="w-24 md:w-32 mx-auto md:mx-0" src="/Logo.svg" alt="Logo Passa Bola Preta" />
                    <h2 className="text-2xl md:text-4xl font-bold text-center md:text-left font-title">Cadastre-se</h2>
                </div>
                <form onSubmit={handleSubmit} className="w-3/4 flex flex-col gap-6 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                        <Input name="nomeCompleto" type="text" placeholder="Nome completo" value={form.nomeCompleto} onChange={handleChange} required />
                        <Input name="dataNascimento" type="date" placeholder="Data de nascimento" value={form.dataNascimento} onChange={handleChange} required />
                        <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                        <Input name="telefone" type="tel" placeholder="Número do telefone" value={form.telefone} onChange={handleChange} required />
                        <Input name="nomeCamisa" type="text" placeholder="Nome na camisa" value={form.nomeCamisa} onChange={handleChange} required />
                        <Input name="numeroCamisa" type="number" placeholder="Número da camisa" value={form.numeroCamisa} onChange={handleChange} required />
                        <Input name="posicao" type="text" placeholder="Posição" value={form.posicao} onChange={handleChange} required />
                        <Input name="altura" type="number" placeholder="Altura (cm)" value={form.altura} onChange={handleChange} required />
                        <Input name="peso" type="number" placeholder="Peso (kg)" value={form.peso} onChange={handleChange} required />
                        <Input name="pernaDominante" type="text" placeholder="Perna dominante" value={form.pernaDominante} onChange={handleChange} required />
                        <Input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required />
                        <Input name="confirmacaoSenha" type="password" placeholder="Confirmação de senha" value={form.confirmacaoSenha} onChange={handleChange} required />
                    </div> 
                    <button className="bg-pink-500 text-white text-center py-3 rounded-lg font-bold w-full text-lg hover:bg-pink-500/90 hover:scale-105 cursor-pointer duration-300" type="submit" >Criar</button>
                    {erro && <p className="text-center text-red-500 text-lg">{erro}</p>}
                    <p className="text-center text-lg">Já tem uma conta? <a className="text-pink font-bold" href="/user/login">Entrar</a></p>
                </form>
            </div>
        </div>
    );
}

export default CadastreSe;