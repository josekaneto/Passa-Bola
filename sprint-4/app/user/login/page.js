'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import VoltarButton from "../../Components/VoltarButton";
import Input from "../../Components/Input";

function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        setSucesso("");
        if (!email || !senha) {
            setErro("Preencha todos os campos.");
            return;
        }
        // Busca usuários no localStorage
        const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
        if (!usuarios.length) {
            setErro("Nenhum usuário cadastrado. Cadastre-se primeiro!");
            return;
        }
        const usuario = usuarios.find(u => u.email === email && u.senha === senha);
        if (usuario) {
            setErro("");
            setSucesso("Login realizado com sucesso!");
            // Redireciona para página exclusiva do usuário
            window.location.href = `/inicioposlogin/${usuario.id}`;
        } else {
            setErro("Email ou senha inválidos.");
        }
    };

    return (
        <div className="w-full min-h-screen lg:bg-[url('/campo.png')] lg:bg-cover lg:bg-center flex items-center justify-center bg-none font-corpo">
            <div className="mx-auto w-full max-w-3xl md:max-w-6xl bg-white/90 bg-opacity-90 rounded-3xl flex flex-col justify-center items-center py-10 px-4 md:px-10">
                <div className="w-3/4 flex justify-end">
                    <VoltarButton onClick={() => router.back()} />
                </div>
                <div className="w-3/4 flex flex-col gap-10">
                    <img className="w-24 md:w-32 mx-auto md:mx-0" src="/Logo.svg" alt="Logo Passa Bola Branca" />
                    <h2 className="text-2xl md:text-4xl font-bold text-center md:text-left font-title">Entrar</h2>
                </div>
                <form id="loginForm" className="w-3/4 flex flex-col gap-6 mt-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-8 w-full">
                        <Input
                            name="email"
                            className="w-full py-2 border-b-2 border-gray-400 focus:border-pink-500 focus:outline-none"
                            type="email"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <Input
                            name="senha"
                            className="w-full py-2 border-b-2 border-gray-400 focus:border-pink-500 focus:outline-none"
                            type="password"
                            placeholder="Senha"
                            required
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                        />
                    </div>
                    <div className="w-full flex justify-end">
                        <Link
                            className="text-center text-lg text-pink"
                            href={`/user/login/esqueciMinhaSenha/${email}`}
                        >
                            Esqueci minha senha?
                        </Link> 
                    </div>
                    <button className="bg-pink text-white py-3 rounded-lg font-bold text-center hover:bg-pink/90 hover:scale-105 cursor-pointer duration-300" type="submit">Entrar</button>
                    {erro ? (
                        <p className="text-center text-red-500 text-lg">{erro}</p>
                    ) : null}
                    {sucesso ? (
                        <p className="text-center text-green-600 text-lg">{sucesso}</p>
                    ) : null}
                    <div className="w-full flex justify-center py-6 rounded-lg">
                        <p className="text-lg text-center">Não tem uma conta? 
                            <Link className="text-pink font-bold" href="/user/cadastro"> Cadastre-se </Link>
                        </p>
                    </div>
                    <div className="w-full flex justify-center">
                        <Link href="#" className="w-full md:w-1/2 flex items-center justify-center gap-x-3 py-3 text-lg border-2 border-pink rounded-xl">
                            <img src="/google.png" alt="Google" />
                            Entrar com o Google
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;