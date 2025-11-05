// Componente para exibir jogadora convidada
export default function JogadoraCard({ nomeCompleto, pernaDominante, posicao, userId, onViewProfile }) {
    return (
        <div className="flex flex-row items-center gap-4 p-4 bg-purple-100 rounded-xl shadow-sm min-w-[260px]">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-gray-300">
                <svg width="32" height="32" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4"/></svg>
            </div>
            <div className="flex-1 flex flex-col gap-1">
                <span className="font-bold text-lg text-black">{nomeCompleto}</span>
                <span className="text-black text-base">{posicao}</span>
            </div>
            <div className="flex flex-col items-end gap-1 min-w-[120px]">
                <span className="text-black text-sm">Perna boa: {pernaDominante}</span>
                {userId && onViewProfile && (
                    <button 
                        className="text-pink-400 text-xs font-semibold cursor-pointer hover:text-pink-600 hover:underline transition-colors"
                        onClick={() => onViewProfile(userId)}
                    >
                        Mais informações
                    </button>
                )}
            </div>
        </div>
    );
}
