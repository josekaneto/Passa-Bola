import Image from "next/image";

export default function ProfileSection({ src, text, reverse = false, alt }) {
    return (
        <section className="w-full flex justify-center">
            <div className={`w-full flex flex-col lg:flex-row  ${reverse ? 'lg:flex-row-reverse' : ''} items-center justify-center gap-6 py-12 px-4`}>
                <div className={`w-full md:w-1/3 flex ${reverse ? 'justify-end' : 'justify-start'} `} data-aos={reverse ? "fade-left" : "fade-right"} data-aos-duration="1200">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-purple bg-white w-[280px] h-[280px] md:w-96 md:h-96">
                        <Image src={src} alt={alt} layout="fill" className="object-cover" />
                    </div>
                </div>

                <div
                    className={`w-full lg:w-1/3 flex flex-col ${reverse ? 'justify-start' : 'justify-end'}`}
                    data-aos={reverse ? "fade-right" : "fade-left"}
                    data-aos-duration="1200"
                >
                    <p className="text-base md:text-lg text-gray-900 bg-white/90 p-5 md:p-6 rounded-xl shadow-lg border-l-8 border-pink text-left">
                        {text}
                    </p>
                </div>
            </div>
        </section>
    );
}
