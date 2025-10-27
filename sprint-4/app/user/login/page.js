"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import VoltarButton from "../../Components/VoltarButton";
import Input from "../../Components/Input";
import LoadingScreen from "../../Components/LoadingScreen";
import AOS from "aos";
import "aos/dist/aos.css";

function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });

        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); // Simula 1.5 segundos de carregamento inicial

        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErro("");
        setSucesso("");
        setIsSubmitting(true);

        if (!email || !senha) {
            setErro("Preencha todos os campos.");
            setIsSubmitting(false);
            return;
        }

        // Simula uma chamada de API
        setTimeout(() => {
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            if (!usuarios.length) {
                setErro("Nenhum usuário cadastrado. Cadastre-se primeiro!");
                setIsSubmitting(false);
                return;
            }

            const usuario = usuarios.find(u => u.email === email && u.senha === senha);
            if (usuario) {
                setErro("");
                setSucesso("Login realizado com sucesso! Redirecionando...");
                // Redireciona após mostrar a mensagem de sucesso
                setTimeout(() => {
                    router.push(`/inicioposlogin/${usuario.id}`);
                }, 1000);
            } else {
                setErro("Email ou senha inválidos.");
                setIsSubmitting(false);
            }
        }, 1000); // Simula 1 segundo de espera para o login
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="w-full min-h-screen lg:bg-[url('/campo.png')] lg:bg-cover lg:bg-center flex items-center justify-center bg-none font-corpo p-4">
            <div className="mx-auto w-full max-w-3xl md:max-w-6xl bg-white/90 bg-opacity-90 rounded-3xl flex flex-col justify-center items-center py-10 px-4 md:px-10" data-aos="zoom-in">
                <div className="w-3/4 flex justify-end">
                    <VoltarButton onClick={() => router.back()} />
                </div>

                <div className="w-3/4 flex flex-col gap-10">
                    <img className="w-24 md:w-32 mx-auto md:mx-0" src="/Logo.svg" alt="Logo Passa Bola Branca" data-aos="fade-down" data-aos-delay="200" />
                    <h2 className="text-2xl md:text-4xl font-bold text-center md:text-left font-title" data-aos="fade-right" data-aos-delay="300">Entrar</h2>
                </div>

                <form id="loginForm" className="w-3/4 flex flex-col gap-6 mt-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-8 w-full" data-aos="fade-up" data-aos-delay="400">
                        <Input
                            name="email"
                            className="w-full py-2 border-b-2 border-gray-400 focus:border-pink-500 focus:outline-none"
                            type="email"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <Input
                            name="senha"
                            className="w-full py-2 border-b-2 border-gray-400 focus:border-pink-500 focus:outline-none"
                            type="password"
                            placeholder="Senha"
                            required
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="w-full flex justify-end" data-aos="fade-up" data-aos-delay="500">
                        <Link className={`text-center text-lg text-pink ${isSubmitting ? 'pointer-events-none' : ''}`} href={`/user/login/esqueciMinhaSenha/${email}`}>
                            Esqueci minha senha?
                        </Link>
                    </div>

                    <button
                        className="bg-pink text-white py-3 rounded-lg font-bold text-center cursor-pointer hover:border-green border disabled:opacity-75 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={isSubmitting}
                        data-aos="fade-up" data-aos-delay="600"
                    >
                        {isSubmitting ? "Entrando..." : "Entrar"}
                    </button>

                    {erro && <p className="text-center text-red-500 text-lg">{erro}</p>}
                    {sucesso && <p className="text-center text-green-600 text-lg">{sucesso}</p>}

                    <div className="w-full flex justify-center py-6 rounded-lg" data-aos="fade-up" data-aos-delay="700">
                        <p className="text-lg text-center">Não tem uma conta?
                            <Link className={`text-pink font-bold ${isSubmitting ? 'pointer-events-none' : ''}`} href="/user/cadastro"> Cadastre-se </Link>
                        </p>
                    </div>

                    <div className="w-full flex justify-center" data-aos="fade-up" data-aos-delay="800">
                        <Link href="#" className={`w-full md:w-1/2 flex items-center justify-center gap-x-3 py-3 text-lg border-2 border-pink rounded-xl ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}>
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