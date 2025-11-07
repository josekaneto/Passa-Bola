import Image from 'next/image';
import Link from 'next/link';

export default function TimeCard({ nome, descricao, imagem, membros, link }) {
    return (
        <Link href={link} className="block group">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-purple/10 hover:border-purple/30 transition-all duration-300 transform hover:scale-105">
                <div className="relative h-48 w-full bg-gradient-to-br from-purple/10 to-pink/10">
                    {imagem && imagem.startsWith('data:image') ? (
                        <img 
                            src={imagem}
                            alt={nome}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Image
                            src={imagem || "/time_padrao.png"}
                            alt={nome}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )}
                </div>
                
                <div className="p-6">
                    <h3 className="text-xl font-bold text-purple mb-2 font-title group-hover:text-pink transition-colors">
                        {nome}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {descricao}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-700">{membros}</span>
                        </div>
                        
                        <div className="bg-purple/10 px-3 py-1 rounded-lg">
                            <span className="text-xs font-bold text-purple">Ver Time</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
