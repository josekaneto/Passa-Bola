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
import AOS from "aos";
import "aos/dist/aos.css";

export default function PaginaUsuario() {
    const [loading, setLoading] = useState(true);
    const [noticias, setNoticias] = useState([]);
    const [loadingNoticias, setLoadingNoticias] = useState(true);
    const [errorNoticias, setErrorNoticias] = useState(false);
    const { id: usuarioId } = useParams();

    const links = [
        { label: "Inicio", href: `/inicioposlogin/${usuarioId}` },
        { label: "Perfil", href: `/perfil/${usuarioId}` },
        { label: "Times", href: `/times/${usuarioId}` },
        { label: "Loja", href: `/loja/${usuarioId}` },
        { label: "Copas PAB", href: `/copasPab/${usuarioId}` },
        { label: "Sair", href: "/" }
    ];

    useEffect(() => {
        AOS.init({ once: true });
        setLoading(true);
        setTimeout(() => setLoading(false), 500);
    }, []);

    useEffect(() => {
        async function fetchNoticias() {
            try {
                setLoadingNoticias(true);
                const response = await fetch('https://newsapi.org/v2/everything?q=Women-Super-League&apiKey=30939f006bd6433e930278b2aaa79a09');
                const data = await response.json();

                if (data.articles && data.articles.length > 0) {
                    setNoticias(data.articles.slice(0, 6));
                } else {
                    setNoticias([]);
                }
                setLoadingNoticias(false);
            } catch (error) {
                console.error('Erro ao buscar notícias:', error);
                setErrorNoticias(true);
                setLoadingNoticias(false);
            }
        }

        fetchNoticias();
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

                {/* Seção de Notícias - 2 COLUNAS */}
                <section className="py-16 bg-gradient-to-br from-purple/10 via-pink/10 to-purple/10 w-full">
                    <div className="container mx-auto px-4">
                        <h2
                            className="text-4xl font-bold text-center font-title text-gray-800 mb-4"
                            data-aos="fade-up"
                        >
                            Últimas Notícias do Futebol Feminino
                        </h2>
                        <p
                            className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
                            data-aos="fade-up"
                            data-aos-delay="100"
                        >
                            Fique por dentro das principais novidades da Women`s Super League
                        </p>

                        <div className="max-w-6xl mx-auto px-4 md:px-10">
                            {loadingNoticias ? (
                                // Loading skeleton - 2 colunas
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 items-start bg-white/80 border border-purple rounded-lg shadow-sm p-4 md:p-6 animate-pulse"
                                        >
                                            <div className="w-24 h-24 bg-gray-300 rounded-md flex-shrink-0"></div>
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-300 rounded w-full"></div>
                                                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : errorNoticias ? (
                                <div className="text-center py-10">
                                    <p className="text-red-600 font-semibold">Erro ao carregar notícias. Tente novamente mais tarde.</p>
                                </div>
                            ) : noticias.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-600">Nenhuma notícia encontrada no momento.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {noticias.map((article, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 items-start bg-white/80 border border-purple rounded-lg shadow-sm p-4 md:p-6 hover:shadow-lg transition"
                                            data-aos="fade-up"
                                            data-aos-delay={index * 100}
                                        >
                                            <img
                                                src={article.urlToImage || '/Logo-preta.png'}
                                                alt="Imagem da notícia"
                                                className="w-24 h-24 object-cover rounded-md border border-gray-200 flex-shrink-0"
                                                onError={(e) => { e.target.src = '/Logo-preta.png'; }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base md:text-lg text-purple mb-1 line-clamp-2">
                                                    {article.title}
                                                </h3>
                                                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                                    {article.description || 'Sem descrição disponível'}
                                                </p>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                    <a
                                                        href={article.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-pink text-xs underline font-semibold hover:text-pink/80 transition"
                                                    >
                                                        Leia mais
                                                    </a>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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