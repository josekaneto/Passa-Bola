"use client";
import React, { useState } from "react";

export default function ContactSection() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [status, setStatus] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Enviando...");
        try {
            // Substitua a rota abaixo pela sua API se tiver
            await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            setStatus("Mensagem enviada!");
            setForm({ name: "", email: "", subject: "", message: "" });
        } catch (err) {
            setStatus("Erro ao enviar. Tente novamente.");
        }
    };

    return (
        <section className="w-full flex justify-center">
            <div className="w-full max-w-[80%] flex flex-col md:flex-row md:justify-between items-start py-12 px-4 md:px-0 gap-8">

                <div
                    className="pr-8 mb-8 md:mb-0"
                    data-aos="fade-right"
                    data-aos-duration="1000"
                >
                    <span className="bg-green text-black px-3 py-1 rounded-full text-sm font-semibold inline-block mb-6" data-aos="fade-right" data-aos-delay="100">
                        CONTATO
                    </span>
                    <h2 className="text-4xl text-black font-title font-bold mb-6" data-aos="fade-right" data-aos-delay="200">FALE COM A GENTE</h2>
                    <p className="max-w-xl mb-8 text-lg text-black/90" data-aos="fade-right" data-aos-delay="300">
                        Tem alguma dúvida, sugestão ou quer saber mais sobre a Copa Passa Bola? Entre em contato conosco e teremos prazer em ajudar.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4" data-aos="fade-right" data-aos-delay="350">
                            <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center">
                                <img src="/email.svg" alt="Email icon" className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold">Email</p>
                                <p className="text-sm text-black/90">contato@copapassabola.com.br</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4" data-aos="fade-right" data-aos-delay="450">
                            <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center">
                                <img src="/phone.svg" alt="Phone icon" className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold">Telefone</p>
                                <p className="text-sm text-black/90">(11) 1111-1111</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4" data-aos="fade-right" data-aos-delay="550">
                            <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center">
                                <img src="/pointer.svg" alt="Localização icon" className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold">Endereço</p>
                                <p className="text-sm text-black/90">Av. das Nações, 500 - Centro, São Paulo - SP</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className=""
                    data-aos="fade-left"
                    data-aos-duration="1000"
                    data-aos-delay="200"
                >
                    <div className="rounded-xl p-8 text-gray-800 shadow-2xl/90 shadow-pink" data-aos="fade-left" data-aos-delay="550">
                        <h3 className="text-3xl font-semibold text-purple mb-4 font-title">Envie sua mensagem</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Seu nome"
                                    required
                                    className="border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:border-pink-500 focus:ring-0"
                                />
                                <input
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Seu email"
                                    type="email"
                                    required
                                    className="border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:border-pink-500 focus:ring-0"
                                />
                            </div>

                            <input
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                placeholder="Assunto da mensagem"
                                className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:border-pink-500 focus:ring-0"
                            />

                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Sua mensagem"
                                rows="6"
                                className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:border-pink-500 focus:ring-0"
                            />

                            <button type="submit" className="w-full bg-purple text-white font-bold px-6 py-3 rounded-md cursor-pointer hover:scale-105 transition-transform duration-500">
                                ENVIAR MENSAGEM
                            </button>

                            {status && <p className="text-sm text-gray-500 mt-2">{status}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}