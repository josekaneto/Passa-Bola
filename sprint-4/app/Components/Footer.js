import Link from "next/link";
import React, { useState } from "react";

export default function Footer({links}) {
    const year = new Date().getFullYear();
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Inscrito:", email);
        setEmail("");
    };

    return (
        <footer className="w-full bg-white font-corpo">
            <div className="mx-auto w-full max-w-[80%] px-4 sm:px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <img src="/Logo.svg" alt="Logo Passa Bola" className="w-14 md:w-16" />
                            <h3 className="text-3xl font-bold font-title text-pink">Passa Bola</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                            Usamos o futebol como ferramenta de representatividade e transformação,
                            fortalecendo a presença feminina no esporte e nas mídias com conteúdo autêntico.
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <a href="https://www.instagram.com/passaabola/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-purple hover:scale-105 transition">
                                <img src="/instagram.svg" alt="Instagram" className="w-5 h-5" />
                            </a>
                            <a href="https://www.tiktok.com/@passabola" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-purple hover:scale-105 transition">
                                <img src="/tiktok.svg" alt="TikTok" className="w-5 h-5" />
                            </a>
                            <a href="https://twitter.com/passaabola" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-purple hover:scale-105 transition">
                                <img src="/twitter.svg" alt="Twitter" className="w-5 h-5" />
                            </a>
                            <a href="https://youtube.com/@passabola?si=qw6PM39NS-g8ZIMe" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-purple hover:scale-105 transition">
                                <img src="/youtube.svg" alt="YouTube" className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <nav aria-label="Links principais" className="flex flex-col gap-2">
                        <h4 className="font-semibold text-2xl text-pink font-title">Links Úteis</h4>
                        <ul className="flex flex-col gap-2 text-sm text-gray-700">
                            {links.map((link) => (
                                <li key={link.href} className="relative group">
                                    <Link href={link.href} className="hover:text-pink transition-colors duration-300">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Recursos */}
                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold text-2xl text-pink font-title">Recursos</h4>
                        <ul className="flex flex-col gap-2 text-sm text-gray-700">
                            <li><Link href="#" className="hover:underline">Parceiros</Link></li>
                            <li><Link href="#" className="hover:underline">Mídia Kit</Link></li>
                            <li><Link href="#" className="hover:underline">FAQ</Link></li>
                            <li><Link href="#" className="hover:underline">Termos</Link></li>
                            <li><Link href="#" className="hover:underline">Privacidade</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter (última coluna) */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-semibold text-2xl text-pink font-title">Newsletter</h4>
                        <p className=" text-gray-700">Receba novidades e conteúdo exclusivo direto no seu e-mail.</p>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
                            <label htmlFor="newsletter-email" className="sr-only">E-mail</label>
                            <input
                                id="newsletter-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Seu e-mail"
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-1 focus:ring-pink-500"
                            />
                            <button type="submit" className="px-4 py-2 bg-green text-black font-semibold rounded-md text-sm hover:scale-105 transition-transform duration-500">
                                Assinar
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-10 border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 text-center md:text-left">© {year} Passa Bola Media. Todos os direitos reservados.</p>
                    <ul className="flex gap-4 text-xs text-gray-600">
                        <li><a href="/privacidade" className="hover:underline">Política de Privacidade</a></li>
                        <li><a href="/termos" className="hover:underline">Termos de Uso</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}