export default function MainContainer({ children }) {
    return (
        <main className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            {children}
        </main>
    );
}