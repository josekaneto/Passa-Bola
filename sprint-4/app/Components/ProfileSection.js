import Image from "next/image";

export default function ProfileSection({ img, text, reverse = false, alt }) {
    return (
        <section className={`w-full flex flex-col items-center`}>
            <div className={`w-[80%] md:flex-row gap-3 py-16 px-4 md:px-0 flex justify-evenly items-center ${reverse ? "md:flex-row-reverse" : ""}`}>
                <div className={"flex w-1/2 justify-center"} data-aos={reverse ? "fade-left" : "fade-right"} data-aos-duration="1200">
                    <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-purple flex justify-center items-center bg-white w-72 h-7 md:w-96 md:h-96">
                        <img
                            src={img}
                            alt={alt}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>
                <div
                    className={`flex flex-col justify-center items-center w-1/2`}
                    data-aos={reverse ? "fade-right" : "fade-left"}
                    data-aos-duration="1200"
                >
                    <p className="text-lg md:text-xl text-gray-900 bg-white/80 p-6 rounded-xl shadow-lg border-l-8 border-pink  max-w-xl text-center md:text-left">
                        {text}
                    </p>
                </div>
            </div>

        </section>
    );
}
