import Link from "next/link";
import React from "react";

export default function SectionCopa() {
    return (
        <section
            className="bg-pink py-16"
            aria-labelledby="copa-title"
        >
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 text-center"
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
                    Garanta sua vaga e faça parte da transformação do futebol feminino. 
                    Unidas, somos imparáveis!
                </p>

                <Link
                    href="/user/cadastro"
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