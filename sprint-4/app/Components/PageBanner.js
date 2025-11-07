export default function PageBanner({ title, subtitle }) {
    return (
        <div className="w-full bg-gradient-to-r from-purple via-pink to-green py-12 px-4 shadow-lg" data-aos="fade-down">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold font-title text-white mb-3 drop-shadow-lg">
                    {title}
                </h1>
                <p className="text-lg md:text-xl text-white/90">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}