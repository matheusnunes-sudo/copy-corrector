"use client";

import { KeyboardEvent, useState } from "react";

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
  const [copiado, setCopiado] = useState(false);

  async function corrigir() {
    if (!texto.trim()) return;
    setCarregando(true);
    setErro(null);
    setResultado(null);
    setCopiado(false);

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

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      corrigir();
    }
  }

  function copiarTexto(t: string) {
    navigator.clipboard.writeText(t);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const semErros = resultado && resultado.erros.length === 0;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900">Corretor de Copy</h1>
          <p className="text-xs text-gray-500">Assaad Educação</p>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-[1fr_auto_1fr] grid-cols-1 relative">
            {/* Lado original */}
            <div className="p-5 md:border-r border-b md:border-b-0 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Texto original
                </label>
                <span className="text-xs text-gray-400">{texto.length} caracteres</span>
              </div>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cole seu copy aqui e pressione ⌘+Enter (ou Ctrl+Enter)..."
                rows={10}
                className="w-full resize-none border-0 p-0 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 bg-transparent leading-relaxed"
              />
            </div>

            {/* Seta divisória (apenas desktop) */}
            <div className="hidden md:flex items-center justify-center px-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Lado corrigido */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Texto corrigido
                </label>
                {resultado && (
                  <button
                    onClick={() => copiarTexto(resultado.corrigido)}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {copiado ? "Copiado!" : "Copiar"}
                  </button>
                )}
              </div>
              <div className="min-h-[240px] text-sm leading-relaxed whitespace-pre-wrap">
                {carregando ? (
                  <span className="text-gray-400 italic">Corrigindo...</span>
                ) : resultado ? (
                  <span className="text-gray-800">{resultado.corrigido}</span>
                ) : (
                  <span className="text-gray-300">A versão corrigida aparecerá aqui...</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer com botão */}
          <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-400 hidden sm:block">
              Pressione <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono text-[10px]">⌘</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono text-[10px]">Enter</kbd> para corrigir
            </span>
            <button
              onClick={corrigir}
              disabled={carregando || !texto.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors ml-auto"
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
              className={`rounded-xl border shadow-sm p-5 ${
                semErros
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-200"
              }`}
            >
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
                  : `${resultado.erros.length} ${resultado.erros.length === 1 ? "correção realizada" : "correções realizadas"}`}
              </span>
            </div>

            {resultado.erros.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Apontamentos</h2>
                <div className="space-y-3">
                  {resultado.erros.map((e, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                      <span className="text-gray-400 font-medium min-w-[20px]">{i + 1}.</span>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="line-through text-red-500 bg-red-50 px-2 py-0.5 rounded">
                            {e.original}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded font-medium">
                            {e.corrigido}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed">{e.explicacao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="border-t border-gray-200 bg-white px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          Corretor de Copy é uma IA e pode cometer erros. Por favor, verifique as respostas.
        </p>
      </footer>
    </main>
  );
}
