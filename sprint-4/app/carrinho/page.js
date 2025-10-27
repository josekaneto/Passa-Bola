"use client";
import Header from "@/app/Components/Header";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "@/app/Components/LoadingScreen";
import Link from "next/link";
import VoltarButton from "../Components/VoltarButton";

const CART_STORAGE_KEY = "passa_bola_cart";

export default function CarrinhoPage() {
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState("");
    const router = useRouter();

    const links = [
        { label: "Inicio", href: `/` },
        { label: "Copas PAB", href: `/copasPab` },
        { label: "Loja", href: `/loja` },
        { label: "Entrar", href: "/user/login" }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const updateCartInStorage = (newCart) => {
        setCart(newCart);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
        // Recalcula o desconto se o carrinho mudar
        handleApplyCoupon(couponCode, newCart);
    };

    const updateQuantity = (cartItemId, delta) => {
        const newCart = cart.map(item => {
            if (item.cartItemId === cartItemId) {
                const newQuantidade = item.quantidade + delta;
                return { ...item, quantidade: Math.max(0, newQuantidade) };
            }
            return item;
        }).filter(item => item.quantidade > 0);

        updateCartInStorage(newCart);
    };

    const removeItem = (cartItemId) => {
        const newCart = cart.filter(item => item.cartItemId !== cartItemId);
        updateCartInStorage(newCart);
    };

    const clearCart = () => {
        updateCartInStorage([]);
    };

    const handleApplyCoupon = (code, currentCart = cart) => {
        setCouponError("");
        if (code.toUpperCase() === "PAB10") {
            const subtotal = currentCart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
            setDiscount(subtotal * 0.10);
        } else if (code) {
            setDiscount(0);
            setCouponError("Cupom inválido.");
        } else {
            setDiscount(0);
        }
    };

    const finalizarCompra = () => {
        // Salva o total no localStorage para a página de pagamento usar
        localStorage.setItem('order_summary', JSON.stringify({ subtotal, discount, total }));
        router.push("/pagamento");
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const total = subtotal - discount;

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <Header links={links} bgClass="bg-white" src="/Logo-Preta.png" color="text-black" />

            <div className="bg-white py-4 border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center">
                        {/* Etapa 1: Carrinho (Ativa) */}
                        <div className="flex items-center text-pink">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink text-white font-bold">1</div>
                            <span className="ml-3 font-bold">Carrinho</span>
                        </div>

                        <div className="flex-1 h-0.5 mx-4 bg-gray-300"></div>

                        {/* Etapa 2: Pagamento (Inativa) */}
                        <div className="flex items-center text-gray-400">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 font-bold">2</div>
                            <span className="ml-3 font-semibold hidden sm:inline">Pagamento</span>
                        </div>

                        <div className="flex-1 h-0.5 mx-4 bg-gray-300"></div>

                        {/* Etapa 3: Confirmação (Inativa) */}
                        <div className="flex items-center text-gray-400">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 font-bold">3</div>
                            <span className="ml-3 font-semibold hidden sm:inline">Confirmação</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-bold text-pink font-title">MEU CARRINHO</h1>
                        <VoltarButton onClick={() => router.back()} />
                    </div>

                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-12">
                            <p className="text-xl text-gray-500">Seu carrinho está vazio</p>
                            <Link
                                href="/loja"
                                className="bg-pink text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-purple transition-colors duration-300"
                            >
                                IR PARA A LOJA
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-4">
                                {cart.map(item => (
                                    <div key={item.cartItemId} className="bg-white border-2 border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center shadow">
                                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-1">
                                            <h3 className="text-xl font-bold text-black font-title">{item.nome}</h3>
                                            {item.tamanho && (
                                                <p className="text-sm text-gray-600 font-semibold">Tamanho: {item.tamanho}</p>
                                            )}
                                            <p className="text-lg font-bold text-pink mt-1">R$ {item.preco.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateQuantity(item.cartItemId, -1)} className="bg-gray-200 hover:bg-gray-300 text-black font-bold w-8 h-8 rounded transition">-</button>
                                            <span className="text-lg font-bold w-8 text-center">{item.quantidade}</span>
                                            <button onClick={() => updateQuantity(item.cartItemId, 1)} className="bg-gray-200 hover:bg-gray-300 text-black font-bold w-8 h-8 rounded transition">+</button>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <p className="text-xl font-bold text-black">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                                            <button onClick={() => removeItem(item.cartItemId)} className="text-red-500 hover:text-red-700 text-sm font-semibold cursor-pointer">Remover</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-gray-300 pt-6 flex flex-col md:flex-row gap-8">
                                {/* Cupom e Ações */}
                                <div className="flex-1 flex flex-col gap-4">
                                    <h3 className="text-lg font-bold text-black">CUPOM DE DESCONTO</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Digite seu cupom"
                                            className="flex-grow px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink focus:outline-none"
                                        />
                                        <button onClick={() => handleApplyCoupon(couponCode)} className="bg-gray-600 text-white font-bold px-6 rounded-lg hover:bg-gray-700">APLICAR</button>
                                    </div>
                                    {couponError && <p className="text-red-500 text-sm">{couponError}</p>}
                                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                        <button onClick={clearCart} className="bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-gray-500 flex-1">LIMPAR CARRINHO</button>
                                        <Link href="/loja" className="bg-white border-2 border-pink text-pink text-center font-bold py-3 px-6 rounded-lg shadow hover:bg-pink/10 flex-1">CONTINUAR COMPRANDO</Link>
                                    </div>
                                </div>

                                {/* Resumo do Pedido */}
                                <div className="w-full md:w-2/5 bg-white p-6 rounded-xl shadow-lg border-b-4 border-pink">
                                    <h2 className="text-2xl font-bold text-black font-title mb-4">RESUMO DO PEDIDO</h2>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between text-lg">
                                            <span>Subtotal</span>
                                            <span>R$ {subtotal.toFixed(2)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-lg text-green-600">
                                                <span>Desconto (10%)</span>
                                                <span>- R$ {discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-200 my-2"></div>
                                        <div className="flex justify-between items-center text-2xl font-bold">
                                            <span className="text-black font-title">TOTAL</span>
                                            <span className="text-pink">R$ {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button onClick={finalizarCompra} className="mt-6 w-full bg-green text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-green/80 transition-colors duration-300">
                                        FINALIZAR COMPRA
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}