"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/Components/Header";
import LoadingScreen from "@/app/Components/LoadingScreen";
import Link from "next/link";

const CART_STORAGE_KEY = "passa_bola_cart";

export default function PagamentoPage() {
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState("creditCard");
    const [orderSummary, setOrderSummary] = useState(null);
    const [cart, setCart] = useState([]);
    const router = useRouter();

    const links = [
        { label: "Inicio", href: `/` },
        { label: "Copas PAB", href: `/copasPab` },
        { label: "Loja", href: `/loja` },
        { label: "Entrar", href: "/user/login" }
    ];

    useEffect(() => {
        const summary = JSON.parse(localStorage.getItem('order_summary') || "null");
        const storedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");

        if (!summary || storedCart.length === 0) {
            router.push('/carrinho'); // Redireciona se não houver dados
            return;
        }
        
        setOrderSummary(summary);
        setCart(storedCart);
        setLoading(false);
    }, [router]);

    const handleFinalizePayment = (e) => {
        e.preventDefault();
        // Aqui iria a lógica de validação e envio para um gateway de pagamento
        alert("Pagamento processado com sucesso!");
        router.push("/confirmacao");
    };

    if (loading || !orderSummary) {
        return <LoadingScreen />;
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <Header links={links} bgClass="bg-white" src="/Logo-Preta.png" color="text-black" />

            {/* Indicador de Progresso */}
            <div className="bg-white py-4 border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center">
                        <div className="flex items-center text-green-600">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold">✓</div>
                            <span className="ml-3 font-bold">Carrinho</span>
                        </div>
                        <div className="flex-1 h-0.5 mx-4 bg-pink"></div>
                        <div className="flex items-center text-pink">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink text-white font-bold">2</div>
                            <span className="ml-3 font-bold">Pagamento</span>
                        </div>
                        <div className="flex-1 h-0.5 mx-4 bg-gray-300"></div>
                        <div className="flex items-center text-gray-400">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 font-bold">3</div>
                            <span className="ml-3 font-semibold hidden sm:inline">Confirmação</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleFinalizePayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna de Formulários */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Dados Pessoais e Endereço */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-black font-title mb-4">Dados de Entrega</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="text" placeholder="Nome Completo" required className="p-3 border-2 rounded-lg w-full" />
                                <input type="text" placeholder="CPF" required className="p-3 border-2 rounded-lg w-full" />
                                <input type="email" placeholder="E-mail" required className="p-3 border-2 rounded-lg w-full" />
                                <input type="tel" placeholder="Telefone / Celular" required className="p-3 border-2 rounded-lg w-full" />
                                <input type="text" placeholder="CEP" required className="p-3 border-2 rounded-lg sm:col-span-1" />
                                <input type="text" placeholder="Endereço" required className="p-3 border-2 rounded-lg sm:col-span-2" />
                                <input type="text" placeholder="Número" required className="p-3 border-2 rounded-lg" />
                                <input type="text" placeholder="Complemento (Opcional)" className="p-3 border-2 rounded-lg" />
                                <input type="text" placeholder="Bairro" required className="p-3 border-2 rounded-lg" />
                                <input type="text" placeholder="Cidade" required className="p-3 border-2 rounded-lg" />
                                <input type="text" placeholder="Estado" required className="p-3 border-2 rounded-lg" />
                            </div>
                        </div>

                        {/* Opções de Pagamento */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-black font-title mb-4">Pagamento</h2>
                            <div className="flex border-b mb-4">
                                <button type="button" onClick={() => setPaymentMethod('creditCard')} className={`py-2 px-4 font-semibold ${paymentMethod === 'creditCard' ? 'border-b-2 border-pink text-pink' : 'text-gray-500'}`}>Cartão de Crédito</button>
                                <button type="button" onClick={() => setPaymentMethod('pix')} className={`py-2 px-4 font-semibold ${paymentMethod === 'pix' ? 'border-b-2 border-pink text-pink' : 'text-gray-500'}`}>Pix</button>
                                <button type="button" onClick={() => setPaymentMethod('boleto')} className={`py-2 px-4 font-semibold ${paymentMethod === 'boleto' ? 'border-b-2 border-pink text-pink' : 'text-gray-500'}`}>Boleto</button>
                            </div>
                            {paymentMethod === 'creditCard' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Número do Cartão" required className="p-3 border-2 rounded-lg sm:col-span-2" />
                                    <input type="text" placeholder="Nome no Cartão" required className="p-3 border-2 rounded-lg sm:col-span-2" />
                                    <input type="text" placeholder="Validade (MM/AA)" required className="p-3 border-2 rounded-lg" />
                                    <input type="text" placeholder="CVV" required className="p-3 border-2 rounded-lg" />
                                </div>
                            )}
                            {paymentMethod === 'pix' && (
                                <div className="text-center p-4 bg-gray-100 rounded-lg">
                                    <p className="font-semibold">Um código Pix será gerado após a finalização do pedido.</p>
                                    <p className="text-sm text-gray-600 mt-2">O código terá validade de 30 minutos.</p>
                                </div>
                            )}
                            {paymentMethod === 'boleto' && (
                                <div className="text-center p-4 bg-gray-100 rounded-lg">
                                    <p className="font-semibold">O boleto será gerado e poderá ser pago em até 3 dias úteis.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coluna de Resumo do Pedido */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
                            <h2 className="text-2xl font-bold text-black font-title mb-4">RESUMO DO PEDIDO</h2>
                            <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
                                {cart.map(item => (
                                    <div key={item.cartItemId} className="flex justify-between text-sm">
                                        <span>{item.quantidade}x {item.nome} {item.tamanho ? `(${item.tamanho})` : ''}</span>
                                        <span className="font-semibold">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
                                <div className="flex justify-between text-lg"><span>Subtotal</span><span>R$ {orderSummary.subtotal.toFixed(2)}</span></div>
                                {orderSummary.discount > 0 && (<div className="flex justify-between text-lg text-green-600"><span>Desconto</span><span>- R$ {orderSummary.discount.toFixed(2)}</span></div>)}
                                <div className="border-t border-gray-200 my-2"></div>
                                <div className="flex justify-between items-center text-2xl font-bold"><span className="text-black font-title">TOTAL</span><span className="text-pink">R$ {orderSummary.total.toFixed(2)}</span></div>
                            </div>
                            <button type="submit" className="mt-6 w-full bg-green text-white font-bold py-3 rounded-lg shadow hover:bg-green/80">FINALIZAR PAGAMENTO</button>
                            <Link href="/carrinho" className="block text-center mt-4 text-sm text-gray-500 hover:text-pink">Voltar para o carrinho</Link>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}