import Link from "next/link";
import React from "react";

const VoltarButton = ({ onClick, textColor = "text-black", hoverColor = "hover:text-pink" }) => (
    <span className="relative group inline-block">
        <button
            onClick={onClick}
            className={`${textColor} font-semibold text-lg ${hoverColor} duration-300 bg-transparent border-none cursor-pointer`}
            type="button"
        >
            Voltar
        </button>
        <span
            className="pointer-events-none absolute left-0 bottom-0 w-full h-0.5 bg-green scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"
            aria-hidden="true"
        ></span>
    </span>
);

export default VoltarButton;
