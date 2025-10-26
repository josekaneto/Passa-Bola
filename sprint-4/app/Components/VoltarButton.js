import Link from "next/link";
import React from "react";

const VoltarButton = ({ onClick }) => (
    <span className="relative group inline-block">
        <Link
            href="#"
            onClick={onClick}
            className="text-black font-semibold text-lg hover:text-pink duration-300"
        >
            Voltar
        </Link>
        <span
            className="pointer-events-none absolute left-0 bottom-0 w-full h-0.5 bg-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"
            aria-hidden="true"
        ></span>
    </span>
);

export default VoltarButton;
