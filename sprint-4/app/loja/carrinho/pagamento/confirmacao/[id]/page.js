"use client";
import { useState, useEffect, useRef } from "react"; // 1. Importar useRef
import { useRouter } from "next/navigation";
import Header from "@/app/Components/Header";
import LoadingScreen from "@/app/Components/LoadingScreen";
import Link from "next/link";

export default function ConfirmacaoPage() {
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [userId, setUserId] = useState(null);
    const router = useRouter();
    const effectRan = useRef(false); // 2. Criar a referência para controle

    const links = userId ? [
        { label: "Inicio", href: `/inicioposlogin/${userId}` },
        { label: "Perfil", href: `/perfil/${userId}` },
        { label: "Times", href: `/times/${userId}` },
        { label: "Copas PAB", href: `/copasPab/${userId}` },
        { label: "Loja", href: `/loja/${userId}` }
    ] : [];

    useEffect(() => {
        // 3. Lógica de controle para garantir execução única
        if (effectRan.current === true) {
            return;
        }
        effectRan.current = true;

        const token = localStorage.getItem('auth_token');
        const userIdFromStorage = localStorage.getItem('user_id');

        if (!token || !userIdFromStorage) {
            router.push('/user/login');
            return;
        }

        setUserId(userIdFromStorage);

        const finalizedOrderData = JSON.parse(localStorage.getItem('finalized_order') || "null");

        if (!finalizedOrderData) {
            router.push(`/loja/${userIdFromStorage}`);
            return;
        }

        setOrder(finalizedOrderData);
        setLoading(false);

        localStorage.removeItem('finalized_order');

    }, [router]); // 4. Dependência simplificada

    if (loading) {
        return <LoadingScreen />;
    }

    if (!order) {
        return null; // Renderiza nada enquanto redireciona, se necessário
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
                                <div key={item.cartItemId || item.id} className="flex justify-between text-gray-700">
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

                    <Link href={`/loja/${userId}`} className="inline-block mt-8 bg-pink text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-purple transition-colors">
                        VOLTAR PARA A LOJA
                    </Link>
                </div>
            </div>
        </main>
    );
}