"use client";
import Header from "@/app/Components/Header";
import MainContainer from "@/app/Components/MainContainer";
import SectionContainer from "@/app/Components/SectionContainer";
import ProductCard from "@/app/Components/ProductCard";
import LoadingScreen from "@/app/Components/LoadingScreen";
import AuthGuard from "@/app/Components/AuthGuard";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import VoltarButton from "@/app/Components/VoltarButton";

export default function LojaPage() {
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [priceFilter, setPriceFilter] = useState("all");
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

    const produtos = [
        {
            id: 1,
            nome: "Camisa Oficial PAB",
            preco: 89.90,
            imagem: "/camiseta.png"
        },
        {
            id: 2,
            nome: "Chuteira Profissional",
            preco: 299.90,
            imagem: "/chuteira.avif"
        },
        {
            id: 3,
            nome: "Bola Oficial",
            preco: 149.90,
            imagem: "/bolaDeFutebol.webp"
        },
        {
            id: 4,
            nome: "Kit Treino Completo",
            preco: 199.90,
            imagem: "/kitTreinamento.jpeg"
        },
        {
            id: 5,
            nome: "Meião Esportivo",
            preco: 29.90,
            imagem: "/meiao.jfif"
        },
        {
            id: 6,
            nome: "Luvas de Goleira",
            preco: 159.90,
            imagem: "/luvas.jpg"
        }
    ];

    useEffect(() => {
        setLoading(true);
        const savedCart = typeof window !== "undefined" ? JSON.parse(localStorage.getItem(`carrinho_${usuarioId}`) || "[]") : [];
        setCart(savedCart);
        setLoading(false);
    }, [usuarioId]);

    const addToCart = (produto) => {
        const newCart = [...cart];
        const existingItem = newCart.find(item => item.id === produto.id);
        
        if (existingItem) {
            existingItem.quantidade += 1;
        } else {
            newCart.push({ ...produto, quantidade: 1 });
        }
        
        setCart(newCart);
        if (typeof window !== "undefined") {
            localStorage.setItem(`carrinho_${usuarioId}`, JSON.stringify(newCart));
        }
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

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <AuthGuard>
            <Header links={links} bgClass="bg-white" src="/Logo-Preta.png" color="text-black" />
            <MainContainer>
                <SectionContainer tamanho={600}>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                        <div className="w-full flex justify-end">
                            <VoltarButton onClick={() => router.back()}/>
                        </div>
                            <h1 className="text-4xl font-bold text-pink font-title">LOJA PAB</h1>
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-lg text-gray-700">Equipamentos e produtos oficiais para seu time!</p>
                                <Link href={`/carrinho/${usuarioId}`} className="text-green font-semibold hover:underline">
                                    Ver meu carrinho ({cart.reduce((sum, item) => sum + item.quantidade, 0)})
                                </Link>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
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
                                        onAddToCart={() => addToCart(produto)}
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
                </SectionContainer>
            </MainContainer>
        </AuthGuard>
    );
}
