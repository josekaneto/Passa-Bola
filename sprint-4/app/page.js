"use client";
import Link from "next/link";
import Header from "./Components/Header";
import ProfileSection from "./Components/ProfileSection";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import ContactSection from "./Components/ContactSection";
import SectionCopa from "./Components/SectionCopa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import AOS from "aos";
import "aos/dist/aos.css";
import Footer from "./Components/Footer";
import LoadingScreen from "./Components/LoadingScreen";
import { FaArrowDown, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

const links = [
  { label: "Início", href: "/" },
  { label: "Copas PAB", href: "/copasPab" },
  { label: "Loja", href: "/loja" },
  { label: "Entrar", href: "/user/login" }
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AOS.init({ once: true });

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Simula 2 segundos de carregamento

    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="flex wf min-h-screen flex-col bg-gray-100 text-gray-800 font-corpo overflow-x-hidden">
      <section className="w-full min-h-screen bg-center bg-no-repeat bg-cover bg-[url(/background1.png)] flex flex-col items-center relative font-corpo">
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
            href="/copasPab"
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
            text="Ale Xavier é referência quando o assunto é futebol e representatividade feminina na mídia esportiva. Comunicadora nata, Ale conquistou o público com seu jeito autêntico, didático e engajado, tornando-se uma das principais influenciadoras do segmento. Sua trajetória inspira novas gerações de mulheres a ocuparem espaços de destaque no esporte brasileiro. Além disso, Ale é reconhecida por sua atuação em projetos sociais ligados ao futebol e por incentivar o debate sobre igualdade de gênero no esporte. Sua voz é símbolo de transformação e inspiração."
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
      <Footer  />
    </main>
  );
}
