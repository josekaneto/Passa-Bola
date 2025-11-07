"use client";
import Header from "@/app/Components/Header";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "@/app/Components/LoadingScreen";
import AuthGuard from "@/app/Components/AuthGuard";
import ContactSection from "@/app/Components/ContactSection";
import SectionCopa from "@/app/Components/SectionCopa";
import Footer from "@/app/Components/Footer";
import { FaArrowDown, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import ProfileSection from "@/app/Components/ProfileSection";
import Link from "next/link";

export default function PaginaUsuario() {
    const [loading, setLoading] = useState(true);
    const { id: usuarioId } = useParams();

    
    const links = [
        { label: "Inicio", href: `/inicioposlogin/${usuarioId}` },
        { label: "Perfil", href: `/perfil/${usuarioId}` },
        { label: "Times", href: `/times/${usuarioId}` },
        { label: "Loja", href: `/loja/${usuarioId}` },
        { label: "Copas PAB", href: `/copasPab/${usuarioId}` },
        { label: "Sair", href: "/"}
    ];
    useEffect(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 500);
    }, []);
    if (loading) {
        return <LoadingScreen />;
    }
    
    return (
        <AuthGuard>
            <main className="flex wf min-h-screen flex-col bg-gray-100 text-gray-800 font-corpo overflow-x-hidden">
                <section className="w-full min-h-screen bg-center bg-no-repeat bg-cover bg-[url(/bg2.png)] flex flex-col items-center relative font-corpo">
                    <Header links={links} />
                    <div
                        className="w-full max-w-[80%] px-4 sm:px-6 flex flex-col justify-center items-center sm:items-start absolute top-0 left-1/2 -translate-x-1/2 h-full"
                        data-aos="fade-right"
                        data-aos-duration="1200"
                    >
                        <span className="bg-pink text-white px-3 py-1 rounded-full mb-4 text-sm font-semibold" data-aos="fade-right" data-aos-delay="200">
                            Passa Bola
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-bold font-title text-white mb-6 w-full md:w-1/2" data-aos="fade-right" data-aos-delay="400">
                            ELAS NO COMANDO: O FUTURO DO FUTEBOL COMEÇA AQUI
                        </h1>
                        <p className="text-base sm:text-lg text-white w-full sm:w-4/5 md:w-7/12" data-aos="fade-right" data-aos-delay="600">
                            Passa Bola conecta, promove e dá voz ao futebol feminino no Brasil. Produzimos conteúdo e eventos que geram oportunidades para atletas, clubes e torcedores.
                        </p>
                        <Link
                            href={`/times/${usuarioId}`}
                            className="mt-6 bg-purple text-white font-semibold px-5 py-3 rounded-xl hover:scale-105 duration-500 transition-transform"
                        >
                            Venha fazer parte dessa história!
                        </Link>
                    </div>
                    <div
                        className="absolute bottom-20 z-10 flex flex-col items-center gap-2 text-white"
                        data-aos="fade-up"
                        data-aos-delay="500"
                    >
                        <span className="text-sm animate-bounce text-green font-bold">Role para saber mais</span>
                        <FaArrowDown className="animate-bounce text-green" />
                    </div>
                </section>

                <section className="w-full py-10 flex flex-col items-center justify-center relative overflow-visible px-4 sm:px-6">
                    <div className="mx-auto w-full max-w-[80%] px-0 sm:px-0">
                        <h2 className="text-4xl font-bold text-center font-title text-gray-800 mb-8" data-aos="fade-up" data-aos-duration="1000">
                            Conheça as Vozes por Trás da Copa PAB
                        </h2>
                        <p className="text-center text-lg text-gray-700 max-w-2xl mx-auto mb-10" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                            A Copa PAB é mais do que um torneio; é uma celebração do talento, da paixão e da representatividade feminina no futebol. Conheça as jornalistas que estão liderando essa transformação e inspirando futuras gerações.
                        </p>

                        <ProfileSection
                            src="/Luana.jpg"
                            alt="Luana Maluf"
                            text="Luana Maluf é uma das principais vozes femininas do jornalismo esportivo brasileiro. Com uma carreira marcada por dedicação, carisma e conhecimento, Luana se destaca na cobertura de futebol, trazendo análises precisas e uma abordagem inspiradora sobre o protagonismo das mulheres no esporte. Sua presença nos campos e transmissões é sinônimo de credibilidade e paixão pelo futebol."
                            reverse
                        />

                        <ProfileSection
                            src="/Ale.jpeg"
                            alt="Ale Xavier"
                            text="Ale Xavier é uma das vozes mais influentes do jornalismo esportivo brasileiro. Comunicadora autêntica e engajada, inspira novas gerações com sua paixão pelo futebol e pela representatividade feminina. Reconhecida por sua atuação em projetos sociais e defesa da igualdade de gênero, Ale transforma o esporte em um espaço de inclusão, inspiração e protagonismo para as mulheres."
                        />
                    </div>
                </section>

                <section className="py-16 sm:py-20 bg-purple w-full">
                    <div className="container mx-auto px-4 text-center" data-aos="fade-up">
                        <h2 className="text-4xl font-bold text-white mb-12 font-title">Nossas Redes, Nossa Voz</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <Link href="https://www.youtube.com/@passabola" target="_blank" rel="noopener noreferrer" className="group block p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                <FaYoutube className="text-6xl text-red-600 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-800 mb-2 font-title">YouTube</h3>
                                <p className="text-gray-600">Acompanhe nossos podcasts, debates e análises exclusivas sobre o universo do futebol feminino.</p>
                            </Link>
                            <Link href="https://www.instagram.com/passaabola" target="_blank" rel="noopener noreferrer" className="group block p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                <FaInstagram className="text-6xl text-pink-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-800 mb-2 font-title">Instagram</h3>
                                <p className="text-gray-600">Fique por dentro de tudo sobre o futebol feminino, notícias, bastidores da copa e muito mais.</p>
                            </Link>
                            <Link href="https://www.tiktok.com/@passabola" target="_blank" rel="noopener noreferrer" className="group block p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                <FaTiktok className="text-6xl text-blue-400 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-800 mb-2 font-title">TikTok</h3>
                                <p className="text-gray-600">Divirta-se com nossos desafios, acompanhe a rotina das jogadoras e veja os lances mais criativos.</p>
                            </Link>
                        </div>
                    </div>
                </section>

                <ContactSection />
                <SectionCopa />
                <Footer links={links} />
            </main>
        </AuthGuard>
    );
}