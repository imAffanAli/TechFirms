import { callClaudeJSON, isAiEnabled, MODELS, INJECTION_GUARD } from './ai.js';

export interface ReviewAssessment {
  sentiment: { score: number; label: 'positive' | 'neutral' | 'negative' };
  spamRisk: { score: number; reasons: string[] }; // 0–100
  aiPowered: boolean;
}

const POS = ['excellent', 'great', 'delivered', 'recommend', 'professional', 'quality', 'smooth', 'reliable', 'impressed', 'exceeded', 'helpful', 'strong', 'seamless', 'responsive'];
const NEG = ['poor', 'delay', 'disappointed', 'bug', 'unresponsive', 'scam', 'fake', 'refund', 'terrible', 'worst', 'avoid', 'missed', 'overpriced'];

/** Deterministic fallback when the AI key is absent. */
function heuristic(text: string): ReviewAssessment {
  const t = text.toLowerCase();
  const pos = POS.filter((w) => t.includes(w)).length;
  const neg = NEG.filter((w) => t.includes(w)).length;
  const score = Math.max(-1, Math.min(1, (pos - neg) / 5));
  const label = score > 0.15 ? 'positive' : score < -0.15 ? 'negative' : 'neutral';

  const reasons: string[] = [];
  let spam = 0;
  if (text.trim().length < 40) { spam += 40; reasons.push('very short'); }
  if (/(.)\1{4,}/.test(text)) { spam += 20; reasons.push('repeated characters'); }
  if (/(https?:\/\/|www\.|@\w)/i.test(text)) { spam += 30; reasons.push('contains links or handles'); }
  if (/\b(guarantee|cheap|click here|promo code|discount|whatsapp)\b/i.test(text)) { spam += 25; reasons.push('promotional language'); }
  if (pos > 4 && text.length < 120) { spam += 15; reasons.push('generic superlatives'); }

  return { sentiment: { score: Math.round(score * 100) / 100, label }, spamRisk: { score: Math.min(100, spam), reasons }, aiPowered: false };
}

/** Feature 2 (sentiment) + Feature 5 (spam/fake detection). Uses Claude when enabled, else heuristic. */
export async function assessReview(text: string): Promise<ReviewAssessment> {
  if (isAiEnabled()) {
    const ai = await callClaudeJSON<{ sentiment_score: number; sentiment_label: string; spam_score: number; spam_reasons: string[] }>(
      `${INJECTION_GUARD}\n\nAnalyze this customer review of a technology company. Return JSON with: sentiment_score (number -1..1), sentiment_label ("positive"|"neutral"|"negative"), spam_score (0..100 likelihood it is fake, incentivized, or spam), spam_reasons (array of short strings).\n\n<input>${text}</input>`,
      { model: MODELS.fast, maxTokens: 300 },
    );
    if (ai) {
      const label = (['positive', 'neutral', 'negative'] as const).includes(ai.sentiment_label as 'positive') ? (ai.sentiment_label as 'positive' | 'neutral' | 'negative') : 'neutral';
      return { sentiment: { score: ai.sentiment_score, label }, spamRisk: { score: ai.spam_score, reasons: ai.spam_reasons ?? [] }, aiPowered: true };
    }
  }
  return heuristic(text);
}
