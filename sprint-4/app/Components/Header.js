import Link from "next/link";
import { useState } from "react";

export default function Header({ links }) {
    const [menuOpen, setMenuOpen] = useState(false);
    function toggleMenu() {
        setMenuOpen((open) => !open);
    }

    return (
        <header
            className="w-[80%] flex justify-between items-center py-2 px-10 md:px-20 font-corpo bg-white/50 rounded-xl mt-5 border-2 border-purple"
            data-aos="fade-down"
            data-aos-duration="1000"
        >
            <img className="w-28" src="/Logo.svg" alt="Logo Passa Bola" data-aos="zoom-in" data-aos-delay="200" />
            <nav className="hidden md:block ml-auto">
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
            <div className="md:hidden flex items-center justify-center relative">
                <button className="flex items-center justify-center p-2 rounded focus:outline-none" onClick={toggleMenu}>
                    <svg className={`w-8 h-8`} fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                <nav id="mobile-menu"
                    className={`absolute left-1/2 -translate-x-1/2 top-12 w-[90vw] max-w-xs bg-white rounded-xl shadow-lg z-50 ${menuOpen ? '' : 'hidden'}`}
                    data-aos="fade-down"
                    data-aos-duration="500"
                >
                    <ul className="flex flex-col gap-4 py-6 px-8 text-lg">
                        {links.map((link, idx) => (
                            <li key={link.href} data-aos="fade-left" data-aos-delay={300 + idx * 100}>
                                <Link className="text-pink font-bold" href={link.href}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}