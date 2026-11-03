import {
  AICategorizeResult,
  AIEnhanceResult,
  AIDuplicateCandidate,
  AISummarizeResult,
  AIMapsGroundingResult,
  Report,
} from '../types';

const aiApiBaseUrl = (import.meta.env.VITE_AI_API_BASE_URL || '').replace(/\/+$/, '');
const aiApiUrl = (path: string) => `${aiApiBaseUrl}${path}`;

export const aiService = {
  // 1. Intelligent Issue Categorization & Title Suggestion
  async categorizeIssue(description: string): Promise<AICategorizeResult> {
    const res = await fetch(aiApiUrl('/api/ai/categorize'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to categorize issue with AI');
    }

    return res.json();
  },

  // 2. AI Description Enhancement
  async enhanceDescription(description: string, location?: string): Promise<AIEnhanceResult> {
    const res = await fetch(aiApiUrl('/api/ai/enhance'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, location }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to enhance report description');
    }

    return res.json();
  },

  // 3. AI Duplicate Report Assistance
  async checkDuplicates(
    title: string,
    description: string,
    category: string,
    location: string,
    existingReports: Report[]
  ): Promise<AIDuplicateCandidate[]> {
    const simplified = existingReports.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      location: r.location,
      description: r.description.slice(0, 180),
    }));

    const res = await fetch(aiApiUrl('/api/ai/check-duplicates'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        category,
        location,
        existingReports: simplified,
      }),
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.potentialDuplicates || [];
  },

  // 4. Admin Report Summarization
  async summarizeReport(report: Report): Promise<AISummarizeResult> {
    const res = await fetch(aiApiUrl('/api/ai/summarize'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: report.title,
        description: report.description,
        category: report.category,
        location: report.location,
        status: report.status,
        createdAt: report.createdAt,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to summarize report');
    }

    return res.json();
  },

  // 5. Intelligent Report Translation (English <-> Arabic)
  async translateText(text: string, targetLang: 'ar' | 'en'): Promise<string> {
    const res = await fetch(aiApiUrl('/api/ai/translate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!res.ok) {
      return text;
    }

    const data = await res.json().catch(() => ({}));
    return data.translatedText || text;
  },

  // 6. Google Maps Grounding & Real Report Verification
  async getMapsGrounding(params: {
    report?: Report;
    query?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<AIMapsGroundingResult> {
    const res = await fetch(aiApiUrl('/api/ai/maps-grounding'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch Maps Grounding data');
    }

    return res.json();
  },
};
