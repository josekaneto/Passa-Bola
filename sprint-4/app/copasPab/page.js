'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaArrowDown, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import AOS from "aos";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "aos/dist/aos.css";
import ContactSection from '../Components/ContactSection';
import SectionCopa from '../Components/SectionCopa';
import RoadmapItem from '../Components/RoadmapItem';
import LoadingScreen from '../Components/LoadingScreen';

const links = [
    { label: "Início", href: "/" },
    { label: "Copas PAB", href: "/copasPab" },
    { label: "Loja", href: "/loja" },
    { label: "Entrar", href: "/user/login" }
];

const roadmapData = [
    { id: 1, title: "Nasce um Sonho", description: "O Passa a Bola surge para dar voz e visibilidade ao futebol feminino.", isPink: true, isUp: true },
    { id: 2, title: "Marco na Mídia", description: "Ago/2022: Parceria com o YouTube para a transmissão do Paulistão Feminino.", isPink: false, isUp: false },
    { id: 3, title: "A Primeira Copa", description: "Abr/2023: A 1ª edição da Copa PAB une times amadores e vira realidade.", isPink: true, isUp: true },
    { id: 4, title: "Consolidação", description: "2024: O projeto se expande com novas copas, 'Encontros PAB' e a loja oficial.", isPink: false, isUp: false },
    { id: 5, title: "Maior do País", description: "2025: A Copa PAB se firma como o maior torneio amador feminino do país.", isPink: true, isUp: true },
    { id: 6, title: "Próximos Capítulos", description: "2026: Expansão nacional e novas parcerias para fortalecer ainda mais o futebol feminino.", isPink: false, isUp: false }
];

const faqData = [
    {
        id: 1,
        pergunta: "Como posso inscrever meu time na Copa PAB?",
        resposta: "Para inscrever seu time, basta acessar a página de 'Times' através do menu, fazer o cadastro do seu time preenchendo todas as informações necessárias e aguardar a confirmação da organização."
    },
    {
        id: 2,
        pergunta: "Quais são os requisitos para participar?",
        resposta: "A Copa PAB é exclusiva para times femininos amadores. Cada time deve ter no mínimo 11 jogadoras cadastradas, sendo necessário apresentar documentos de identificação de todas as atletas."
    },
    {
        id: 3,
        pergunta: "Qual é o formato da competição?",
        resposta: "A Copa PAB é dividida em fases: classificatória (grupos), oitavas de final, quartas de final, semifinal e final. Todos os jogos seguem as regras oficiais da FIFA para futebol feminino."
    },
    {
        id: 4,
        pergunta: "Onde e quando serão realizados os jogos?",
        resposta: "Os jogos são realizados em diversos campos parceiros na região de São Paulo. O calendário completo com datas, horários e locais será divulgado após o encerramento das inscrições."
    },
    {
        id: 5,
        pergunta: "Quais são as premiações?",
        resposta: "Além do troféu de campeã, oferecemos premiações como: artilheira do campeonato, melhor goleira, revelação da Copa PAB, e prêmios em produtos da nossa loja oficial para as equipes mais bem colocadas."
    }
];

function FAQItem({ pergunta, resposta, isOpen, onClick, delay }) {
    return (
        <div
            className="bg-gray-50 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200"
            data-aos="fade-up"
            data-aos-delay={delay}
        >
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none hover:bg-gray-100 transition-colors"
            >
                <h3 className="font-bold text-lg text-gray-800 pr-4">{pergunta}</h3>
                {isOpen ? (
                    <FaChevronUp className="text-purple flex-shrink-0 text-xl" />
                ) : (
                    <FaChevronDown className="text-purple flex-shrink-0 text-xl" />
                )}
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                    {resposta}
                </div>
            </div>
        </div>
    );
}

export default function CopasPabPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [openFAQ, setOpenFAQ] = useState(null);

    useEffect(() => {
        AOS.init({ once: true });

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const toggleFAQ = (id) => {
        setOpenFAQ(openFAQ === id ? null : id);
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <main className="flex wf min-h-screen flex-col bg-gray-100 text-gray-800 font-corpo overflow-x-hidden">
            {/* 1. Seção Principal (Hero) */}
            <section className="relative flex flex-col min-h-screen">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover z-0"
                >
                    <source src="/video.mp4" type="video/mp4" />
                    Seu navegador não suporta o elemento de vídeo.
                </video>
                <Header links={links} />
                <div className="absolute inset-0 bg-black/60"></div>
                <div
                    className="w-full max-w-[80%] px-4 sm:px-6 flex flex-col justify-center items-center sm:items-start absolute top-0 left-1/2 -translate-x-1/2 h-full text-left"
                    data-aos="fade-right"
                    data-aos-duration="1200"
                >
                    <span className="bg-pink text-white px-3 py-1 rounded-full mb-4 text-sm font-semibold" data-aos="fade-right" data-aos-delay="200">
                        A MAIOR COPA AMADORA DO BRASIL
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold font-title text-white mb-6 w-full md:w-full" data-aos="fade-right" data-aos-delay="400">
                        Copa Passa a Bola 2025
                    </h1>
                    <p className="text-base sm:text-lg text-white w-full sm:w-4/5 md:w-6/12" data-aos="fade-right" data-aos-delay="600">
                        A bola vai rolar novamente no maior palco do futebol feminino amador. Reúna seu time, mostre seu talento e venha competir pela taça mais cobiçada.
                    </p>
                    <Link
                        href="/user/login"
                        className="mt-6 bg-purple text-white font-semibold px-5 py-3 rounded-xl hover:scale-105 duration-500 transition-transform"
                    >
                        Inscreva-se Agora
                    </Link>
                </div>
                <div
                    className="absolute bottom-20 z-10 w-full flex flex-col items-center gap-2 text-white"
                    data-aos="fade-up"
                    data-aos-delay="1000"
                >
                    <span className="text-sm animate-bounce text-green font-bold">Descubra a Jornada</span>
                    <FaArrowDown className="animate-bounce text-green" />
                </div>
            </section>

            <section className="w-fit py-16 sm:py-24 bg-white">
                <div className="w-[80%] mx-auto px-4" data-aos="fade-up">
                    <h2 className="text-4xl font-bold text-center text-gray-800 mb-16 font-title">De um Sonho à Realidade: A Jornada do Passa a Bola</h2>
                    <div className="relative w-full mx-auto">
                        <div className="absolute top-0 left-1/2 w-1 h-full bg-gray-200 -translate-x-1/2 lg:top-1/2 lg:left-0 lg:w-full lg:h-1 lg:-translate-y-1/2 lg:translate-x-0"></div>
                        <div className="relative flex flex-col lg:flex-row justify-between items-center">
                            {roadmapData.map((item, index) => (
                                <RoadmapItem
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    description={item.description}
                                    isPink={item.isPink}
                                    isUp={item.isUp}
                                    delay={(index + 1) * 100}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full bg-purple flex justify-center px-4 py-12">
                <div className="w-full max-w-[80%] px-4 sm:px-6 flex flex-col items-center" data-aos="fade-up" data-aos-duration="1000">
                    <h2 className="text-4xl font-bold text-white mb-8 font-title">
                        Junte-se a Nós na Jornada da Copa PAB!
                    </h2>
                    <p className="text-white max-w-2xl mb-8">
                        Seja parte dessa nova era do futebol feminino.
                        Acompanhe as partidas, apoie as atletas e celebre cada momento dessa incrível jornada conosco.
                        A Copa PAB é feita por e para vocês!
                    </p>

                    <div className="w-full">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={20}
                            slidesPerView={1}
                            breakpoints={{
                                640: { slidesPerView: 1, spaceBetween: 20 },
                                768: { slidesPerView: 1, spaceBetween: 24 },
                                1024: { slidesPerView: 2, spaceBetween: 30 },
                            }}
                            autoplay={{ delay: 2500, disableOnInteraction: true }}
                            loop
                            className="rounded-2xl shadow-2xl"
                        >
                            <SwiperSlide>
                                <img src="/encontro-PAB-01.jpg" alt="Torcida no estádio" className="w-full h-96 object-cover rounded-2xl" />
                            </SwiperSlide>
                            <SwiperSlide>
                                <img src="/encontro-PAB-02.jpg" alt="Futebol coletivo 2" className="w-full h-96 object-cover rounded-2xl" />
                            </SwiperSlide>
                            <SwiperSlide>
                                <img src="/encontro-PAB-03.jpg" alt="Selfie no campo" className="w-full h-96 object-cover rounded-2xl" />
                            </SwiperSlide>
                            <SwiperSlide>
                                <img src="/encontro-PAB-04.jpg" alt="Selfie no campo" className="w-full h-96 object-cover rounded-2xl" />
                            </SwiperSlide>
                        </Swiper>
                    </div>

                    <div className="flex justify-center mt-8 w-full">
                        <Link
                            href="/user/cadastro"
                            className="bg-pink text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform duration-500"
                        >
                            Cadastre-se agora!
                        </Link>
                    </div>
                </div>
            </section>

            {/* Seção FAQ - FUNDO BRANCO */}
            <section className="py-16 bg-white w-full">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span
                            className="inline-block bg-pink text-white px-4 py-2 rounded-full mb-4 text-sm font-bold"
                            data-aos="fade-up"
                        >
                            DÚVIDAS FREQUENTES
                        </span>
                        <h2
                            className="text-4xl sm:text-5xl font-bold font-title text-gray-800 mb-4"
                            data-aos="fade-up"
                            data-aos-delay="100"
                        >
                            Tudo o Que Você Precisa Saber
                            <span className="block text-purple mt-2">Sobre a Copa PAB 2025</span>
                        </h2>
                        <p
                            className="text-gray-600 text-lg max-w-2xl mx-auto"
                            data-aos="fade-up"
                            data-aos-delay="200"
                        >
                            Reunimos as principais perguntas para facilitar sua participação no maior torneio amador do Brasil
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-4">
                        {faqData.map((faq, index) => (
                            <FAQItem
                                key={faq.id}
                                pergunta={faq.pergunta}
                                resposta={faq.resposta}
                                isOpen={openFAQ === faq.id}
                                onClick={() => toggleFAQ(faq.id)}
                                delay={index * 100 + 300}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <ContactSection />
            <SectionCopa />
            <Footer links={links} />
        </main>
    );
}