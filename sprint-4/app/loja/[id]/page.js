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
    const [isInitialLoad, setIsInitialLoad] = useState(true); // 1. Adicionar estado
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // 2. Adicionar estado
    const [priceFilter, setPriceFilter] = useState("all");
    const [userId, setUserId] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [produtos, setProdutos] = useState([]);
    const [erro, setErro] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'info' });
    const [newProduct, setNewProduct] = useState({
        nome: "",
        preco: "",
        imagem: "",
        categoria: "",
        descricao: "",
        tamanhos: "",
        estoque: "",
        isFeatured: false,
        isNew: false
    });
    const router = useRouter();

    const showAlert = (message, type = 'info') => {
        setAlertInfo({ show: true, message, type });
    };

    // 3. Adicionar useEffect para o debouncing
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // Aguarda 500ms após o usuário parar de digitar

        // Limpa o timeout se o usuário digitar novamente
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Get user ID and admin status from localStorage or fetch from API
    useEffect(() => {
        const fetchUserData = async () => {
            const storedUserId = localStorage.getItem('user_id');
            const token = localStorage.getItem('auth_token');

            if (storedUserId) {
                setUserId(storedUserId);
            }

            if (token) {
                try {
                    const response = await fetch('/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    if (data.user) {
                        setUserId(data.user.id);
                        // Check admin status from API or email
                        const adminStatus = data.user.isAdmin || data.user.email === 'admin@gmail.com';
                        console.log('Admin status:', adminStatus, 'User email:', data.user.email, 'isAdmin field:', data.user.isAdmin);
                        setIsAdmin(adminStatus);
                        localStorage.setItem('user_id', data.user.id);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, []);

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            if (isInitialLoad) {
                setLoading(true);
            }
            setErro("");

            try {
                // Build query params for filtering
                let queryParams = [];
                if (priceFilter === "under100") {
                    queryParams.push("maxPrice=99.99");
                } else if (priceFilter === "100to200") {
                    queryParams.push("minPrice=100", "maxPrice=199.99");
                } else if (priceFilter === "over200") {
                    queryParams.push("minPrice=200");
                }
                if (debouncedSearchTerm) { // 4. Usar o estado debounced
                    queryParams.push(`search=${encodeURIComponent(debouncedSearchTerm)}`);
                }

                const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
                const response = await fetch(`/api/products${queryString}`);

                const data = await response.json();

                if (!response.ok) {
                    setErro(data.error || 'Erro ao carregar produtos');
                    setProdutos([]);
                    setLoading(false);
                    return;
                }

                setProdutos(data.products || []);
            } catch (error) {
                console.error('Fetch products error:', error);
                setErro('Erro ao conectar com o servidor. Tente novamente.');
                setProdutos([]);
            } finally {
                setLoading(false);
                setIsInitialLoad(false); // Marcar que o carregamento inicial terminou
                // Load cart from MongoDB if user is logged in
                const token = localStorage.getItem('auth_token');
                if (token) {
                    try {
                        const cartResponse = await fetch('/api/cart', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (cartResponse.ok) {
                            const cartData = await cartResponse.json();
                            if (cartData.cart) {
                                setCart(cartData.cart);
                            }
                        } else if (cartResponse.status === 401) {
                            console.log('Token inválido - carrinho não será carregado');
                            setCart([]);
                        } else {
                            console.error('Erro ao carregar carrinho:', cartResponse.status);
                            setCart([]);
                        }
                    } catch (error) {
                        console.error('Erro ao conectar com API do carrinho:', error);
                        setCart([]);
                    }
                }
            }
        };

        fetchProducts();
    }, [debouncedSearchTerm, priceFilter, isInitialLoad]); // 5. Atualizar dependências

    // Determine header links based on login status
    const links = [
        { label: "Inicio", href: `/inicioposlogin/${userId}` },
        { label: "Perfil", href: `/perfil/${userId}` },
        { label: "Times", href: `/times/${userId}` },
        { label: "Copas PAB", href: `/copasPab/${userId}` },
        { label: "Loja", href: `/loja/${userId}` },
        { label: "Sair", href: "/", onClick: () => handleLogout() }
    ];

    const addToCart = async (produto, tamanho) => {
        // A condição foi ajustada para verificar se o array de tamanhos tem itens.
        if (produto.tamanhos && produto.tamanhos.length > 0 && !tamanho) {
            showAlert(`Por favor, selecione um tamanho para "${produto.nome}".`, 'info');
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                showAlert('Você precisa estar logado para adicionar itens ao carrinho.');
                router.push('/user/login');
                return;
            }

            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: produto.id,
                    nome: produto.nome,
                    preco: produto.preco,
                    imagem: produto.imagem,
                    tamanho: tamanho || null,
                    quantidade: 1
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    showAlert('Sua sessão expirou. Por favor, faça login novamente.', 'error');
                    router.push('/user/login');
                    return;
                }
                showAlert(data.error || 'Erro ao adicionar item ao carrinho', 'error');
                return;
            }

            setCart(data.cart || []);
            showAlert('Item adicionado ao carrinho!', 'success');
        } catch (error) {
            console.error('Add to cart error:', error);
            showAlert('Erro ao conectar com o servidor. Tente novamente.', 'error');
        }
    };

    // Admin functions
    const handleAddProduct = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                showAlert('Você precisa estar logado.', 'error');
                return;
            }

            // Parse tamanhos from string to array
            const tamanhos = newProduct.tamanhos
                ? newProduct.tamanhos.split(',').map(t => t.trim()).filter(t => t.length > 0)
                : [];

            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: newProduct.nome,
                    preco: parseFloat(newProduct.preco),
                    imagem: newProduct.imagem,
                    categoria: newProduct.categoria,
                    descricao: newProduct.descricao,
                    tamanhos: tamanhos,
                    estoque: parseInt(newProduct.estoque) || 0,
                    isFeatured: newProduct.isFeatured,
                    isNew: newProduct.isNew
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert(data.error || 'Erro ao adicionar produto', 'error');
                return;
            }

            showAlert('Produto adicionado com sucesso!', 'success');
            setShowAddModal(false);
            setNewProduct({
                nome: "",
                preco: "",
                imagem: "",
                categoria: "",
                descricao: "",
                tamanhos: "",
                estoque: "",
                isFeatured: false,
                isNew: false
            });
            // Reload products
            window.location.reload();
        } catch (error) {
            console.error('Add product error:', error);
            showAlert('Erro ao conectar com o servidor. Tente novamente.', 'error');
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                showAlert('Você precisa estar logado.', 'error');
                return;
            }

            const response = await fetch(`/api/admin/products?id=${productToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert(data.error || 'Erro ao remover produto', 'error');
                return;
            }

            showAlert('Produto removido com sucesso!', 'success');
            setShowDeleteModal(false);
            setProductToDelete(null);
            // Reload products
            window.location.reload();
        } catch (error) {
            console.error('Delete product error:', error);
            showAlert('Erro ao conectar com o servidor. Tente novamente.', 'error');
        }
    };

    // Products are already filtered by the API, so we just use them directly
    const filteredProducts = produtos;

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantidade, 0);

    if (isInitialLoad) { // 6. Mudar condição para o LoadingScreen
        return <LoadingScreen />;
    }

    return (
        <main className="bg-gray-50 min-h-screen">
            <CustomAlert
                show={alertInfo.show}
                message={alertInfo.message}
                type={alertInfo.type}
                onClose={() => setAlertInfo({ show: false, message: '', type: 'info' })}
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
                            {isAdmin && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="px-6 py-2 bg-pink text-white rounded-lg font-semibold hover:bg-pink/90 transition-colors"
                                    >
                                        Adicionar Produto
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-lg text-gray-700">Equipamentos e produtos oficiais para seu time!</p>
                            {userId && (
                                <Link href={`/loja/carrinho/${userId}`} className="relative block">
                                    <img src="/cart.svg" alt="Carrinho de compras" className="w-8 h-8 text-gray-700" />
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-pink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg">
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
                    {loading ? ( // 7. Adicionar indicador de carregamento para filtros
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-500">Carregando produtos...</p>
                        </div>
                    ) : (
                        <>
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
                                        <div key={produto.id} className="relative">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => {
                                                        setProductToDelete(produto);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="absolute top-2 right-2 z-10 bg-red-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm"
                                                >
                                                    Excluir
                                                </button>
                                            )}
                                            <ProductCard
                                                nome={produto.nome}
                                                preco={produto.preco}
                                                imagem={produto.imagem}
                                                tamanhos={produto.tamanhos}
                                                onAddToCart={(tamanho) => addToCart(produto, tamanho)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
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

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-pink font-title">Adicionar Produto</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Nome do produto"
                                value={newProduct.nome}
                                onChange={(e) => setNewProduct({ ...newProduct, nome: e.target.value })}
                                required
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink focus:outline-none"
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Preço (R$)"
                                value={newProduct.preco}
                                onChange={(e) => setNewProduct({ ...newProduct, preco: e.target.value })}
                                required
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="URL da imagem"
                                value={newProduct.imagem}
                                onChange={(e) => setNewProduct({ ...newProduct, imagem: e.target.value })}
                                required
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink focus:outline-none"
                            />
                            <select
                                value={newProduct.categoria}
                                onChange={(e) => setNewProduct({ ...newProduct, categoria: e.target.value })}
                                required
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink focus:outline-none bg-white"
                            >
                                <option value="">Selecione a categoria</option>
                                <option value="Camisas">Camisas</option>
                            </select>
                            <textarea
                                placeholder="Descrição"
                                value={newProduct.descricao}
                                onChange={(e) => setNewProduct({ ...newProduct, descricao: e.target.value })}
                                rows={3}
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Tamanhos (separados por vírgula, ex: P,M,G,GG)"
                                value={newProduct.tamanhos}
                                onChange={(e) => setNewProduct({ ...newProduct, tamanhos: e.target.value })}
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink focus:outline-none"
                            />
                            <input
                                type="number"
                                placeholder="Estoque"
                                value={newProduct.estoque}
                                onChange={(e) => setNewProduct({ ...newProduct, estoque: e.target.value })}
                                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-pink focus:outline-none"
                            />
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={newProduct.isFeatured}
                                        onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span>Destaque</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={newProduct.isNew}
                                        onChange={(e) => setNewProduct({ ...newProduct, isNew: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span>Novo</span>
                                </label>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-2 bg-pink text-white rounded-lg font-semibold hover:bg-pink/90 transition-colors"
                                >
                                    Adicionar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Product Modal */}
            {showDeleteModal && productToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-red-600 font-title mb-4">Excluir Produto</h2>
                        <p className="text-gray-700 mb-6">
                            Tem certeza que deseja excluir o produto <strong>{productToDelete.nome}</strong>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteProduct}
                                className="flex-1 px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                            >
                                Excluir
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setProductToDelete(null);
                                }}
                                className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
