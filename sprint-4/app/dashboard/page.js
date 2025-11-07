"use client";

import PageBanner from "../Components/PageBanner";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

export default function Dashboard() {

    // Dados mockados
    const estatisticasGerais = {
        totalUsuarios: 1847,
        totalTimes: 156,
        totalJogadoras: 2341,
        totalProdutos: 45,
        vendasMes: 12850.50,
        partidasRealizadas: 342
    };

    const produtosMaisVendidos = [
        { id: 1, nome: "Bola Oficial PAB", vendas: 234, valor: 89.90, categoria: "Equipamentos" },
        { id: 2, nome: "Camisa Oficial Time A", vendas: 189, valor: 129.90, categoria: "Uniformes" },
        { id: 3, nome: "Chuteira Profissional", vendas: 156, valor: 299.90, categoria: "Calçados" },
        { id: 4, nome: "Meião Alto Compressão", vendas: 145, valor: 39.90, categoria: "Acessórios" },
        { id: 5, nome: "Kit Treino Completo", vendas: 123, valor: 199.90, categoria: "Kits" }
    ];

    const timesDestaque = [
        { id: 1, nome: "Dragões FC", membros: 15, vitorias: 23, pontos: 69, escudo: "🐉", visualizacoes: 15420 },
        { id: 2, nome: "Leões United", membros: 14, vitorias: 21, pontos: 63, escudo: "🦁", visualizacoes: 12890 },
        { id: 3, nome: "Águias FC", membros: 16, vitorias: 20, pontos: 60, escudo: "🦅", visualizacoes: 11340 },
        { id: 4, nome: "Tigres FC", membros: 13, vitorias: 18, pontos: 54, escudo: "🐯", visualizacoes: 9870 },
        { id: 5, nome: "Panteras FC", membros: 15, vitorias: 17, pontos: 51, escudo: "🐆", visualizacoes: 8560 }
    ];

    const jogadorasDestaque = [
        { id: 1, nome: "Maria Silva", time: "Dragões FC", gols: 34, assistencias: 12, posicao: "Atacante" },
        { id: 2, nome: "Ana Santos", time: "Leões United", gols: 28, assistencias: 15, posicao: "Meio-campo" },
        { id: 3, nome: "Julia Costa", time: "Águias FC", gols: 25, assistencias: 10, posicao: "Atacante" },
        { id: 4, nome: "Carla Mendes", time: "Tigres FC", gols: 22, assistencias: 18, posicao: "Meio-campo" },
        { id: 5, nome: "Paula Lima", time: "Panteras FC", gols: 20, assistencias: 14, posicao: "Atacante" }
    ];

    const noticiasRecentes = [
        {
            id: 1,
            titulo: "Copa PAB 2024 Confirmada!",
            data: "2024-11-05",
            visualizacoes: 2340,
            categoria: "Torneios"
        },
        {
            id: 2,
            titulo: "Novo Sistema de Chaveamento Implementado",
            data: "2024-11-03",
            visualizacoes: 1890,
            categoria: "Atualizações"
        },
        {
            id: 3,
            titulo: "Dragões FC Conquista Título Regional",
            data: "2024-11-01",
            visualizacoes: 3120,
            categoria: "Resultados"
        },
        {
            id: 4,
            titulo: "Loja PAB: Novos Produtos Disponíveis",
            data: "2024-10-28",
            visualizacoes: 1560,
            categoria: "Loja"
        }
    ];

    const vendasPorMes = [
        { mes: "Janeiro", valor: 8500 },
        { mes: "Fevereiro", valor: 9200 },
        { mes: "Março", valor: 10100 },
        { mes: "Abril", valor: 11300 },
        { mes: "Maio", valor: 10800 },
        { mes: "Junho", valor: 12850 }
    ];

    // Ranking de visualizações (ordenado por visualizações)
    const rankingVisualizacoes = [...timesDestaque].sort((a, b) => b.visualizacoes - a.visualizacoes);

    // Dados para gráfico de pizza - Vendas por Categoria
    const vendasPorCategoria = {
        labels: ['Equipamentos', 'Uniformes', 'Calçados', 'Acessórios', 'Kits'],
        datasets: [{
            label: 'Vendas por Categoria',
            data: [234, 189, 156, 145, 123],
            backgroundColor: [
                'rgba(147, 51, 234, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 146, 60, 0.8)'
            ],
            borderColor: [
                'rgba(147, 51, 234, 1)',
                'rgba(236, 72, 153, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(34, 197, 94, 1)',
                'rgba(251, 146, 60, 1)'
            ],
            borderWidth: 2
        }]
    };

    // Dados para gráfico de barras - Vendas por Mês
    const vendasBarData = {
        labels: vendasPorMes.map(item => item.mes),
        datasets: [{
            label: 'Vendas (R$)',
            data: vendasPorMes.map(item => item.valor),
            backgroundColor: 'rgba(147, 51, 234, 0.8)',
            borderColor: 'rgba(147, 51, 234, 1)',
            borderWidth: 2,
            borderRadius: 8
        }]
    };

    // Dados para gráfico de linha - Crescimento de Usuários
    const crescimentoUsuarios = {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
        datasets: [{
            label: 'Novos Usuários',
            data: [180, 220, 290, 320, 380, 457],
            borderColor: 'rgba(236, 72, 153, 1)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgba(236, 72, 153, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };

    // Dados para gráfico de barras horizontais - Visualizações por Time
    const visualizacoesPorTime = {
        labels: rankingVisualizacoes.map(time => time.nome),
        datasets: [{
            label: 'Visualizações',
            data: rankingVisualizacoes.map(time => time.visualizacoes),
            backgroundColor: [
                'rgba(147, 51, 234, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 146, 60, 0.8)'
            ],
            borderColor: [
                'rgba(147, 51, 234, 1)',
                'rgba(236, 72, 153, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(34, 197, 94, 1)',
                'rgba(251, 146, 60, 1)'
            ],
            borderWidth: 2,
            borderRadius: 8
        }]
    };

    // Opções dos gráficos
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    }
                }
            },
            title: {
                display: false
            }
        }
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return 'R$ ' + value.toLocaleString('pt-BR');
                    }
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 20,
                    font: {
                        size: 13,
                        family: "'Inter', sans-serif"
                    },
                    generateLabels: function (chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: `${label}: ${value} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            }
        }
    };

    const horizontalBarOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString('pt-BR');
                    }
                }
            }
        }
    };



    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-purple/10 via-pink/10 to-purple/10 overflow-auto">
                <PageBanner
                    title="Dashboard Administrativo"
                    subtitle="Visão geral completa da plataforma Passa Bola"
                />

                <main className="container mx-auto px-4 py-8 pb-20">

                    {/* Cards de Estatísticas Gerais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm opacity-90 mb-1">Total de Usuários</p>
                                    <p className="text-4xl font-black">{estatisticasGerais.totalUsuarios}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-xl">
                                    <span className="text-3xl">👥</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm opacity-90 mb-1">Total de Times</p>
                                    <p className="text-4xl font-black">{estatisticasGerais.totalTimes}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-xl">
                                    <span className="text-3xl">⚽</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm opacity-90 mb-1">Total de Jogadoras</p>
                                    <p className="text-4xl font-black">{estatisticasGerais.totalJogadoras}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-xl">
                                    <span className="text-3xl">👩</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 shadow-xl text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm opacity-90 mb-1">Produtos na Loja</p>
                                    <p className="text-4xl font-black">{estatisticasGerais.totalProdutos}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-xl">
                                    <span className="text-3xl">🛍️</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 shadow-xl text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm opacity-90 mb-1">Vendas do Mês</p>
                                    <p className="text-4xl font-black">R$ {estatisticasGerais.vendasMes.toFixed(2)}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-xl">
                                    <span className="text-3xl">💰</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-xl text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm opacity-90 mb-1">Partidas Realizadas</p>
                                    <p className="text-4xl font-black">{estatisticasGerais.partidasRealizadas}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-xl">
                                    <span className="text-3xl">🏆</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Gráfico de Barras - Vendas Mensais */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-purple mb-6">📊 Vendas Mensais</h2>
                            <div style={{ height: '320px' }}>
                                <Bar data={vendasBarData} options={barOptions} />
                            </div>
                        </div>

                        {/* Gráfico de Pizza - Vendas por Categoria */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-purple mb-6">🥧 Vendas por Categoria</h2>
                            <div style={{ height: '320px' }}>
                                <Pie data={vendasPorCategoria} options={pieOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Linha - Crescimento de Usuários */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                        <h2 className="text-2xl font-bold text-purple mb-6">📈 Crescimento de Usuários</h2>
                        <div style={{ height: '320px' }}>
                            <Line data={crescimentoUsuarios} options={chartOptions} />
                        </div>
                    </div>

                    {/* Ranking de Times Mais Visualizados */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Gráfico de Barras Horizontais */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-purple mb-6">👁️ Times Mais Visualizados</h2>
                            <div style={{ height: '320px' }}>
                                <Bar data={visualizacoesPorTime} options={horizontalBarOptions} />
                            </div>
                        </div>

                        {/* Ranking Detalhado */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-purple mb-6">🏅 Ranking de Visualizações</h2>
                            <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '320px' }}>
                                {rankingVisualizacoes.map((time, index) => {
                                    const medalColor = index === 0 ? 'from-yellow-400 to-yellow-600' :
                                        index === 1 ? 'from-gray-400 to-gray-600' :
                                            index === 2 ? 'from-orange-600 to-orange-800' :
                                                'from-purple to-pink';

                                    return (
                                        <div key={time.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple/5 to-pink/5 rounded-xl hover:shadow-lg transition-all relative overflow-hidden">
                                            {index < 3 && (
                                                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${medalColor}`}></div>
                                            )}

                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={`bg-gradient-to-br ${medalColor} text-white font-black text-xl w-12 h-12 rounded-full flex items-center justify-center shadow-lg`}>
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                                </div>
                                                <div className="text-5xl">{time.escudo}</div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800 text-lg">{time.nome}</p>
                                                    <p className="text-sm text-gray-500">{time.membros} membros • {time.vitorias} vitórias</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-black text-2xl text-purple">
                                                    {time.visualizacoes.toLocaleString('pt-BR')}
                                                </p>
                                                <p className="text-xs text-gray-500 font-semibold">visualizações</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Produtos Mais Vendidos */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-purple mb-6">🛒 Produtos Mais Vendidos</h2>
                            <div className="space-y-4">
                                {produtosMaisVendidos.map((produto, index) => (
                                    <div key={produto.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple/5 to-pink/5 rounded-xl hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gradient-to-br from-purple to-pink text-white font-black text-lg w-10 h-10 rounded-full flex items-center justify-center">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{produto.nome}</p>
                                                <p className="text-sm text-gray-500">{produto.categoria}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-purple">{produto.vendas} vendas</p>
                                            <p className="text-sm text-gray-600">R$ {produto.valor.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Times em Destaque */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-purple mb-6">🏆 Times em Destaque</h2>
                            <div className="space-y-4">
                                {timesDestaque.map((time) => (
                                    <div key={time.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple/5 to-pink/5 rounded-xl hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl">{time.escudo}</div>
                                            <div>
                                                <p className="font-bold text-gray-800">{time.nome}</p>
                                                <p className="text-sm text-gray-500">{time.membros} membros</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">{time.vitorias} vitórias</p>
                                            <p className="text-sm text-purple font-semibold">{time.pontos} pontos</p>
                                            <p className="text-xs text-gray-500 mt-1">👁️ {time.visualizacoes.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Jogadoras em Destaque */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-purple mb-6">⭐ Jogadoras em Destaque</h2>
                            <div className="space-y-4">
                                {jogadorasDestaque.map((jogadora, index) => (
                                    <div key={jogadora.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple/5 to-pink/5 rounded-xl hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gradient-to-br from-purple to-pink text-white font-black text-lg w-10 h-10 rounded-full flex items-center justify-center">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{jogadora.nome}</p>
                                                <p className="text-sm text-gray-500">{jogadora.time} • {jogadora.posicao}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-purple">⚽ {jogadora.gols} gols</p>
                                            <p className="text-sm text-gray-600">🎯 {jogadora.assistencias} assists</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notícias Recentes */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-purple mb-6">📰 Notícias Recentes</h2>
                            <div className="space-y-4">
                                {noticiasRecentes.map((noticia) => (
                                    <div key={noticia.id} className="p-4 bg-gradient-to-r from-purple/5 to-pink/5 rounded-xl hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-800 flex-1">{noticia.titulo}</h3>
                                            <span className="text-xs bg-purple text-white px-3 py-1 rounded-full ml-2">
                                                {noticia.categoria}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>📅 {new Date(noticia.data).toLocaleDateString('pt-BR')}</span>
                                            <span>👁️ {noticia.visualizacoes.toLocaleString()} views</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}