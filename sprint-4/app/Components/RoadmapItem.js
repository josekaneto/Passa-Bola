export default function RoadmapItem({ id, title, description, isPink, isUp, delay }) {
    const circleColor = isPink ? 'bg-pink' : 'bg-purple';
    const textColor = isPink ? 'text-pink' : 'text-green';
    const isOdd = id % 2 !== 0;

    return (
        <div
            className="relative w-full lg:w-1/6 flex justify-center px-2 "
            data-aos="fade-up"
            data-aos-delay={delay}
        >
            {/* --- Layout Vertical (Mobile) --- */}
            {/* --- Layout Vertical (Mobile) --- */}
            <div className="lg:hidden w-full h-32 mb-8 flex justify-center items-center relative">
                {/* Item ímpar: Círculo à esquerda, Texto à direita */}
                {isOdd ? (
                    <>
                        {/* Metade Esquerda (Círculo) */}
                        <div className="w-1/3 flex justify-center pr-4 relative">
                            <div className="absolute right-0 top-1/2 w-10 h-1 bg-gray-200"></div>
                            <div className={`w-12 h-12 ${circleColor} rounded-full flex items-center justify-center text-white font-bold ring-8 ring-white z-10`}>{id}</div>
                        </div>
                        {/* Metade Direita (Texto) */}
                        <div className="w-1/3 pl-4">
                            <h3 className={`font-bold text-lg ${textColor} font-title`}>{title}</h3>
                            <p className="mt-1 text-gray-600 text-sm">{description}</p>
                        </div>
                    </>
                ) : (
                    /* Item par: Texto à esquerda, Círculo à direita */
                    <>
                        {/* Metade Esquerda (Texto) */}
                        <div className="w-1/3 pr-4">
                            <h3 className={`font-bold text-lg ${textColor} font-title`}>{title}</h3>
                            <p className="mt-1 text-gray-600 text-sm">{description}</p>
                        </div>
                        {/* Metade Direita (Círculo) */}
                        <div className="w-1/3 flex justify-center pl-4 relative">
                            <div className="absolute left-0 top-1/2 w-10 h-1 bg-gray-200"></div>
                            <div className={`w-12 h-12 ${circleColor} rounded-full flex items-center justify-center text-white font-bold ring-8 ring-white z-10`}>{id}</div>
                        </div>
                    </>
                )}
            </div>

            {/* --- Layout Horizontal (Desktop) --- */}
            <div className="hidden lg:flex flex-col justify-center items-center w-full h-64">
                {/* Layout: Texto em Cima, Círculo em Baixo */}
                {isUp ? (
                    <>
                        <div className="w-full h-1/2 flex flex-col justify-end items-center text-center pb-8 relative">
                            <h3 className={`font-bold text-lg ${textColor} font-title`}>{title}</h3>
                            <p className="mt-1 text-gray-600 text-sm">{description}</p>
                            <div className="absolute bottom-0 w-1 h-8 bg-gray-200"></div>
                        </div>
                        <div className="w-full h-1/2 flex justify-center items-start pt-8 relative">
                            <div className="absolute top-0 w-1 h-8 bg-gray-200"></div>
                            <div className={`w-12 h-12 ${circleColor} rounded-full flex items-center justify-center text-white font-bold ring-8 ring-white z-10`}>{id}</div>
                        </div>
                    </>
                ) : (
                    /* Layout: Círculo em Cima, Texto em Baixo */
                    <>
                        <div className="w-full h-1/2 flex justify-center items-end pb-8 relative">
                            <div className="absolute bottom-0 w-1 h-8 bg-gray-200"></div>
                            <div className={`w-12 h-12 ${circleColor} rounded-full flex items-center justify-center text-white font-bold ring-8 ring-white z-10`}>{id}</div>
                        </div>
                        <div className="w-full h-1/2 flex flex-col justify-start items-center text-center pt-8 relative">
                            <div className="absolute top-0 w-1 h-8 bg-gray-200"></div>
                            <h3 className={`font-bold text-lg ${textColor} font-title`}>{title}</h3>
                            <p className="mt-1 text-gray-600 text-sm">{description}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}