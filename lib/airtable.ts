console.log("Loaded ENV:", {
  AIRTABLE_PAT: process.env.AIRTABLE_PAT,
  AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_NAME: process.env.AIRTABLE_TABLE_NAME,
});
interface AirtableRecord {
  id: string;
  fields: {
    Title: string;
    Description: string;
    Tags: string[];
    Image: string;
    rating1: number;  // Longevity
    rating2: number;  // Projection
    rating3: number;  // Versatility
    rating4: number;  // Complexity
    rating5: number;  // Uniqueness
    rating6: number;  // Overall
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
}

interface Fragrance {
  title: string;
  description: string;
  tags: string[];
  image: string;
  matchCount: number;
  avgScore: number;
  fields: any; // allow any shape for Airtable fields
  score: number;
  relevance: number;
  [key: string]: any; // allow extra fields like score
}

export async function getMatchingFragrances(tags: string[]): Promise<Fragrance[]> {
  // Normalize quiz tags
  const quizTags = tags.map(t => t.toLowerCase().trim());

  // Extract gender from quiz tags
  const genderTags = ['for-men', 'for-women', 'for-unisex'];
  const selectedGender = quizTags.find(t => genderTags.includes(t));

  // Avoidance mapping
  const avoidMap: Record<string, string[]> = {
    'avoid-sweet': ['sweet-gourmand'],
    'avoid-woody': ['woody-earthy'],
    'avoid-floral': ['floral-scent'],
    'avoid-fresh': ['fresh-citrus', 'aquatic-clean'],
    'avoid-musk': ['musky'],
  };

  // Finalized weights (max 75)
  const weights: Record<string, { tags: string[]; weight: number }> = {
    usage:        { tags: ['daily-wear', 'office-use', 'evening-wear', 'special-event', 'sporty-fragrance'], weight: 10 },
    profile:      { tags: ['fresh-citrus', 'woody-earthy', 'spicy-warm', 'sweet-gourmand', 'floral-scent', 'aquatic-clean'], weight: 20 },
    season:       { tags: ['warm-weather', 'cold-weather', 'all-season'], weight: 10 },
    intensity:    { tags: ['light-intensity', 'moderate-intensity', 'strong-intensity'], weight: 10 },
    longevity:    { tags: ['short-longevity', 'medium-longevity', 'long-longevity'], weight: 10 },
    budget:       { tags: ['budget-low', 'budget-mid', 'budget-high', 'budget-luxury'], weight: 5 },
    brand:        { tags: ['designer-brand', 'niche-brand', 'any-brand'], weight: 5 },
    age:          { tags: ['age-under-25', 'age-26-35', 'age-36-45', 'age-46-plus'], weight: 5 },
  };
  const maxScore = 75;

  // Validate environment variables
  if (!process.env.AIRTABLE_PAT) throw new Error('AIRTABLE_PAT is not configured');
  if (!process.env.AIRTABLE_BASE_ID) throw new Error('AIRTABLE_BASE_ID is not configured');
  if (!process.env.AIRTABLE_TABLE_NAME) throw new Error('AIRTABLE_TABLE_NAME is not configured');

  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;
  const apiUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`Airtable API error: ${response.statusText}`);
    const data: AirtableResponse = await response.json();

    const results = data.records
      .map(record => {
        const recordTags = Array.isArray(record.fields.Tags)
          ? record.fields.Tags.map(tag => String(tag).toLowerCase().trim())
          : [];

        // 1. Hard gender filter
        if (!selectedGender || !recordTags.includes(selectedGender)) return null;

        // 2. Weighted scoring
        let score = 0;
        Object.values(weights).forEach(({ tags: catTags, weight }) => {
          if (quizTags.some(qt => catTags.includes(qt) && recordTags.includes(qt))) {
            score += weight;
          }
        });

        // 3. Avoidance penalties
        Object.entries(avoidMap).forEach(([avoidTag, forbiddenTags]) => {
          if (quizTags.includes(avoidTag)) {
            forbiddenTags.forEach(forbidden => {
              if (recordTags.includes(forbidden)) {
                score -= 20;
              }
            });
          }
        });

        // Clamp score
        score = Math.max(0, Math.min(maxScore, score));
        const relevance = Math.round((score / maxScore) * 100);

        // Calculate average score from all rating fields
        const ratings = [
          record.fields.rating1, // Longevity
          record.fields.rating2, // Projection
          record.fields.rating3, // Versatility
          record.fields.rating4, // Complexity
          record.fields.rating5, // Uniqueness
          record.fields.rating6  // Overall
        ].map(rating => Number(rating) || 0);
        const validRatings = ratings.filter(rating => !isNaN(rating));
        const avgScore = validRatings.length > 0
          ? Number((validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length).toFixed(1))
          : 0;

        return {
          title: record.fields.Title,
          description: record.fields.Description,
          tags: recordTags,
          image: (() => {
            const images = (record.fields as any).Images;
            if (Array.isArray(images)) return images[0] || record.fields.Image || '/default-bottle.png';
            if (typeof images === 'string') return images || record.fields.Image || '/default-bottle.png';
            return record.fields.Image || '/default-bottle.png';
          })(),
          matchCount: 0, // not used in new logic
          avgScore,
          fields: record.fields,
          score,
          relevance,
        };
      })
      .filter((f): f is Fragrance => f !== null)
      .sort((a: any, b: any) => {
        if (b.relevance !== a.relevance) return b.relevance - a.relevance;
        return b.avgScore - a.avgScore;
      })
      .slice(0, 30);

    return results;
  } catch (error) {
    console.error('Error fetching fragrances:', error);
    throw new Error('Failed to fetch matching fragrances');
  }
} 