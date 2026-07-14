import { Presentation } from '../types';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export const exportToGoogleSheets = async (
  presentation: Presentation,
  accessToken: string
): Promise<ExportResult> => {
  if (!accessToken) {
    throw new Error('Usuário não autenticado no Google.');
  }

  // 1. Determine which tabs to create based on presentation contents
  const hasMetrics = presentation.slides.some((s) => s.metrics && s.metrics.length > 0);
  const hasSteps = presentation.slides.some((s) => s.steps && s.steps.length > 0);
  const hasComparisons = presentation.slides.some((s) => s.comparisons && s.comparisons.length > 0);

  const sheetsToCreate = [
    { properties: { title: 'Visão Geral' } }
  ];

  if (hasMetrics) {
    sheetsToCreate.push({ properties: { title: 'Métricas e KPIs' } });
  }
  if (hasSteps) {
    sheetsToCreate.push({ properties: { title: 'Plano de Ação' } });
  }
  if (hasComparisons) {
    sheetsToCreate.push({ properties: { title: 'Comparativos Antes vs Depois' } });
  }

  // 2. Create the Spreadsheet
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `SlideAI - ${presentation.title}`,
      },
      sheets: sheetsToCreate,
    }),
  });

  if (!createResponse.ok) {
    const errorData = await createResponse.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || 'Falha ao criar planilha no Google Planilhas.'
    );
  }

  const spreadsheet = await createResponse.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl;

  // 3. Prepare data payloads
  const batchData: any[] = [];

  // --- TAB 1: Visão Geral ---
  const overviewValues: any[][] = [
    ['DETALHES DA APRESENTAÇÃO', ''],
    ['Título:', presentation.title],
    ['Categoria/Negócio:', presentation.category || 'Geral'],
    ['Exportado em:', new Date().toLocaleString('pt-BR')],
    [],
    ['ESTRUTURA DOS SLIDES', '', '', '', ''],
    ['Ordem', 'Título do Slide', 'Subtítulo', 'Tipo', 'Conteúdo Principal']
  ];

  presentation.slides.forEach((slide, idx) => {
    overviewValues.push([
      idx + 1,
      slide.title || 'Sem Título',
      slide.subtitle || '',
      slide.type.toUpperCase(),
      slide.content || ''
    ]);
  });

  batchData.push({
    range: "'Visão Geral'!A1",
    values: overviewValues,
  });

  // --- TAB 2: Métricas e KPIs ---
  if (hasMetrics) {
    const metricsValues: any[][] = [
      ['RELATÓRIO DE MÉTRICAS E INDICADORES (KPIs)', '', '', '', ''],
      [],
      ['Slide Relacionado', 'Indicador / KPI', 'Valor Atual', 'Variação / Comparativo', 'Tendência']
    ];

    presentation.slides.forEach((slide) => {
      if (slide.metrics && slide.metrics.length > 0) {
        slide.metrics.forEach((m) => {
          let trendText = 'Estável';
          if (m.trend === 'up') trendText = 'Crescimento / Positivo';
          if (m.trend === 'down') trendText = 'Declínio / Alerta';

          metricsValues.push([
            slide.title || 'Slide sem título',
            m.label,
            m.value,
            m.change,
            trendText
          ]);
        });
      }
    });

    batchData.push({
      range: "'Métricas e KPIs'!A1",
      values: metricsValues,
    });
  }

  // --- TAB 3: Plano de Ação ---
  if (hasSteps) {
    const stepsValues: any[][] = [
      ['CRONOGRAMA E PLANO DE AÇÃO', '', '', ''],
      [],
      ['Slide Relacionado', 'Iniciativa / Projeto', 'Descrição Detalhada', 'Status Atual']
    ];

    presentation.slides.forEach((slide) => {
      if (slide.steps && slide.steps.length > 0) {
        slide.steps.forEach((s) => {
          let statusText = 'Pendente';
          if (s.status === 'completed') statusText = 'Concluído';
          if (s.status === 'in_progress') statusText = 'Em Andamento';

          stepsValues.push([
            slide.title || 'Slide sem título',
            s.title,
            s.description,
            statusText
          ]);
        });
      }
    });

    batchData.push({
      range: "'Plano de Ação'!A1",
      values: stepsValues,
    });
  }

  // --- TAB 4: Comparativos Antes vs Depois ---
  if (hasComparisons) {
    const comparisonsValues: any[][] = [
      ['COMPARATIVOS DE MELHORIA CONTÍNUA (ANTES vs DEPOIS)', '', ''],
      [],
      ['Slide Relacionado', 'Cenário com Gargalo (Antes)', 'Cenário pós-Melhoria (Depois)']
    ];

    presentation.slides.forEach((slide) => {
      if (slide.comparisons && slide.comparisons.length > 0) {
        slide.comparisons.forEach((c) => {
          comparisonsValues.push([
            slide.title || 'Slide sem título',
            c.before,
            c.after
          ]);
        });
      }
    });

    batchData.push({
      range: "'Comparativos Antes vs Depois'!A1",
      values: comparisonsValues,
    });
  }

  // 4. Send Values Batch Update
  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      }),
    }
  );

  if (!updateResponse.ok) {
    const errorData = await updateResponse.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || 'Falha ao preencher dados na planilha.'
    );
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
  };
};
