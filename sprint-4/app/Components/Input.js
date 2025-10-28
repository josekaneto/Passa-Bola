import React from "react";

const Input = ({ name, type = "text", placeholder, value, onChange, required = false, mask }) => {
    const handleChange = (e) => {
        if (mask === "date") {
            let value = e.target.value;
            value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
            value = value.replace(/(\d{2})(\d)/, "$1/$2"); // Coloca a primeira barra
            value = value.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3"); // Coloca a segunda barra
            value = value.substring(0, 10); // Limita o tamanho a 10 caracteres (DD/MM/YYYY)
            e.target.value = value;
        }
        onChange(e); // Chama o onChange original
    };

    return (
        <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            required={required}
            className={"w-full py-2 border-b-2 border-gray-400 focus:border-pink focus:outline-none "}
        />
    );
};

export default Input;