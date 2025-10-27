"use client";
import Header from "@/app/Components/Header";
import ProductCard from "@/app/Components/ProductCard";
import LoadingScreen from "@/app/Components/LoadingScreen";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import VoltarButton from "@/app/Components/VoltarButton";

const CART_STORAGE_KEY = "passa_bola_cart";

export default function LojaPage() {
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [priceFilter, setPriceFilter] = useState("all");
    const router = useRouter();

    const links = [
        { label: "Inicio", href: `/` },
        { label: "Copas PAB", href: `/copasPab` },
        { label: "Loja", href: `/loja` },
        { label: "Entrar", href: "/user/login" }
    ];

    const produtos = [
        { id: 1, nome: "Camisa Oficial PAB", preco: 129.90, imagem: "/camiseta.png", tamanhos: ['P', 'M', 'G', 'GG'] },
        { id: 2, nome: "Chuteira Profissional", preco: 499.90, imagem: "/chuteira.avif", tamanhos: ['34', '35', '36', '37', '38', '39', '40', '41', '42'] },
        { id: 3, nome: "Bola Oficial PAB", preco: 149.90, imagem: "/bola.png" },
        { id: 4, nome: "Kit Treino Completo", preco: 199.90, imagem: "/kitTreinamento.jpeg" },
        { id: 5, nome: "Meião Oficial PAB", preco: 39.90, imagem: "/meiao.png", tamanhos: ['P', 'M', 'G'] },
        { id: 6, nome: "Luvas de Goleira", preco: 159.90, imagem: "/luva.png", tamanhos: ['P', 'M', 'G'] },
        { id: 7, nome: "Mochila Esportiva PAB", preco: 119.90, imagem: "/mochila.png" },
        { id: 8, nome: "Boné Oficial PAB", preco: 59.90, imagem: "/bone.png" },
        { id: 9, nome: "Caneleiras de Proteção", preco: 49.90, imagem: "/caneleira.png", tamanhos: ['Infantil', 'Adulto'] },
        { id: 10, nome: "Caneca Oficial PAB", preco: 19.90, imagem: "/caneca.png" },
        { id: 11, nome: "Garrafa Térmica PAB", preco: 79.90, imagem: "/garrafa.png" },
        { id: 12, nome: "Chaveiro Oficial PAB", preco: 9.90, imagem: "/chaveiro.png" },
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
            setCart(savedCart);
            setLoading(false);
        }, 1000); // Simula 2 segundos de carregamento

        return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
    }, []);

    const addToCart = (produto, tamanho) => {
        if (produto.tamanhos && !tamanho) {
            alert(`Por favor, selecione um tamanho para "${produto.nome}".`);
            return;
        }

        const newCart = [...cart];
        // Um item é único pela combinação de ID e tamanho
        const cartItemId = tamanho ? `${produto.id}-${tamanho}` : produto.id;
        const existingItem = newCart.find(item => item.cartItemId === cartItemId);

        if (existingItem) {
            existingItem.quantidade += 1;
        } else {
            newCart.push({ ...produto, quantidade: 1, tamanho, cartItemId });
        }

        setCart(newCart);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    };

    const filteredProducts = produtos.filter(produto => {
        const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesPrice = true;
        if (priceFilter === "under100") {
            matchesPrice = produto.preco < 100;
        } else if (priceFilter === "100to200") {
            matchesPrice = produto.preco >= 100 && produto.preco < 200;
        } else if (priceFilter === "over200") {
            matchesPrice = produto.preco >= 200;
        }

        return matchesSearch && matchesPrice;
    });

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantidade, 0);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <Header links={links} bgClass="bg-white" src="/Logo-Preta.png" color="text-black" />

            <section className="bg-gradient-to-r from-green via-pink to-purple py-20 sm:py-32 mt-5 px-4 text-center">
                <div className="max-w-4xl mx-auto" data-aos="fade-up">
                    <h1 className="text-4xl sm:text-6xl font-bold font-title text-white">
                        Bem-vindo à Loja PAB
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-white max-w-2xl mx-auto">
                        Encontre os melhores equipamentos e produtos oficiais para levar seu jogo para o próximo nível.
                    </p>
                </div>
            </section>


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-pink font-title">LOJA PAB</h1>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-lg text-gray-700">Equipamentos e produtos oficiais para seu time!</p>
                            <Link href="/carrinho" className="relative block">
                                <img src="/cart.svg" alt="Carrinho de compras" className="w-8 h-8 text-gray-700" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-pink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white  rounded-lg">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink focus:outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <select
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink focus:outline-none bg-white"
                            >
                                <option value="all">Todos os preços</option>
                                <option value="under100">Até R$ 100</option>
                                <option value="100to200">R$ 100 - R$ 200</option>
                                <option value="over200">Acima de R$ 200</option>
                            </select>
                        </div>
                    </div>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-500">Nenhum produto encontrado</p>
                            <button
                                onClick={() => { setSearchTerm(""); setPriceFilter("all"); }}
                                className="mt-4 text-pink font-semibold hover:underline"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(produto => (
                                <ProductCard
                                    key={produto.id}
                                    nome={produto.nome}
                                    preco={produto.preco}
                                    imagem={produto.imagem}
                                    tamanhos={produto.tamanhos} // Passe os tamanhos para o card
                                    onAddToCart={(tamanho) => addToCart(produto, tamanho)} // A função agora espera um tamanho
                                />
                            ))}
                        </div>
                    )}
                    {cart.length > 0 && (
                        <div className="mt-6 p-4 bg-green/20 rounded-lg">
                            <p className="text-lg font-bold text-black">
                                Itens no carrinho: {cart.reduce((sum, item) => sum + item.quantidade, 0)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}