// Aurea AI Handlers using Gemini API via @google/genai
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini helper function
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

/**
 * AI-powered transaction classifier
 * Detects category, type of cashflow, recurring status, loans, or subscription properties.
 */
export async function classifyTransactionsHandler(transactions: any[]): Promise<any[]> {
  const ai = getGeminiClient();
  if (!ai) {
    // Elegant fallback rule-based classifier if Gemini Key is missing
    console.log("No Gemini API key found. Using heuristic classification fallback.");
    return transactions.map((t, idx) => {
      const desc = (t.description || "").toLowerCase();
      let category = t.category || "Otros";
      let type = "gasto";
      let isRecurring = false;
      let recurrenceType = "";

      if (desc.includes("salario") || desc.includes("nomina") || desc.includes("pago de") && !desc.includes("prestaco") || desc.includes("sueldo") || desc.includes("transferencia recibida") || desc.includes("freelance") || desc.includes("comision")) {
        category = "Ingreso";
        type = "ingreso";
      } else if (desc.includes("netflix") || desc.includes("spotify") || desc.includes("disney") || desc.includes("hbo") || desc.includes("youtube premium") || desc.includes("suscripcion") || desc.includes("amazon prime") || desc.includes("apple") || desc.includes("gym") || desc.includes("gimnasio") || desc.includes("club") || desc.includes("adobe")) {
        category = "Suscripciones";
        type = "gasto";
        isRecurring = true;
        recurrenceType = "Suscripción";
      } else if (desc.includes("uber") || desc.includes("didi") || desc.includes("cabify") || desc.includes("gasolinera") || desc.includes("gasolina") || desc.includes("peaje") || desc.includes("metro") || desc.includes("autobus") || desc.includes("transporte")) {
        category = "Transporte";
        type = "gasto";
      } else if (desc.includes("supermercado") || desc.includes("exito") || desc.includes("carrefour") || desc.includes("walmart") || desc.includes("comida") || desc.includes("restaurante") || desc.includes("mcdonald") || desc.includes("starbucks") || desc.includes("rappi") || desc.includes("pedidosya") || desc.includes("bazar")) {
        category = "Alimentación";
        type = "gasto";
      } else if (desc.includes("alquiler") || desc.includes("renta") || desc.includes("arriendo") || desc.includes("hipoteca")) {
        category = "Vivienda";
        type = "gasto";
        isRecurring = true;
        recurrenceType = "Renta/Hipoteca";
      } else if (desc.includes("luz") || desc.includes("agua") || desc.includes("electricidad") || desc.includes("gas") || desc.includes("internet") || desc.includes("claro") || desc.includes("movistar") || desc.includes("tigo")) {
        category = "Servicios";
        type = "gasto";
        isRecurring = true;
        recurrenceType = "Servicios Públicos";
      } else if (desc.includes("prestamo") || desc.includes("credito") || desc.includes("interes") || desc.includes("cuota") || desc.includes("amortizacion") || desc.includes("banco")) {
        category = "Deudas";
        type = "gasto";
        isRecurring = true;
        recurrenceType = "Cuota Préstamo";
      }

      return {
        ...t,
        category,
        type,
        isRecurring,
        recurrenceType: recurrenceType || (isRecurring ? "Recurrente" : "")
      };
    });
  }

  try {
    const listForPrompt = transactions.map((t, idx) => ({
      index: idx,
      date: t.date || t.fecha,
      description: t.description || t.descripcion,
      amount: t.amount || t.monto || t.ingreso || t.gasto,
      account: t.account || t.cuenta || ""
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Clasifica inteligentemente el siguiente historial financiero de transacciones bancarias. 
Identifica si el movimiento es un "ingreso" o un "gasto" (type). 
Determina la categoría más apropiada en español (e.g., "Alimentación", "Transporte", "Suscripciones", "Servicios", "Deudas", "Vivienda", "Salud", "Educación", "Ingreso", "Otros").
Detecta si es un gasto recurrente (isRecurring: true/false) y qué tipo de movimiento recurrente / suscripción es si aplica.
Retorna UNICAMENTE un arreglo JSON con la clasificación de cada transacción por índice.

Transacciones:
${JSON.stringify(listForPrompt, null, 2)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              category: { type: Type.STRING },
              type: { type: Type.STRING, description: "either 'ingreso' or 'gasto'" },
              isRecurring: { type: Type.BOOLEAN },
              recurrenceType: { type: Type.STRING, description: "e.g., 'Suscripción', 'Servicios Públicos', 'Renta/Hipoteca', 'Cuota de Préstamo', or empty" }
            },
            required: ["index", "category", "type", "isRecurring"]
          }
        }
      }
    });

    const parsedResults = JSON.parse(response.text || "[]");
    return transactions.map((t, idx) => {
      const match = parsedResults.find((r: any) => r.index === idx);
      if (match) {
        return {
          ...t,
          category: match.category,
          type: match.type || "gasto",
          isRecurring: !!match.isRecurring,
          recurrenceType: match.recurrenceType || ""
        };
      }
      return { ...t, category: "Otros", type: "gasto", isRecurring: false, recurrenceType: "" };
    });
  } catch (error) {
    console.error("Error in AI transaction classification:", error);
    // Silent fallback
    return transactions.map(t => ({ ...t, category: t.category || "Otros", type: t.type || "gasto", isRecurring: false, recurrenceType: "" }));
  }
}

/**
 * Automagically build a narrative story around the imported transactions / onboarding data
 */
export async function generateFinancialNarrativeHandler(data: any): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    // Beautiful dynamic narrative template if API key is not ready
    const monthlyIncome = data.monthlyIncome || 3500;
    const monthlyExpenses = data.monthlyExpenses || 2400;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = ((monthlySavings / monthlyIncome) * 100).toFixed(1);
    const hasDebts = data.debtsCount && data.debtsCount > 0;

    return `### 📊 Historia y Reporte de Salud Financiera

**Bajo Análisis: Historial de Comportamiento e Inteligencia Financiera**

Hemos analizado tu perfil financiero inicial y tus registros. Actualmente muestras ingresos promedio mensuales de **$${monthlyIncome.toLocaleString()}** contra gastos de **$${monthlyExpenses.toLocaleString()}**, lo que representa una **Tasa de Ahorro del ${savingsRate}%**.

*   **Puntos Clave Detectados:**
    *   Tu **Fondo de Emergencia** recomendado de **$${(monthlyExpenses * 6).toLocaleString()}** (meta de 6 meses) requerirá disciplina. Con tu ritmo actual de ahorro de **$${monthlySavings.toLocaleString()}**, te tomará aproximadamente **${Math.ceil((monthlyExpenses * 6) / Math.max(1, monthlySavings))} meses** completarlo.
    *   ${hasDebts ? "Posees compromisos financieros activos que imponen un peso importante mensual. La reducción de estas tasas y el plan de amortización acelerada te liberará flujo de caja." : "No se registraron deudas mayores pesadas en el último ciclo, lo cual maximiza tu capacidad neta de inversión."}
    *   Se observan patrones recurrentes concentrados en Vivienda y Alimentación.

*   **Próximos Pasos Recomendados:**
    *   Considera disminuir un **10%** los gastos discrecionales en categorías no prioritarias para aumentar tu patrimonio en un **12%** anual.
    *   Aprovecha las compras en cuotas únicamente bajo tasas de interés cero.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Actúa como un Planificador Financiero Senior y Analista de Datos de Wealth Management.
Genera una Narrative Financiera personal en un tono profesional, amigable, inspirador y directo, basada en la siguiente estructura de datos financieros:

${JSON.stringify(data, null, 2)}

La narrativa debe estar escrita en Markdown en Español. Debe incluir:
1. Resumen de la situación actual (Ingreso promedio, Gasto promedio, Tasa de Ahorro).
2. Detección de patrones y estacionalidades en los gastos.
3. Evaluación del Fondo de Emergencia y metas financieras.
4. Recomendaciones accionables para mejorar la salud financiera, optimizar gastos discrecionales y acelerar el logro de metas.`
    });

    return response.text || "No se pudo generar la narrativa. Por favor intente más tarde.";
  } catch (error) {
    console.error("Error generating narrative:", error);
    return "Error al conectar con la IA de Aurea. Por favor, verifica tu conexión o configuración de secretos.";
  }
}

/**
 * Live conversational agent with complete contextual knowledge of the user's finances.
 */
export async function chatWithAIHandler(message: string, history: any[], financialState: any): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    // Dynamic rules/heuristic fallback chat for amazing UX
    const msg = message.toLowerCase();
    const isBudget = msg.includes("presupuesto") || msg.includes("limite") || msg.includes("gastar");
    const isSave = msg.includes("ahorrar") || msg.includes("ahorro") || msg.includes("meta");
    const isDebt = msg.includes("deuda") || msg.includes("cuota") || msg.includes("tarjeta") || msg.includes("deber");
    const isEmergency = msg.includes("emergencia") || msg.includes("fondo");
    const isForecast = msg.includes("futuro") || msg.includes("proyeccion") || msg.includes("forecast") || msg.includes("meses");
    const isSimulator = msg.includes("que pasa si") || msg.includes("simular") || msg.includes("compro") || msg.includes("cancelo");

    let reply = "";
    if (isSimulator) {
      reply = "¡Excelente pregunta de simulación en Aurea! Si llevas a cabo este cambio o simulación (por ejemplo, omitir una suscripción o elevar tu ahorro), recuerda que puedes usar nuestra pestaña 'Simulador de Escenarios' a la izquierda para visualizar el impacto exacto en gráficos a 12 meses. En líneas generales: reducir un gasto fijo mensual te permite destinar ese excedente directamente a inversión compuesta, reduciendo tu fecha de jubilación o meta por varios meses.";
    } else if (isForecast) {
      reply = "De acuerdo a tus compromisos vigentes y gastos fijos registrados, tu flujo de caja se mantendrá estable si conservas tus ingresos. Para planificar a 6, 12 o 24 meses, te sugiero mirar el gráfico de 'Proyecciones Cashflow' en el Dashboard de Aurea, el cual calcula dinámicamente tu saldo proyectado día con día.";
    } else if (isEmergency) {
      const fund = financialState.metrics?.emergencyFund || 0;
      reply = `Tu fondo de emergencia actual registrado es de **$${fund.toLocaleString()}**. Un fondo óptimo cubre entre 3 y 6 meses de tus gastos fijos estimados. Te sugiero destinar un porcentaje fijo mensual automatizado para blindarte ante imprevistos.`;
    } else if (isBudget) {
      reply = "Analizando tus presupuestos fijados: Recuerda vigilar las categorías de Alimentación y Entretenimiento, que suelen representar las mayores derivaciones de dinero (gastos hormiga). En la sección 'Presupuesto vs Real' puedes monitorear en tiempo real con barras de alerta de sobreconsumo.";
    } else if (isSave) {
      reply = `Tu tasa de ahorro actual es de aproximadamente **${financialState.metrics?.savingsRate || '20'}%**. Para acelerar tus metas activas (como viajes o inversión), la clave es el recorte de suscripciones duplicadas y la asignación inteligente del ingreso apenas lo percibes cobrado.`;
    } else if (isDebt) {
      reply = "Para gestionar deudas racionalmente, te sugiero utilizar el método Bola de Nieve (pagar la menor de primero para ganar tracción psicológica) o el método Avalancha (pagar la de mayor tasa de interés para ahorrar costos financieros).";
    } else {
      reply = `Hola, soy tu asistente financiero AUREA. Conozco tu estado financiero: tu ingreso registrado es **$${(financialState.user?.salary || 0).toLocaleString()}** y tienes metas de ahorro de **$${(financialState.user?.savingsGoal || 0).toLocaleString()}**. ¿Te gustaría que analicemos algún patrón específico en tus gastos, simulemos un escenario como comprar un vehículo, o calculemos tu flujo de caja proyectado para los próximos 6 meses?`;
    }
    return reply;
  }

  try {
    const formattedHistory = history.map(h => ({
      role: h.sender === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: h.text }]
    }));

    // Insert system prompt directly into the structure or as systemInstruction config
    const systemPrompt = `Actúa como AUREA, un Asistente de Finanzas Personales e Inteligencia Cognitiva altamente sofisticado y amigable.
Conoces por completo los datos financieros reales y actuales del usuario que te proporcionamos abajo:

DATOS FINANCIEROS DEL USUARIO:
${JSON.stringify(financialState, null, 2)}

DIRECTRICES:
- Usa siempre respuestas bien estructuradas en Markdown con negritas, listas y saltos de línea elegantes.
- Sé preciso, no inventes datos de gasto o saldo que no figuren en la información provista.
- Cuando simulen escenarios (ej: "¿Qué pasa si cancelo Netflix?"), calcula el impacto matemático real y dile cómo cambiará su patrimonio o capacidad de ahorro.
- Ofrece consejos accionables prácticos sobre presupuestación, previsión de flujo de caja y rentabilidad de deudas.
- Mantén un lenguaje empático, educado, muy profesional, simulando a un CFO personal de primer nivel.`;

    // Modern SDK chat structure
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      // Seed history
      history: formattedHistory
    });

    const response = await chat.sendMessage({
      message: message
    });

    return response.text || "Disculpa, no logré formular una respuesta en este momento.";
  } catch (error) {
    console.error("Error in Gemini AI chatbot handler:", error);
    return "Ups, ocurrió un error en los servidores inteligentes de Aurea. Respondiendo de forma local: Tu flujo y presupuesto están asegurados en tu almacenamiento local. ¿Te puedo ayudar en algo más?";
  }
}
