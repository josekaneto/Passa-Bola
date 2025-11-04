export default function SectionContainer({ children, tamanho }) {
    const style = tamanho ? { maxWidth: `${tamanho}px` } : {};

    return (
        <section 
            className="w-full bg-white p-6 sm:p-8 rounded-xl shadow-lg flex flex-col items-center justify-center"
            style={style}
        >
            {children}
        </section>
    );
}