"use client";
import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import { useParams, useRouter } from "next/navigation";

export default function EsqueciMinhaSenha() {
    const { id } = useParams();
    const [email, setEmail] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Pega o email do parâmetro da URL
        setEmail(id || "");
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setErro("");
        try {
            await emailjs.send(
                "service_5v1p42q",
                "template_yac7cdw",
                {
                    to_email: email,
                },
                "Rkmh0Mj2yBUfq8CCY" // Defina sua public key no .env
            );
            router.push("/user/login");
        } catch (err) {
            setErro("Erro ao enviar o e-mail. Tente novamente.");
        }
        setEnviando(false);
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-purple-700 mb-6 text-center">Recuperar Senha</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label className="font-semibold text-gray-700">
                        E-mail cadastrado:
                        <input
                            type="email"
                            className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={enviando}
                        className="bg-purple-700 text-white font-bold py-2 rounded-lg mt-4 hover:bg-purple-800 transition disabled:opacity-60"
                    >
                        {enviando ? "Enviando..." : "Enviar link de recuperação"}
                    </button>
                    {erro && <span className="text-red-500 text-sm">{erro}</span>}
                </form>
            </div>
        </div>
    );
}