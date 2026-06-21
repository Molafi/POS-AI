import { Router, Request, Response } from 'express';
import { getApiKey } from '../services/security';

const router = Router();

// GET /api/unsplash/search - Search Unsplash for product images
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      res.status(400).json({ success: false, error: 'Search query is required' });
      return;
    }

    // Try secure store first, then fall back to environment variable
    const accessKey = getApiKey('unsplash_api_key') || process.env.UNSPLASH_ACCESS_KEY || '';

    if (!accessKey) {
      res.status(400).json({ success: false, error: 'Unsplash API key not configured' });
      return;
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query as string)}&per_page=4&orientation=squarish`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      res.status(response.status).json({ success: false, error: 'Unsplash API request failed' });
      return;
    }

    const data = await response.json();
    const images = data.results.map((result: { id: string; urls: { small: string; regular: string; thumb: string }; alt_description: string | null; user: { name: string } }) => ({
      id: result.id,
      url: result.urls.small,
      fullUrl: result.urls.regular,
      thumbUrl: result.urls.thumb,
      alt: result.alt_description || '',
      photographer: result.user.name,
    }));

    res.json({ success: true, data: images });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unsplash search failed';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
