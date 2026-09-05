/**
 * Optional Claude fallback for messages the rule parser can't read, e.g.
 * "paid two hundred for lunch" or "half a K on fuel". Only used when
 * ANTHROPIC_API_KEY is set; otherwise the bot simply asks for a number.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CATEGORIES, categorise, isCategory } from "@/lib/categories";
import { optionalEnv } from "@/lib/env";
import type { ParsedExpense } from "./parse";

const Schema = z.object({
  is_expense: z.boolean().describe("true only if the message reports money the person spent"),
  expenses: z.array(
    z.object({
      amount: z.number().describe("numeric amount, e.g. 'two hundred' -> 200"),
      note: z.string().describe("2-4 word description, e.g. 'Lunch'"),
      category: z.enum(CATEGORIES),
      currency: z.string().nullable().describe("ISO 4217 code only if explicitly stated, else null"),
      days_ago: z.number().int().min(0).max(31),
    }),
  ),
});

const SYSTEM = `You extract expenses from short WhatsApp messages sent to Molit, a money-literacy tracker.
Return every expense mentioned. Spelled-out numbers count ("two hundred" = 200, "half a k" = 500, "1.5 lakh" = 150000).
If the message is not about money the person spent (greetings, questions, jokes), set is_expense=false and return no expenses.
Notes are short and capitalised. Never invent an amount.`;

let client: Anthropic | undefined;

export function llmAvailable() {
  return Boolean(optionalEnv("ANTHROPIC_API_KEY"));
}

export async function parseWithClaude(text: string): Promise<ParsedExpense[] | null> {
  if (!llmAvailable()) return null;
  client ??= new Anthropic();
  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 1024,
      output_config: { effort: "low", format: zodOutputFormat(Schema) },
      system: SYSTEM,
      messages: [{ role: "user", content: text }],
    });
    if (response.stop_reason === "refusal") return null;
    const parsed = response.parsed_output;
    if (!parsed || !parsed.is_expense) return null;
    return parsed.expenses
      .filter((e) => e.amount > 0)
      .map((e) => ({
        amount: Math.round(e.amount * 100) / 100,
        note: e.note.trim(),
        category: isCategory(e.category) ? e.category : categorise(e.note),
        currency: e.currency ?? undefined,
        daysAgo: e.days_ago,
      }));
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude parse failed (${error.status}): ${error.message}`);
    } else {
      console.error("Claude parse failed", error);
    }
    return null;
  }
}
