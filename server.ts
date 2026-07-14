import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: "10mb" }));

// Helper to seed db.json with high-quality defaults
function getInitialData() {
  const now = new Date().toISOString();
  return [
    {
      id: "pres_1",
      title: "Resultados Q2 & Melhorias - Operação Têxtil",
      themeId: "beige",
      category: "Resultados Operacionais",
      lastSaved: now,
      slides: [
        {
          id: "slide_1_1",
          type: "title",
          title: "Resultados Q2 & Eficiência",
          subtitle: "Indicadores, Melhorias e Plano de Ação - 2026",
          content: "Apresentação executiva detalhando as métricas de produção, conquistas operacionais e as principais melhorias implementadas no último trimestre."
        },
        {
          id: "slide_1_2",
          type: "results",
          title: "Indicadores Financeiros & Produtivos",
          subtitle: "Destaques positivos do segundo trimestre",
          content: "Consolidação de receitas e eficiência de processos operacionais com redução sistemática de perdas.",
          metrics: [
            { id: "m1", label: "Faturamento Líquido", value: "R$ 4.8M", change: "+14.2% vs Q1", trend: "up" },
            { id: "m2", label: "Custo de Manutenção", value: "R$ 320k", change: "-8.5% vs Q1", trend: "up" }, // positive trend implies cost went down
            { id: "m3", label: "OEE Global (Eficiência)", value: "82.4%", change: "+3.1% vs Q1", trend: "up" }
          ]
        },
        {
          id: "slide_1_3",
          type: "indicators",
          title: "Métricas de Qualidade & Entrega",
          subtitle: "Acompanhamento detalhado dos principais KPIs operacionais",
          content: "As taxas de refugo atingiram a meta mínima histórica graças aos novos sensores de calibração.",
          bulletPoints: [
            "Taxa de Conformidade de Produtos: 98.7% (Meta: 98.0%)",
            "OTIF (On-Time In-Full): 95.4% de entregas perfeitas",
            "Tempo Médio de Atendimento: Reduzido de 48h para 36h"
          ],
          metrics: [
            { id: "m4", label: "Taxa de Refugo", value: "1.3%", change: "-0.5%", trend: "up" },
            { id: "m5", label: "Reclamações Clientes", value: "4 chamados", change: "-50%", trend: "up" }
          ]
        },
        {
          id: "slide_1_4",
          type: "improvements",
          title: "Plano de Melhorias Implementadas",
          subtitle: "Ações corretivas e preventivas executadas no período",
          content: "Investimentos focados em automação e qualificação das equipes de operação de chão de fábrica.",
          steps: [
            { id: "s1", title: "Automação da Embalagem", description: "Instalação da nova seladora automática na Linha 3", status: "completed" },
            { id: "s2", title: "Treinamento Lean Manufacturing", description: "Capacitação de 100% dos operadores em eliminação de desperdício", status: "completed" },
            { id: "s3", title: "Predição de Falhas", description: "Sensores IoT nas extrusoras principais para alertas preventivos", status: "in_progress" }
          ]
        },
        {
          id: "slide_1_5",
          type: "comparison",
          title: "Análise Antes vs. Depois: Setup de Linha",
          subtitle: "Resultados obtidos com a metodologia SMED",
          content: "Comparativo prático da reestruturação do processo de troca de ferramentas nas injetoras de nylon.",
          comparisons: [
            { id: "c1", before: "Tempo de setup médio: 140 minutos por máquina", after: "Tempo reduzido para 45 minutos (economia de 68%)" },
            { id: "c2", before: "Desperdício de 15kg de matéria-prima por troca", after: "Apenas 3kg de perdas de purga (redução de 80%)" },
            { id: "c3", before: "Processo manual dependente de operador sênior", after: "Instrução de Trabalho Visual e ferramentas rápidas" }
          ]
        },
        {
          id: "slide_1_6",
          type: "closing",
          title: "Conclusões & Próximos Passos",
          subtitle: "Foco estratégico para o próximo trimestre",
          content: "Para o Q3, manteremos o foco na expansão das células IoT e consolidação dos ganhos de setup, visando margem operacional de 22%. Agradecemos a toda equipe pelo empenho!",
          bulletPoints: [
            "Concluir setup rápido nas linhas auxiliares",
            "Homologar novos fornecedores regionais de insumos",
            "Iniciar auditoria interna de certificação ISO 9001"
          ]
        }
      ],
      comments: [
        {
          id: "c_1",
          slideId: "slide_1_2",
          author: "Mariana (Gestora)",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
          text: "Excelente resultado no faturamento líquído! Podemos incluir o valor do EBITDA se tivermos?",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: "c_2",
          slideId: "slide_1_4",
          author: "Carlos (BI)",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
          text: "A automação da Linha 3 já mostra economia real de energia. Parabéns!",
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      versions: [
        {
          id: "v_1",
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          description: "Versão Inicial Gerada",
          author: "Sistema",
          slides: []
        }
      ]
    },
    {
      id: "pres_2",
      title: "Plano de Eficiência Energética",
      themeId: "green",
      category: "Sustentabilidade",
      lastSaved: now,
      slides: [
        {
          id: "slide_2_1",
          type: "title",
          title: "Eficiência Energética & Sustentabilidade",
          subtitle: "Redução de Pegada de Carbono e Custos de Utilidades",
          content: "Projeto estratégico para mitigação de consumo de energia e implementação de matriz solar fotovoltaica."
        },
        {
          id: "slide_2_2",
          type: "results",
          title: "Métricas Atuais de Consumo",
          subtitle: "Panorama de custos e consumo por planta fabril",
          content: "Diagnóstico inicial aponta alto consumo no horário de ponta.",
          metrics: [
            { id: "m2_1", label: "Consumo Médio", value: "142 MWh/mês", change: "+4.2% vs ano anterior", trend: "down" },
            { id: "m2_2", label: "Custo Mensal", value: "R$ 89k", change: "Bandeira tarifária vermelha", trend: "down" }
          ]
        }
      ],
      comments: [],
      versions: [
        {
          id: "v_2_1",
          timestamp: now,
          description: "Criação do rascunho de energia",
          author: "Sistema",
          slides: []
        }
      ]
    },
    {
      id: "pres_3",
      title: "Melhorias de Logística & Expedição",
      themeId: "blue",
      category: "Indicadores e Processos",
      lastSaved: now,
      slides: [
        {
          id: "slide_3_1",
          type: "title",
          title: "Otimização Logística",
          subtitle: "Redução de Lead Time de Entrega",
          content: "Análise de gargalos operacionais no fluxo de estocagem, paletização e carregamento."
        }
      ],
      comments: [],
      versions: [
        {
          id: "v_3_1",
          timestamp: now,
          description: "Rascunho inicial logística",
          author: "Sistema",
          slides: []
        }
      ]
    }
  ];
}

// Read database
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const data = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return data;
  }
  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Erro ao ler db.json, restaurando padrão:", err);
    return getInitialData();
  }
}

// Write database
function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Check Gemini API Key
const isGeminiAvailable = () => {
  return process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && process.env.GEMINI_API_KEY !== "";
};

// --- Endpoints ---

// Get all presentations
app.get("/api/presentations", (req, res) => {
  res.json(readDB());
});

// Update or create a presentation
app.post("/api/presentations", (req, res) => {
  const presentation = req.body;
  if (!presentation.id) {
    return res.status(400).json({ error: "ID da apresentação é obrigatório." });
  }

  const db = readDB();
  const index = db.findIndex((p: any) => p.id === presentation.id);

  const now = new Date().toISOString();
  presentation.lastSaved = now;

  // Add a new version tracking history
  const author = req.headers["x-user-author"] as string || "Usuário";
  const newVersion = {
    id: `v_${Date.now()}`,
    timestamp: now,
    description: `Alteração: ${presentation.title}`,
    author,
    slides: JSON.parse(JSON.stringify(presentation.slides))
  };

  if (!presentation.versions) {
    presentation.versions = [];
  }
  
  // Max 15 versions stored
  presentation.versions.unshift(newVersion);
  if (presentation.versions.length > 15) {
    presentation.versions.pop();
  }

  if (index >= 0) {
    db[index] = presentation;
  } else {
    db.push(presentation);
  }

  writeDB(db);
  res.json(presentation);
});

// Bulk offline sync endpoint
app.post("/api/presentations/sync", (req, res) => {
  const syncedPresentations = req.body;
  if (!Array.isArray(syncedPresentations)) {
    return res.status(400).json({ error: "Formato inválido. Esperado array." });
  }

  const db = readDB();
  const author = req.headers["x-user-author"] as string || "Sincronização Offline";
  const now = new Date().toISOString();

  syncedPresentations.forEach((p: any) => {
    p.lastSaved = now;
    if (!p.versions) p.versions = [];
    p.versions.unshift({
      id: `v_${Date.now()}_sync`,
      timestamp: now,
      description: "Sincronizado automaticamente pós-offline",
      author,
      slides: JSON.parse(JSON.stringify(p.slides))
    });
    if (p.versions.length > 15) p.versions.pop();

    const idx = db.findIndex((dbP: any) => dbP.id === p.id);
    if (idx >= 0) {
      db[idx] = p;
    } else {
      db.push(p);
    }
  });

  writeDB(db);
  res.json({ status: "success", count: syncedPresentations.length, data: db });
});

// AI Topic Generator
app.post("/api/gemini/generate-topics", async (req, res) => {
  const { title, slideType, context } = req.body;

  if (!isGeminiAvailable()) {
    // Return a beautiful mocked set of topics related to the requested type if key is not configured yet
    return res.json({
      topics: getMockedTopics(slideType, title, context),
      fallback: true
    });
  }

  try {
    const prompt = `Você é um assessor sênior em consultoria empresarial especialista em apresentações de alta qualidade.
Gere 3 a 4 tópicos profissionais em português para um slide do tipo "${slideType}" pertencente à apresentação intitulada "${title}".
Contexto extra do slide: "${context || 'Foco em resultados de qualidade, indicadores e melhorias operacionais'}".
Retorne o resultado estritamente em formato JSON, utilizando a seguinte estrutura:
{
  "topics": ["Tópico profissional curto 1", "Tópico profissional curto 2", "Tópico profissional curto 3"]
}
Retorne somente o JSON limpo, sem explicações adicionais ou marcações de markdown adicionais.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de tópicos ou bullet points objetivos para o slide."
            }
          },
          required: ["topics"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ topics: parsed.topics || [], fallback: false });
  } catch (error: any) {
    console.error("Gemini topics generation error:", error);
    res.json({
      topics: getMockedTopics(slideType, title, context),
      fallback: true,
      error: error.message
    });
  }
});

// AI Text Refine & Suggestions
app.post("/api/gemini/suggest-text", async (req, res) => {
  const { slideTitle, currentText, type } = req.body;

  if (!isGeminiAvailable()) {
    return res.json({
      suggestedText: getMockedRefinement(type, slideTitle, currentText),
      fallback: true
    });
  }

  try {
    const prompt = `Como um revisor executivo focado em relatórios corporativos, melhore e torne o seguinte texto mais impactante, objetivo e profissional em português.
Título do Slide: "${slideTitle}"
Tipo de Slide: "${type}"
Texto Atual: "${currentText}"

Sua tarefa é reescrever este texto para ficar conciso, formal e focado em resultados (indicadores, melhorias, KPIs).
Retorne a sugestão estritamente no formato JSON:
{
  "suggestedText": "Seu texto otimizado aqui"
}
Evite enrolação.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedText: { type: Type.STRING, description: "O texto profissionalmente refinado." }
          },
          required: ["suggestedText"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ suggestedText: parsed.suggestedText || currentText, fallback: false });
  } catch (error: any) {
    console.error("Gemini refinement error:", error);
    res.json({
      suggestedText: getMockedRefinement(type, slideTitle, currentText),
      fallback: true,
      error: error.message
    });
  }
});

// AI Image Prompt / Description Recommendation
app.post("/api/gemini/suggest-image", async (req, res) => {
  const { slideTitle, slideContent } = req.body;

  if (!isGeminiAvailable()) {
    return res.json({
      searchTerm: getMockedImageQuery(slideTitle),
      description: "Gráfico executivo limpo mostrando tendências de crescimento e análise de mercado de forma minimalista.",
      fallback: true
    });
  }

  try {
    const prompt = `Analise este título e conteúdo de slide de apresentação:
Título: "${slideTitle}"
Conteúdo: "${slideContent}"

Recomende uma imagem conceitual que melhor ilustra essa ideia para uma audiência profissional.
Retorne um termo de pesquisa em inglês de 2 a 3 palavras para buscar no banco de imagens corporativas (ex: "business growth chart", "factory automation", "team collaboration") e uma breve descrição da foto recomendada.
Retorne no formato JSON:
{
  "searchTerm": "business team charts",
  "description": "Foto profissional com iluminação clara focando em gráficos de melhorias de processo"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            searchTerm: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["searchTerm", "description"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({
      searchTerm: parsed.searchTerm || "business development",
      description: parsed.description || "Foto executiva conceitual",
      fallback: false
    });
  } catch (error: any) {
    res.json({
      searchTerm: getMockedImageQuery(slideTitle),
      description: "Imagem representativa recomendada pela IA",
      fallback: true
    });
  }
});


// Mock utilities for fallback when GEMINI_API_KEY is not configured
function getMockedTopics(type: string, title: string, context?: string): string[] {
  switch (type) {
    case "title":
      return [
        "Apresentação de objetivos de entrega estratégicos",
        "Alinhamento de expectativas corporativas corporativas",
        "Introdução dos responsáveis pelas metas de processo"
      ];
    case "results":
      return [
        "Faturamento líquido superou a meta estipulada em 8.4%",
        "Redução no custo operacional devido ao novo regime de insumos",
        "EBITDA ajustado demonstra margem operacional consolidada"
      ];
    case "indicators":
      return [
        "OTIF alcançou 95.4% no trimestre",
        "Retrabalho produtivo reduzido a taxas de padrão internacional",
        "Feedback de clientes aponta satisfação de 92%"
      ];
    case "improvements":
      return [
        "Implementação do setup rápido em todas as máquinas gargalo",
        "Padronização das instruções visuais de trabalho para equipe",
        "Sensoriamento IoT para manutenção preventiva"
      ];
    case "comparison":
      return [
        "Tempo de ociosidade operacional despencou em 45%",
        "Desperdício de matéria-prima minimizado drasticamente",
        "Retorno sobre o investimento (ROI) da melhoria em 3 meses"
      ];
    default:
      return [
        "Consolidação de diretrizes e metas de curto prazo",
        "Cronograma detalhado de execução para as próximas equipes",
        "Agradecimento geral e canais de contato"
      ];
  }
}

function getMockedRefinement(type: string, title: string, text: string): string {
  if (!text) return "Aprimore os canais de eficiência otimizando processos-chave com foco em produtividade total.";
  return `${text.trim()} - Alinhado aos objetivos estratégicos corporativos, implementamos controles dinâmicos de mitigação de riscos e otimização total de custos operacionais.`;
}

function getMockedImageQuery(title: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes("energia") || t.includes("sustentável")) return "green energy solar panel";
  if (t.includes("financeiro") || t.includes("resultado") || t.includes("métrica")) return "business financial chart";
  if (t.includes("logística") || t.includes("entrega") || t.includes("setup")) return "warehouse logistics robot";
  if (t.includes("melhoria") || t.includes("plano") || t.includes("projeto")) return "lean manufacturing continuous improvement";
  return "minimal business workspace";
}

// Start Server Setup (Vite integration for dev / build static serving for prod)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SlideAI Server] Rodando em http://localhost:${PORT}`);
  });
}

startServer();
