'use server';
/**
 * @fileOverview An AI agent that scans receipts and extracts structured expense data.
 *
 * - scanReceipt - A function that takes a receipt image and returns structured expense data.
 * - ScanReceiptInput - The input type for the scanReceipt function.
 * - ScannedExpenseData - The return type for the scanReceipt function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ScanReceiptInputSchema = z.object({
  receiptImage: z.string().describe(
    "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ScanReceiptInput = z.infer<typeof ScanReceiptInputSchema>;

const ScannedExpenseDataSchema = z.object({
  merchantName: z.string().describe('The name of the merchant, store, or vendor from the receipt.'),
  transactionDate: z.string().describe('The date of the transaction from the receipt, formatted as YYYY-MM-DD. If the year is not present, assume the current year.'),
  totalAmount: z.number().describe('The final total amount of the expense, including taxes and tips.'),
  description: z.string().describe('A brief, auto-generated description of the expense (e.g., "Lunch at The Cafe").'),
  expenseType: z.enum(["Meals", "Travel", "Software", "Supplies", "Other"]).describe('A suggested category for the expense based on the merchant name.'),
});
export type ScannedExpenseData = z.infer<typeof ScannedExpenseDataSchema>;

export async function scanReceipt(input: ScanReceiptInput): Promise<ScannedExpenseData> {
  return scanReceiptFlow(input);
}

const scanReceiptPrompt = ai.definePrompt({
  name: 'scanReceiptPrompt',
  input: {schema: ScanReceiptInputSchema},
  output: {schema: ScannedExpenseDataSchema},
  prompt: `You are an expert receipt processing agent.
  Your task is to analyze the provided receipt image and extract the key information needed for an expense report.

  Analyze the image and extract the following details:
  - Merchant Name: The name of the business where the transaction occurred.
  - Transaction Date: The date of the transaction. Format it as YYYY-MM-DD.
  - Total Amount: The final total amount paid. This is usually labeled as 'Total', 'Grand Total', or 'Amount Due'. It must be a number.
  - Description: Create a short summary, like "Expense at [Merchant Name]".
  - Expense Type: Categorize the expense. Use your best judgment based on the merchant. For example, a restaurant is "Meals", an airline is "Travel", a hardware store is "Supplies".

  Receipt Image:
  {{media url=receiptImage}}

  Return a valid JSON object matching the output schema.
  `,
});

const scanReceiptFlow = ai.defineFlow(
  {
    name: 'scanReceiptFlow',
    inputSchema: ScanReceiptInputSchema,
    outputSchema: ScannedExpenseDataSchema,
  },
  async input => {
    const {output} = await ai.generate({
      model: googleAI('gemini-1.5-flash-latest'),
      prompt: scanReceiptPrompt.template(input),
      output: {
        schema: ScannedExpenseDataSchema,
      }
    });
    return output!;
  }
);
