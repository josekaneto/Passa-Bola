export default function TimeCard({ nome, descricao, imagem, membros, link }) {
    return (
    <div className="bg-purple/20 rounded-2xl p-4 flex flex-col gap-2 shadow-2xl max-h-[280px] w-full items-center">
            <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-1">
                    <img src={imagem} alt="Avatar Time" className="w-15 h-15 rounded-full object-cover" />
                </div>
                <h3 className="text-lg font-bold text-black">{nome}</h3>
                <p className="text-md text-gray-700 text-center">{descricao}</p>
            </div>
            <div className="flex flex-row sm:flex-col justify-between items-center w-full mt-2 gap-1">
                <a href={link} className="bg-pink text-white font-bold py-1 px-3 text-center rounded shadow hover:bg-pink-600 transition text-lg w-1/2">Exibir Detalhes</a>
                <span className="text-lg font-bold text-black sm:mt-1">{membros}</span>
            </div>
        </div>
    );
}
