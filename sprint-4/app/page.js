"use client";
import Link from "next/link";
import Header from "./Components/Header";
import ProfileSection from "./Components/ProfileSection";
import { useEffect } from "react";
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

const links = [
  { label: "Início", href: "/" },
  { label: "Copas PAB", href: "/copasPab" },
  { label: "Loja", href: "/loja" },
  { label: "Entrar", href: "/user/login" }
];

export default function Home() {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <>
      <section className="w-screen min-h-screen bg-center bg-no-repeat bg-cover bg-[url(/background1.png)] flex flex-col items-center relative font-corpo">
        <Header links={links} />
        <div
          className="w-full max-w-[80%] px-4 sm:px-6 flex flex-col justify-center items-center sm:items-start absolute top-0 left-1/2 -translate-x-1/2 h-full"
          data-aos="fade-right"
          data-aos-duration="1200"
        >
          <span className="bg-pink text-white px-3 py-1 rounded-full mb-4 text-sm font-semibold" data-aos="fade-right" data-aos-delay="200">
            Copa PAB 2025
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold font-title text-white mb-6 w-full md:w-full" data-aos="fade-right" data-aos-delay="400">
            ELAS NO COMANDO: O FUTURO DO FUTEBOL COMEÇA AQUI
          </h1>
          <p className="text-base sm:text-lg text-white w-full sm:w-4/5 md:w-7/12" data-aos="fade-right" data-aos-delay="600">
            Uma Copa que celebra a garra, o talento e a união das mulheres no futebol.
            Mais do que partidas, vivemos histórias de superação, força e conquista.
            Cada jogo é um símbolo de resistência, e cada vitória coletiva ou individual é um passo rumo à igualdade, à inspiração e a um novo capítulo no esporte.
          </p>
          <Link
            href="/copasPab"
            className="mt-6 bg-purple text-white font-semibold px-5 py-3 rounded-xl hover:scale-105 duration-500 transition-transform"
          >
            Venha fazer parte dessa história!
          </Link>
        </div>
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center"
          data-aos="fade-up"
          data-aos-delay="1000"
        >
          <span className="text-white text-sm font-semibold bg-green/40 px-4 py-2 rounded-full shadow-lg mb-2">
            Role para baixo e descubra mais!
          </span>
          <img
            src="/arrow.gif"
            alt="Seta para baixo animada"
            className="w-20 h-20"
          />
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
            img="/luana.jpg"
            alt="Luana Maluf"
            text="Luana Maluf é uma das principais vozes femininas do jornalismo esportivo brasileiro. Com uma carreira marcada por dedicação, carisma e conhecimento, Luana se destaca na cobertura de futebol, trazendo análises precisas e uma abordagem inspiradora sobre o protagonismo das mulheres no esporte. Sua presença nos campos e transmissões é sinônimo de credibilidade e paixão pelo futebol."
            reverse
          />

          <ProfileSection
            img="/ale.jpeg"
            alt="Ale Xavier"
            text="Ale Xavier é referência quando o assunto é futebol e representatividade feminina na mídia esportiva. Comunicadora nata, Ale conquistou o público com seu jeito autêntico, didático e engajado, tornando-se uma das principais influenciadoras do segmento. Sua trajetória inspira novas gerações de mulheres a ocuparem espaços de destaque no esporte brasileiro. Além disso, Ale é reconhecida por sua atuação em projetos sociais ligados ao futebol e por incentivar o debate sobre igualdade de gênero no esporte. Sua voz é símbolo de transformação e inspiração."
          />
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

      <ContactSection />
      <SectionCopa />
      <Footer  />
    </>
  );
}
