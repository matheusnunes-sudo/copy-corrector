import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PROMPT = `Você é um especialista em revisão de textos de marketing em português brasileiro.
Sua tarefa é corrigir erros de gramática e ortografia em copies publicitários (anúncios, carrosséis, landing pages, etc.).

Responda SEMPRE em JSON válido com o seguinte formato:
{
  "corrigido": "texto completo corrigido",
  "erros": [
    {
      "original": "trecho com erro",
      "corrigido": "trecho corrigido",
      "explicacao": "explicação breve do erro"
    }
  ],
  "resumo": "resumo em uma frase do que foi corrigido (ou 'Nenhum erro encontrado.' se o texto estiver correto)"
}

Se não houver erros, retorne a lista "erros" vazia.
Mantenha o tom, estilo e intenção do copy original. Corrija apenas erros claros de gramática e ortografia.`;

export async function POST(req: Request) {
  try {
    const { texto } = await req.json();

    if (!texto || texto.trim().length === 0) {
      return Response.json({ error: "Texto vazio." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(`${PROMPT}\n\nCorrija este copy:\n\n${texto}`);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return Response.json(parsed);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro inesperado.";
    return Response.json({ error: message }, { status: 500 });
  }
}
