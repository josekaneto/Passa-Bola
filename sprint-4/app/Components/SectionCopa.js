"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function SectionCopa() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Verifica se o usuário está logado
        const checkAuth = () => {
            try {
                // Verifica se está no lado do cliente
                if (typeof window === 'undefined') {
                    return;
                }

                // Verifica no localStorage
                const user = localStorage.getItem('user_id');
                const token = localStorage.getItem('auth_token');

                // Ou verifica no sessionStorage (se você usar)
                const sessionUser = sessionStorage.getItem('user_id');
                const sessionToken = sessionStorage.getItem('auth_token');

                if ((user && token) || (sessionUser && sessionToken)) {
                    setIsLoggedIn(true);
                    // Define o ID do usuário
                    setUserId(user || sessionUser);
                } else {
                    setIsLoggedIn(false);
                    setUserId(null);
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                setIsLoggedIn(false);
                setUserId(null);
            }
        };

        // Executa após o componente montar no cliente
        checkAuth();
    }, []);

    // Define o link baseado no status de login
    const buttonLink = isLoggedIn && userId ? `/times/${userId}` : "/user/login";

    return (
        <section
            className="bg-pink py-16"
            aria-labelledby="copa-title"
        >
            <div
                className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 text-center"
                data-aos="fade-up"
                data-aos-duration="1000"
            >
                <h2
                    id="copa-title"
                    className="text-white font-title text-3xl sm:text-4xl md:text-5xl"
                >
                    PREPARADA PARA MUDAR O JOGO?
                </h2>

                <p className="mt-6 text-white mx-auto max-w-2xl text-sm sm:text-base">
                    Garanta sua vaga e faça parte da transformação do futebol feminino. Unidas, somos imparáveis!
                </p>

                <Link
                    href={buttonLink}
                    role="button"
                    aria-label="Inscreva-se na Copa Passa Bola 2025"
                    className="inline-flex items-center justify-center mt-8 bg-green text-black font-bold rounded-md px-6 py-3 shadow-md hover:scale-105 transition-transform duration-500"
                >
                    INSCREVA-SE NA COPA PASSA BOLA!
                    <span className="ml-3 text-2xl leading-none">➪</span>
                </Link>
            </div>
        </section>
    );
}