"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function NotificationBell({ userId }) {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (userId) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (!authToken || !userId) return;

        try {
            const response = await fetch('/api/invitations?status=pending', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.invitations || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleAccept = async (invitationId) => {
        const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (!authToken) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/invitations/${invitationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ action: 'accept' })
            });

            if (response.ok) {
                // Remove accepted notification
                setNotifications(prev => prev.filter(n => n.id !== invitationId));
                // Refresh page to show updated team
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Erro ao aceitar convite');
            }
        } catch (error) {
            console.error('Error accepting invitation:', error);
            alert('Erro ao aceitar convite');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async (invitationId) => {
        const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (!authToken) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/invitations/${invitationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ action: 'decline' })
            });

            if (response.ok) {
                // Remove declined notification
                setNotifications(prev => prev.filter(n => n.id !== invitationId));
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Erro ao recusar convite');
            }
        } catch (error) {
            console.error('Error declining invitation:', error);
            alert('Erro ao recusar convite');
        } finally {
            setLoading(false);
        }
    };

    const pendingCount = notifications.filter(n => n.status === 'pending').length;

    return (
        <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative bg-pink text-white rounded-full p-4 shadow-lg hover:bg-pink-600 transition-colors duration-200 flex items-center justify-center"
                style={{ width: '56px', height: '56px' }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-purple">Notificações</h3>
                        {pendingCount > 0 && (
                            <p className="text-sm text-gray-600">
                                {pendingCount} notificaç{pendingCount > 1 ? 'ões' : 'ão'} pendente{pendingCount > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <p>Nenhuma notificação</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {notifications.map((notification) => (
                                <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-start gap-3">
                                            {notification.teamImage && (
                                                <img
                                                    src={notification.teamImage}
                                                    alt={notification.teamName}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                {notification.type === 'join_request' ? (
                                                    <>
                                                        <p className="font-semibold text-gray-800">
                                                            Nova Solicitação de Entrada
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            <strong>{notification.userName}</strong> quer entrar no time <strong>{notification.teamName}</strong>
                                                        </p>
                                                        {notification.teamDescription && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {notification.teamDescription}
                                                            </p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="font-semibold text-gray-800">
                                                            Convite para {notification.teamName}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Por {notification.captainName}
                                                        </p>
                                                        {notification.teamDescription && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {notification.teamDescription}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {notification.status === 'pending' && (
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleAccept(notification.id)}
                                                    disabled={loading}
                                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    Aceitar
                                                </button>
                                                <button
                                                    onClick={() => handleDecline(notification.id)}
                                                    disabled={loading}
                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    Recusar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

