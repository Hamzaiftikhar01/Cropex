import diseaseIndexData from '../../data/diseaseIndex.json';
import productsData from '../../data/products.json';

/**
 * Helper to normalize a string for fuzzy matching (lowercase, strip special chars)
 */
function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Finds a disease by its unique disease ID.
 * Returns complete disease details and resolves linked product IDs.
 * If no products are linked, sets a descriptive message instead of failing.
 *
 * @param {string} diseaseId - Unique identifier (e.g. 'tomato_early_blight')
 * @returns {Object|null} Complete disease object or null if not found
 */
export function getDiseaseById(diseaseId) {
  if (!diseaseId) return null;

  const normId = diseaseId.toLowerCase().trim();
  const match = diseaseIndexData.diseases.find((item) => item.id.toLowerCase() === normId);

  if (!match) {
    return null;
  }

  // Resolve recommended products from products.json
  const resolvedProducts = (match.recommendedProductIds || [])
    .map((productId) => {
      const prod = productsData.products.find((p) => p.id === productId);
      if (prod) {
        // Enforce backward compatibility by guaranteeing companyName exists
        return {
          ...prod,
          companyName: prod.companyName || prod.company
        };
      }
      return null;
    })
    .filter(Boolean);

  const hasProducts = resolvedProducts.length > 0;

  return {
    id: match.id,
    cropName: match.cropName,
    disease: match.disease,
    healthStatus: 'Diseased',
    description: match.description,
    symptoms: match.symptoms || [],
    causes: match.causes || [],
    prevention: match.prevention || [],
    bestPractices: match.bestPractices || [],
    recommendedProducts: resolvedProducts,
    recommendedProductsMessage: hasProducts
      ? ''
      : 'No recommended products are currently indexed for this disease.'
  };
}

/**
 * Searches the local offline knowledge base for a specific crop and disease name.
 * Maps matching diseases to their product recommendations.
 *
 * @param {string} cropName - Crop name returned by AI
 * @param {string} diseaseName - Disease name returned by AI
 * @returns {Object|null} Clean disease record with resolved product lists, or null if not found
 */
export function searchKnowledgeBase(cropName, diseaseName) {
  if (!cropName || !diseaseName) {
    return null;
  }

  const normCrop = normalize(cropName);
  const normDisease = normalize(diseaseName);

  // If healthy or no disease, handle directly
  if (normDisease === 'none' || normDisease === 'healthy') {
    return {
      cropName,
      disease: 'None (Healthy)',
      healthStatus: 'Healthy',
      description: `The ${cropName} plant appears healthy with no visible signs of infection or pests.`,
      symptoms: ['No active symptoms detected.'],
      causes: [],
      prevention: [
        'Maintain regular watering and fertilization schedules.',
        'Perform weekly leaf inspections for early detection.',
        'Sanitize garden shears between crop maintenance tasks.'
      ],
      bestPractices: [
        'Practice proper weed management to reduce host plants.',
        'Rotate crop placements in the next planting cycle.'
      ],
      recommendedProducts: [],
      recommendedProductsMessage: 'No recommended products are currently indexed for this disease.'
    };
  }

  // Find matching disease record in our database
  const match = diseaseIndexData.diseases.find((item) => {
    const itemCrop = normalize(item.cropName);
    const itemDisease = normalize(item.disease);

    // Exact or substring match for safety
    const cropMatches = normCrop.includes(itemCrop) || itemCrop.includes(normCrop);
    const diseaseMatches = normDisease.includes(itemDisease) || itemDisease.includes(normDisease);

    return cropMatches && diseaseMatches;
  });

  if (!match) {
    return null;
  }

  // Reuse the ID-based resolver to guarantee identical structure
  return getDiseaseById(match.id);
}
