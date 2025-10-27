"use client";
import Header from "@/app/Components/Header";
import MainContainer from "@/app/Components/MainContainer";
import SectionContainer from "@/app/Components/SectionContainer";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "@/app/Components/LoadingScreen";
import AuthGuard from "@/app/Components/AuthGuard";

export default function CarrinhoPage() {
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const { id: usuarioId } = useParams();
    const router = useRouter();

    const links = [
        { label: "Inicio", href: `/inicioposlogin/${usuarioId}` },
        { label: "Perfil", href: `/perfil/${usuarioId}` },
        { label: "Times", href: `/times/${usuarioId}` },
        { label: "Loja", href: `/loja/${usuarioId}` },
        { label: "Copas PAB", href: `/copasPab/${usuarioId}` },
        { label: "Sair", href: "/" }
    ];

    useEffect(() => {
        setLoading(true);
        const usuarios = typeof window !== "undefined" ? localStorage.getItem("usuarios") : null;
        if (!usuarios) {
            router.replace("/");
            return;
        }
        // Carrega os itens do carrinho do localStorage
        if (typeof window !== "undefined") {
            const storedCart = localStorage.getItem(`carrinho_${usuarioId}`);
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        }
        setLoading(false);
    },[router, usuarioId])

    const updateQuantity = (id, delta) => {
        const newCart = cart.map(item => {
            if (item.id === id) {
                const newQuantidade = item.quantidade + delta;
                return { ...item, quantidade: Math.max(0, newQuantidade) };
            }
            return item;
        }).filter(item => item.quantidade > 0);
        
        setCart(newCart);
        if (typeof window !== "undefined") {
            localStorage.setItem(`carrinho_${usuarioId}`, JSON.stringify(newCart));
        }
    };

    const removeItem = (id) => {
        const newCart = cart.filter(item => item.id !== id);
        setCart(newCart);
        if (typeof window !== "undefined") {
            localStorage.setItem(`carrinho_${usuarioId}`, JSON.stringify(newCart));
        }
    };

    const clearCart = () => {
        setCart([]);
        if (typeof window !== "undefined") {
            localStorage.setItem(`carrinho_${usuarioId}`, JSON.stringify([]));
        }
    };

    const finalizarCompra = () => {
        alert("Compra finalizada com sucesso! Obrigada por comprar na Loja PAB!");
        clearCart();
    };

    const total = cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
        <AuthGuard>
            <Header links={links} bgClass="bg-white" src="/Logo-Preta.png" color="text-black" />
            <MainContainer>
                <SectionContainer>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-bold text-pink font-title">MEU CARRINHO</h1>
                            <p className="text-lg text-gray-700">Revise seus itens antes de finalizar a compra</p>
                        </div>

                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center gap-4 py-12">
                                <p className="text-xl text-gray-500">Seu carrinho está vazio</p>
                                <a 
                                    href={`/loja/${usuarioId}`}
                                    className="bg-pink text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-purple transition-colors duration-300"
                                >
                                    IR PARA A LOJA
                                </a>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center shadow">
                                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                                            </div>
                                            
                                            <div className="flex-1 flex flex-col gap-2">
                                                <h3 className="text-xl font-bold text-black font-title">{item.nome}</h3>
                                                <p className="text-lg font-bold text-pink">R$ {item.preco.toFixed(2)}</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="bg-gray-200 hover:bg-gray-300 text-black font-bold w-8 h-8 rounded transition"
                                                >
                                                    -
                                                </button>
                                                <span className="text-lg font-bold w-8 text-center">{item.quantidade}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="bg-gray-200 hover:bg-gray-300 text-black font-bold w-8 h-8 rounded transition"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            
                                            <div className="flex flex-col items-end gap-2">
                                                <p className="text-xl font-bold text-black">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                                                <button 
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t-2 border-gray-300 pt-6 flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-black font-title">TOTAL:</span>
                                        <span className="text-3xl font-bold text-pink">R$ {total.toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button 
                                            onClick={clearCart}
                                            className="bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-gray-500 transition-colors duration-300 flex-1"
                                        >
                                            LIMPAR CARRINHO
                                        </button>
                                        <button 
                                            onClick={finalizarCompra}
                                            className="bg-green text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-green/80 transition-colors duration-300 flex-1"
                                        >
                                            FINALIZAR COMPRA
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </SectionContainer>
            </MainContainer>
        </AuthGuard>
        </>
    );
}

