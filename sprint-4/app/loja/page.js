"use client";
import Header from "@/app/Components/Header";
import ProductCard from "@/app/Components/ProductCard";
import LoadingScreen from "@/app/Components/LoadingScreen";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import CustomAlert from "@/app/Components/CustomAlert";

export default function LojaPage() {
    const [loading, setLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Adicionar este estado
    const [produtos, setProdutos] = useState([]);
    const [erro, setErro] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // 1. Novo estado
    const [priceFilter, setPriceFilter] = useState("all");
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'info' });
    const router = useRouter();

    const showAlert = (message, type = 'info') => {
        setAlertInfo({ show: true, message, type });
    };

    // 2. Novo useEffect para o debouncing
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // Aguarda 500ms após o usuário parar de digitar

        // Limpa o timeout se o usuário digitar novamente
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);


    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            if (isInitialLoad) {
                setLoading(true);
            }
            setErro("");
            try {
                const params = new URLSearchParams();
                if (priceFilter === "under100") {
                    params.append("maxPrice", "99.99");
                } else if (priceFilter === "100to200") {
                    params.append("minPrice", "100");
                    params.append("maxPrice", "199.99");
                } else if (priceFilter === "over200") {
                    params.append("minPrice", "200");
                }
                if (debouncedSearchTerm) { // 3. Usar o estado debounced
                    params.append("search", debouncedSearchTerm);
                }

                const queryString = params.toString();
                const response = await fetch(`/api/products${queryString ? `?${queryString}` : ""}`);

                if (!response.ok) {
                    const data = await response.json().catch(() => ({ error: 'Erro ao carregar produtos' }));
                    setErro(data.error);
                    setProdutos([]);
                    return;
                }

                const data = await response.json();
                setProdutos(data.products || []);
            } catch (error) {
                console.error('Fetch products error:', error);
                setErro('Erro ao conectar com o servidor. Tente novamente.');
                setProdutos([]);
            } finally {
                setLoading(false);
                setIsInitialLoad(false); // Marcar que o carregamento inicial terminou
            }
        };

        fetchProducts();
    }, [debouncedSearchTerm, isInitialLoad, priceFilter]); // 4. Atualizar dependência

    // Links para usuário não logado
    const links = [
        { label: "Inicio", href: `/` },
        { label: "Copas PAB", href: `/copasPab` },
        { label: "Loja", href: `/loja` },
        { label: "Entrar", href: "/user/login" }
    ];

    // Função simplificada que apenas mostra o alerta para fazer login
    const handleAddToCartRequest = (event) => {
        if (event) {
            event.preventDefault(); // Impede a navegação ao clicar no botão dentro do Link
        }
        showAlert('Você precisa estar logado para comprar.', 'info');
        setTimeout(() => {
            router.push('/user/login');
        }, 2000);
    };

    if (isInitialLoad) { // Mudar a condição para usar o novo estado
        return <LoadingScreen />;
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <CustomAlert
                show={alertInfo.show}
                message={alertInfo.message}
                type={alertInfo.type}
                onClose={() => {
                    setAlertInfo({ show: false, message: '', type: 'info' });
                    router.push('/user/login');
                }}
            />
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
                        <div className="flex items-center justify-between gap-4">
                            <h1 className="text-4xl font-bold text-pink font-title">LOJA PAB</h1>
                        </div>
                        <p className="text-lg text-gray-700">Equipamentos e produtos oficiais para seu time!</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm">
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
                    {erro && (
                        <div className="text-center py-4">
                            <p className="text-red-500 text-lg">{erro}</p>
                        </div>
                    )}
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-500">Carregando produtos...</p>
                        </div>
                    ) : (
                        <>
                            {produtos.length === 0 ? (
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
                                    {produtos.map(produto => (
                                        <div key={produto.id} className="cursor-pointer">
                                            <ProductCard
                                                nome={produto.nome}
                                                preco={produto.preco}
                                                imagem={produto.imagem}
                                                tamanhos={produto.tamanhos}
                                                // A função agora recebe o 'event' diretamente do clique
                                                onAddToCart={(tamanho, event) => {
                                                    // E o passamos para a função que precisa dele
                                                    handleAddToCartRequest(event);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}