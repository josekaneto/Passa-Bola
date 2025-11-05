import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/lib/models';

// Função para remover acentos e converter para minúsculas
const normalizeString = (str) => {
    if (!str) return "";
    return str
        .normalize("NFD") // Separa os acentos das letras
        .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
        .toLowerCase(); // Converte para minúsculas
};

export async function GET(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoria = searchParams.get('categoria');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Build query
    const query = { isActive: true };

    // Filter by category
    if (categoria) {
      query.categoria = categoria;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.preco = {};
      if (minPrice) {
        query.preco.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.preco.$lte = parseFloat(maxPrice);
      }
    }

    // Find products based on price and category first
    let products = await Product.find(query)
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    // If there's a search term, filter the results in the application
    if (search) {
      const normalizedSearchTerm = normalizeString(search);
      products = products.filter(product => 
        normalizeString(product.nome).includes(normalizedSearchTerm)
      );
    }

    // Transform products to match frontend format
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      nome: product.nome,
      preco: product.preco,
      imagem: product.imagem,
      tamanhos: product.tamanhos || [],
      descricao: product.descricao,
      categoria: product.categoria,
      estoque: product.estoque,
      isFeatured: product.isFeatured,
      isNew: product.isNewProduct
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts
    }, { status: 200 });

  } catch (error) {
    console.error('Get products error:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      return NextResponse.json(
        { error: 'Produtos já existem no banco de dados. Use DELETE para limpar antes de popular novamente.' },
        { status: 400 }
      );
    }

    // Seed products based on the original hardcoded list
    const seedProducts = [
      {
        nome: "Camisa Oficial PAB",
        preco: 129.90,
        imagem: "/camiseta.png",
        categoria: "Camisas",
        tamanhos: ['P', 'M', 'G', 'GG'],
        descricao: "Camisa oficial da Passa Bola com design exclusivo e material de alta qualidade.",
        estoque: 100,
        isActive: true,
        isFeatured: true,
        isNewProduct: true
      },
      {
        nome: "Chuteira Profissional",
        preco: 499.90,
        imagem: "/chuteira.avif",
        categoria: "Chuteiras",
        tamanhos: ['34', '35', '36', '37', '38', '39', '40', '41', '42'],
        descricao: "Chuteira profissional para futebol de alto desempenho.",
        estoque: 50,
        isActive: true,
        isFeatured: true,
        isNewProduct: false
      },
      {
        nome: "Bola Oficial PAB",
        preco: 149.90,
        imagem: "/bola.png",
        categoria: "Equipamentos",
        descricao: "Bola oficial da Passa Bola, ideal para treinos e jogos.",
        estoque: 80,
        isActive: true,
        isFeatured: true,
        isNewProduct: true
      },
      {
        nome: "Kit Treino Completo",
        preco: 199.90,
        imagem: "/kitTreinamento.jpeg",
        categoria: "Equipamentos",
        descricao: "Kit completo para treinamento incluindo equipamentos essenciais.",
        estoque: 30,
        isActive: true,
        isFeatured: false,
        isNewProduct: false
      },
      {
        nome: "Meião Oficial PAB",
        preco: 39.90,
        imagem: "/meiao.png",
        categoria: "Acessórios",
        tamanhos: ['P', 'M', 'G'],
        descricao: "Meião oficial da Passa Bola, confortável e resistente.",
        estoque: 150,
        isActive: true,
        isFeatured: false,
        isNewProduct: false
      },
      {
        nome: "Luvas de Goleira",
        preco: 159.90,
        imagem: "/luva.png",
        categoria: "Equipamentos",
        tamanhos: ['P', 'M', 'G'],
        descricao: "Luvas profissionais para goleiras com máxima proteção e aderência.",
        estoque: 40,
        isActive: true,
        isFeatured: false,
        isNewProduct: false
      },
      {
        nome: "Mochila Esportiva PAB",
        preco: 119.90,
        imagem: "/mochila.png",
        categoria: "Acessórios",
        descricao: "Mochila esportiva espaçosa e resistente, ideal para transporte de equipamentos.",
        estoque: 60,
        isActive: true,
        isFeatured: false,
        isNewProduct: true
      },
      {
        nome: "Boné Oficial PAB",
        preco: 59.90,
        imagem: "/bone.png",
        categoria: "Acessórios",
        descricao: "Boné oficial da Passa Bola com ajuste regulável.",
        estoque: 120,
        isActive: true,
        isFeatured: false,
        isNewProduct: false
      },
      {
        nome: "Caneleiras de Proteção",
        preco: 49.90,
        imagem: "/caneleira.png",
        categoria: "Equipamentos",
        tamanhos: ['Infantil', 'Adulto'],
        descricao: "Caneleiras de proteção para treinos e jogos.",
        estoque: 90,
        isActive: true,
        isFeatured: false,
        isNewProduct: false
      },
      {
        nome: "Caneca Oficial PAB",
        preco: 19.90,
        imagem: "/caneca.png",
        categoria: "Lembranças",
        descricao: "Caneca oficial da Passa Bola, perfeita para o seu café.",
        estoque: 200,
        isActive: true,
        isFeatured: false,
        isNewProduct: false
      },
      {
        nome: "Garrafa Térmica PAB",
        preco: 49.90,
        imagem: "/garrafa.png",
        categoria: "Acessórios",
        descricao: "Garrafa térmica oficial, mantém a temperatura por horas.",
        estoque: 70,
        isActive: true,
        isFeatured: false,
        isNewProduct: true
      },
      {
        nome: "Chaveiro Oficial PAB",
        preco: 9.90,
        imagem: "/chaveiro.png",
        categoria: "Lembranças",
        descricao: "Chaveiro oficial da Passa Bola, perfeito para levar sempre com você.",
        estoque: 300,
        isActive: true,
        isFeatured: false,
        isNewProduct: false
      }
    ];

    // Insert products into database
    const createdProducts = await Product.insertMany(seedProducts);

    return NextResponse.json({
      success: true,
      message: `${createdProducts.length} produtos foram adicionados ao banco de dados`,
      count: createdProducts.length
    }, { status: 201 });

  } catch (error) {
    console.error('Seed products error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Alguns produtos já existem no banco de dados' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao popular produtos', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear all products (optional, for development)
export async function DELETE(request) {
  try {
    await connectDB();
    
    const result = await Product.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} produtos foram removidos do banco de dados`,
      deletedCount: result.deletedCount
    }, { status: 200 });

  } catch (error) {
    console.error('Delete products error:', error);
    
    return NextResponse.json(
      { error: 'Erro ao remover produtos' },
      { status: 500 }
    );
  }
}

