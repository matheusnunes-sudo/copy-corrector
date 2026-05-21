import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Você é um especialista em revisão de textos de marketing em português brasileiro.
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
  const { texto } = await req.json();

  if (!texto || texto.trim().length === 0) {
    return Response.json({ error: "Texto vazio." }, { status: 400 });
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Corrija este copy:\n\n${texto}` }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    return Response.json({ error: "Resposta inesperada da IA." }, { status: 500 });
  }

  try {
    const parsed = JSON.parse(content.text);
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "Erro ao processar resposta da IA." }, { status: 500 });
  }
}
