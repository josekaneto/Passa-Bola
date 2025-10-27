import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header({ links }) {
    const [menuOpen, setMenuOpen] = useState(false);

    function toggleMenu() {
        setMenuOpen((open) => !open);
    }

    // Impede o scroll da página quando o menu está aberto
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [menuOpen]);

    return (
        <>
            <header
                className="w-full max-w-[80%] mx-auto flex justify-between items-center py-2 px-4 md:px-20 font-corpo bg-white/60 rounded-xl my-5 border-2 border-purple z-40"
                data-aos="fade-down"
                data-aos-duration="1000"
            >
                <div className="flex items-center gap-3">
                    <img className="w-24 md:w-28" src="/Logo.svg" alt="Logo Passa Bola" data-aos="zoom-in" data-aos-delay="200" />
                    <h1 className="font-bold hidden font-title text-lg md:text-4xl lg:block bg-gradient-to-r from-green via-pink to-purple bg-clip-text text-transparent" data-aos="fade-right" data-aos-delay="400">PASSA BOLA</h1>
                </div>
                <nav className="hidden lg:block ml-auto">
                    <ul className="flex gap-7 md:gap-10 text-lg">
                        {links.map((link, idx) => (
                            <li className="relative group" key={link.href} data-aos="fade-left" data-aos-delay={300 + idx * 100}>
                                <Link className="hover:text-pink duration-300 text-black font-semibold text-xl" href={link.href}>
                                    {link.label}
                                </Link>
                                <span
                                    className="pointer-events-none absolute left-0 bottom-0 w-full h-0.5 bg-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"
                                    aria-hidden="true"></span>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="lg:hidden flex items-center justify-center">
                    <button
                        aria-label="Abrir menu"
                        className="flex items-center justify-center p-2 rounded focus:outline-none"
                        onClick={toggleMenu}
                    >
                        <svg className={`w-8 h-8`} fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </header>

            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 lg:hidden ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleMenu}
                aria-hidden="true"
            ></div>

            {/* Menu Lateral */}
            <div
                id="mobile-menu"
                className={`fixed top-0 right-0 h-full sm:w-2/3 md:w-1/3 max-w-sm bg-white shadow-lg z-50 transition-all duration-300 ease-in-out lg:hidden ${menuOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'}`}
            >
                <div className="flex justify-between items-center p-4 border-b">
                    <div className="flex items-center gap-3">
                        <img className="w-8 h-8" src="/Logo.svg" alt="Logo Passa Bola" />
                        <span className="font-bold text-lg bg-gradient-to-r from-green via-pink to-purple bg-clip-text text-transparent">PASSA BOLA</span>
                    </div>
                    <button
                        onClick={toggleMenu}
                        aria-label="Fechar menu"
                        className="p-2"
                    >
                        <img src="/close.svg" alt="Ícone de fechar menu" className="w-6 h-6" />
                    </button>
                </div>
                <nav className="p-6">
                    <ul className="flex flex-col gap-4 text-lg">
                        {links.map((link) => (
                            <li key={link.href}>
                                <Link className="hover:text-pink duration-300 text-black font-semibold text-xl" href={link.href}>
                                    {link.label}
                                </Link>
                                <span
                                    className="pointer-events-none absolute left-0 bottom-0 w-full h-0.5 bg-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"
                                    aria-hidden="true"></span>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
}