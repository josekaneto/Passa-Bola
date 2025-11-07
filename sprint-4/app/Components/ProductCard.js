"use client";
import { useState } from "react";

export default function ProductCard({ nome, preco, imagem, onAddToCart, tamanhos = [] }) {
    const [selectedSize, setSelectedSize] = useState(null);

    const handleAddToCart = () => {
        // A lógica na página da loja vai verificar se um tamanho é necessário
        onAddToCart(selectedSize);
    };

    return (
        <div className="bg-white rounded-2xl p-4 flex flex-col shadow-lg hover:scale-[102%] transition-transform duration-500 w-full h-full">
            {/* Imagem */}
            <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden mb-4">
                <img src={imagem} alt={nome} className="w-full h-full object-cover" />
            </div>

            {/* Conteúdo do Card */}
            <div className="flex flex-col gap-3 flex-1">
                {/* Nome do Produto */}
                <h3 className="text-lg font-bold text-black font-title line-clamp-2">{nome}</h3>

                {/* Preço e Tamanhos */}
                <div className="flex justify-between items-start gap-3">
                    {/* Preço */}
                    <div className="flex-shrink-0">
                        <p className="text-2xl font-bold text-pink">R$ {preco.toFixed(2)}</p>
                    </div>

                    {/* Tamanhos */}
                    {tamanhos && tamanhos.length > 0 && (
                        <div className="flex flex-col gap-1.5 items-end">
                            <h4 className="text-xs font-bold text-gray-600 uppercase">Tamanho:</h4>
                            <div className="flex flex-wrap gap-1.5 justify-end">
                                {tamanhos.map(tamanho => (
                                    <button
                                        key={tamanho}
                                        onClick={() => setSelectedSize(tamanho)}
                                        className={`min-w-[2.5rem] px-2.5 py-1.5 border-2 rounded-lg text-sm font-bold transition-all duration-200 ${selectedSize === tamanho
                                            ? 'bg-pink text-white border-pink scale-105'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-pink hover:scale-105'
                                            }`}
                                    >
                                        {tamanho}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Botão */}
            <button
                onClick={handleAddToCart}
                className="bg-pink text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-purple transition-colors duration-300 text-base w-full mt-4"
            >
                ADICIONAR AO CARRINHO
            </button>
        </div>
    );
}