import { GoogleGenAI, Type } from "@google/genai";
import { Income, Expense, Card } from "../data/initialData";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ExtractedActuals {
  incomeActuals: { id: string; amount: number }[];
  expenseActuals: { id: string; amount: number }[];
  cardPaymentActuals: { card: string; amount: number }[];
  nextMonthExpenseActuals?: { id: string; amount: number }[];
  nextMonthCardPaymentActuals?: { card: string; amount: number }[];
}

export const extractActualsFromPDF = async (
  fileBase64: string,
  mimeType: string,
  incomes: Income[],
  expenses: Expense[],
  cards: Card[]
): Promise<ExtractedActuals> => {
  const prompt = `
Eres un asistente financiero experto. He subido un extracto bancario o de tarjeta de crédito en formato PDF.
Por favor, analiza las transacciones y extrae los totales reales ("Real") para el mes en cuestión, mapeándolos a mis categorías de ingresos, gastos y pagos de tarjetas de crédito.

Aquí están mis ingresos configurados:
${JSON.stringify(incomes.map(i => ({ id: i.id, name: i.name, account: i.account, amount: i.amount })), null, 2)}

Aquí están mis gastos configurados:
${JSON.stringify(expenses.map(e => ({ id: e.id, name: e.name, account: e.account, amount: e.amount })), null, 2)}

Aquí están mis tarjetas de crédito configuradas:
${JSON.stringify(cards, null, 2)}

Instrucciones:
1. Identifica los ingresos en el PDF y suma los montos que correspondan a cada ingreso configurado. Devuelve el 'id' del ingreso y el monto total.
2. Identifica los gastos en el PDF y suma los montos que correspondan a cada gasto configurado. Devuelve el 'id' del gasto y el monto total.
3. Si el PDF es un extracto de tarjeta de crédito, identifica el "Total a pagar" o "Saldo dispuesto" del mes, o suma las compras, y asígnalo a la tarjeta correspondiente. Devuelve el nombre exacto de la tarjeta y el monto.
4. Si el PDF es un extracto bancario y contiene un pago a una de las tarjetas de crédito, asígnalo a la tarjeta correspondiente.
5. Solo incluye los elementos que hayas encontrado en el documento con un monto mayor a 0.
6. Los montos deben ser números positivos.
7. REGLA MUY IMPORTANTE PARA FIN DE MES: 
   - Las transferencias de "Diezmo" desde el Banco Santander (que normalmente se hacen el último día del mes).
   - El pago de tarjetas "MasterCard" (que normalmente se hace después del pago de la nómina).
   Si encuentras estos movimientos en el extracto, NO los asignes al mes actual. Debes asignarlos al MES SIGUIENTE utilizando las propiedades 'nextMonthExpenseActuals' (para el diezmo u otros gastos) y 'nextMonthCardPaymentActuals' (para el pago de la tarjeta).
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: fileBase64,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          incomeActuals: {
            type: Type.ARRAY,
            description: "Ingresos encontrados en el documento",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "El ID del ingreso correspondiente" },
                amount: { type: Type.NUMBER, description: "El monto total del ingreso" },
              },
              required: ["id", "amount"],
            },
          },
          expenseActuals: {
            type: Type.ARRAY,
            description: "Gastos encontrados en el documento",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "El ID del gasto correspondiente" },
                amount: { type: Type.NUMBER, description: "El monto total del gasto" },
              },
              required: ["id", "amount"],
            },
          },
          cardPaymentActuals: {
            type: Type.ARRAY,
            description: "Pagos de tarjeta de crédito encontrados en el documento",
            items: {
              type: Type.OBJECT,
              properties: {
                card: { type: Type.STRING, description: "El nombre exacto de la tarjeta" },
                amount: { type: Type.NUMBER, description: "El monto total del pago de la tarjeta" },
              },
              required: ["card", "amount"],
            },
          },
          nextMonthExpenseActuals: {
            type: Type.ARRAY,
            description: "Gastos que pertenecen al mes siguiente (ej. Diezmo a fin de mes)",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                amount: { type: Type.NUMBER },
              },
              required: ["id", "amount"],
            },
          },
          nextMonthCardPaymentActuals: {
            type: Type.ARRAY,
            description: "Pagos de tarjeta que pertenecen al mes siguiente (ej. MasterCard después de nómina)",
            items: {
              type: Type.OBJECT,
              properties: {
                card: { type: Type.STRING },
                amount: { type: Type.NUMBER },
              },
              required: ["card", "amount"],
            },
          },
        },
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as ExtractedActuals;
};
