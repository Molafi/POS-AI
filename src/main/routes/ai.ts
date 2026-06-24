import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getApiKey } from '../services/security';

const router = Router();

// POST /api/ai/analyze-image - Analyze product image with Claude Vision
router.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      res.status(400).json({ success: false, error: 'Image data is required' });
      return;
    }

    // Try secure store first, then fall back to environment variable
    const apiKey = getApiKey('claude_api_key') || process.env.ANTHROPIC_API_KEY || '';

    if (!apiKey) {
      res.status(400).json({ success: false, error: 'Claude API key not configured' });
      return;
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are a product analysis AI for a retail POS system. Analyze the provided product image and extract structured data. Return ONLY valid JSON with no additional text or markdown formatting.

Required JSON structure:
{
  "name": "Product name (be specific and descriptive)",
  "description": "Brief 1-2 sentence product description",
  "category": "One of: Food & Beverage, Electronics, Clothing, Health & Beauty, Home & Garden, Sports & Outdoors, Toys & Games, Books & Stationery, Automotive, Other",
  "suggestedPrice": 0.00,
  "suggestedCost": 0.00,
  "tags": ["tag1", "tag2", "tag3"],
  "unit": "piece/kg/liter/pack/box",
  "barcode": null
}

Price estimation guidelines:
- Estimate realistic retail prices based on the product type and typical market values
- Cost should be approximately 40-60% of the selling price
- Use USD as the default currency`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (mimeType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: systemPrompt,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      res.status(500).json({ success: false, error: 'No text response from AI' });
      return;
    }

    const parsed = JSON.parse(textContent.text);
    res.json({ success: true, data: parsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI analysis failed';
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/ai/summary - Generate AI summary of business data
router.post('/summary', async (req: Request, res: Response) => {
  try {
    const { salesData, period } = req.body;

    // Try secure store first, then fall back to environment variable
    const apiKey = getApiKey('claude_api_key') || process.env.ANTHROPIC_API_KEY || '';

    if (!apiKey) {
      res.status(400).json({ success: false, error: 'Claude API key not configured' });
      return;
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a business analyst for a retail store. Analyze the following ${period || '30-day'} sales data and provide a clear, concise summary in plain English. Include insights about trends, top performers, areas of concern, and actionable recommendations.

Sales Data:
${JSON.stringify(salesData, null, 2)}

Provide a 2-3 paragraph summary that a store manager would find useful. Focus on actionable insights.`,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      res.status(500).json({ success: false, error: 'No text response from AI' });
      return;
    }

    res.json({ success: true, data: { summary: textContent.text } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI summary generation failed';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
