"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/Components/Header";
import LoadingScreen from "@/app/Components/LoadingScreen";
import Link from "next/link";

const CART_STORAGE_KEY = "passa_bola_cart";

export default function ConfirmacaoPage() {
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const router = useRouter();
    const effectRan = useRef(false);

    const links = [
        { label: "Inicio", href: `/` },
        { label: "Copas PAB", href: `/copasPab` },
        { label: "Loja", href: `/loja` },
        { label: "Entrar", href: "/user/login" }
    ];

    useEffect(() => {
        if (effectRan.current === false) {
            // Lê os dados do localStorage uma única vez.
            const summary = JSON.parse(localStorage.getItem('order_summary') || "null");
            const storedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");

            // Limpa o localStorage imediatamente após a leitura.
            localStorage.removeItem(CART_STORAGE_KEY);
            localStorage.removeItem('order_summary');

            if (!summary || storedCart.length === 0) {
                router.push('/loja'); // Se não houver dados, redireciona.
                return;
            }

            // Define o estado com os dados que foram lidos.
            setOrder({
                id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                summary,
                cart: storedCart
            });
            
            setLoading(false);

            // Marca que o efeito já rodou.
            effectRan.current = true;
        }
    }, [router]);

    if (loading || !order) {
        return <LoadingScreen />;
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <Header links={links} bgClass="bg-white" src="/Logo-Preta.png" color="text-black" />

            {/* Indicador de Progresso */}
            <div className="bg-white py-4 border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center">
                        <div className="flex items-center text-green">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold">✓</div>
                            <span className="ml-3 font-bold">Carrinho</span>
                        </div>
                        <div className="flex-1 h-0.5 mx-4 bg-green-600"></div>
                        <div className="flex items-center text-green-600">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold">✓</div>
                            <span className="ml-3 font-bold">Pagamento</span>
                        </div>
                        <div className="flex-1 h-0.5 mx-4 bg-pink"></div>
                        <div className="flex items-center text-pink">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink text-white font-bold">3</div>
                            <span className="ml-3 font-bold">Confirmação</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <div className="flex justify-center mb-4">
                        <img src="/check.svg" alt="Sucesso" className="w-20 h-20 text-green-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-green-600 font-title">Compra Realizada com Sucesso!</h1>
                    <p className="mt-2 text-lg text-gray-600">Obrigado por comprar na Loja PAB!</p>
                    <p className="mt-4 font-semibold text-gray-800">Seu pedido <span className="text-pink">{order.id}</span> foi confirmado.</p>
                    
                    <div className="text-left mt-8 border-t pt-6">
                        <h2 className="text-xl font-bold text-black mb-4">Resumo da Compra</h2>
                        <div className="flex flex-col gap-2 mb-4">
                            {order.cart.map(item => (
                                <div key={item.cartItemId} className="flex justify-between text-gray-700">
                                    <span>{item.quantidade}x {item.nome} {item.tamanho ? `(${item.tamanho})` : ''}</span>
                                    <span className="font-semibold">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 pt-4 flex flex-col gap-2">
                            <div className="flex justify-between font-semibold"><span>Subtotal</span><span>R$ {order.summary.subtotal.toFixed(2)}</span></div>
                            {order.summary.discount > 0 && (<div className="flex justify-between font-semibold text-green-600"><span>Desconto</span><span>- R$ {order.summary.discount.toFixed(2)}</span></div>)}
                            <div className="flex justify-between text-xl font-bold mt-2"><span>TOTAL</span><span className="text-pink">R$ {order.summary.total.toFixed(2)}</span></div>
                        </div>
                    </div>

                    <Link href="/loja" className="inline-block mt-8 bg-pink text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-purple transition-colors">
                        VOLTAR PARA A LOJA
                    </Link>
                </div>
            </div>
        </main>
    );
}