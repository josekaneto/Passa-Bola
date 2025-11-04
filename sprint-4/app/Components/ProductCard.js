"use client";
import { useState } from "react";

export default function ProductCard({ nome, preco, imagem, onAddToCart, tamanhos = [] }) {
    const [selectedSize, setSelectedSize] = useState(null);

    const handleAddToCart = () => {
        // A lógica na página da loja vai verificar se um tamanho é necessário
        onAddToCart(selectedSize);
    };

    return (
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 shadow-lg hover:scale-105 transition-transform duration-400 w-full">
            <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={imagem} alt={nome} className="w-full h-full object-cover" />
            </div>
            <div className="w-full flex flex-col gap-2 flex-1">
                <h3 className="text-xl font-bold text-black font-title">{nome}</h3>
                <p className="text-2xl font-bold text-pink">R$ {preco.toFixed(2)}</p>
            </div>

            {tamanhos && tamanhos.length > 0 && (
                <div className="w-full flex flex-col gap-2">
                    <h4 className="text-sm font-bold text-gray-600">TAMANHO:</h4>
                    <div className="flex flex-wrap gap-2">
                        {tamanhos.map(tamanho => (
                            <button
                                key={tamanho}
                                onClick={() => setSelectedSize(tamanho)}
                                className={`px-3 py-1 border-2 rounded-md text-sm font-semibold transition-colors duration-200 ${selectedSize === tamanho
                                        ? 'bg-pink text-white border-pink'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-pink'
                                    }`}
                            >
                                {tamanho}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={handleAddToCart}
                className="bg-pink text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-purple transition-colors duration-300 text-lg w-full mt-auto"
            >
                ADICIONAR AO CARRINHO
            </button>
        </div>
    );
}