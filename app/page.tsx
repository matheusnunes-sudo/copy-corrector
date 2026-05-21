"use client";

import { useState } from "react";

interface Erro {
  original: string;
  corrigido: string;
  explicacao: string;
}

interface Resultado {
  corrigido: string;
  erros: Erro[];
  resumo: string;
}

export default function Home() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function corrigir() {
    if (!texto.trim()) return;
    setCarregando(true);
    setErro(null);
    setResultado(null);

    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao corrigir.");
      setResultado(data);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  }

  function copiarTexto(t: string) {
    navigator.clipboard.writeText(t);
  }

  const semErros = resultado && resultado.erros.length === 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900">Corretor de Copy</h1>
          <p className="text-xs text-gray-500">Assaad Educação</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Cole o copy aqui
          </label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ex: Aprenda a investir do zéro e conquiste sua liberdade financeira..."
            rows={8}
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{texto.length} caracteres</span>
            <button
              onClick={corrigir}
              disabled={carregando || !texto.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {carregando ? "Corrigindo..." : "Corrigir"}
            </button>
          </div>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {erro}
          </div>
        )}

        {resultado && (
          <div className="space-y-4">
            <div
              className={`rounded-xl border shadow-sm p-6 space-y-4 ${
                semErros
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                    semErros ? "text-green-700" : "text-orange-600"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      semErros ? "bg-green-500" : "bg-orange-400"
                    }`}
                  />
                  {semErros
                    ? "Nenhum erro encontrado"
                    : `${resultado.erros.length} ${resultado.erros.length === 1 ? "correção" : "correções"}`}
                </span>
                <button
                  onClick={() => copiarTexto(resultado.corrigido)}
                  className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-md transition-colors"
                >
                  Copiar texto corrigido
                </button>
              </div>

              <div className="bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {resultado.corrigido}
              </div>
            </div>

            {resultado.erros.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Correções realizadas</h2>
                <div className="space-y-3">
                  {resultado.erros.map((e, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                      <span className="text-gray-400 font-medium min-w-[20px]">{i + 1}.</span>
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="line-through text-red-500 bg-red-50 px-2 py-0.5 rounded">
                            {e.original}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded font-medium">
                            {e.corrigido}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs">{e.explicacao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
