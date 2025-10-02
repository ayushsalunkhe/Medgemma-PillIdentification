
import type { FdaResult } from '../types';

const FDA_API_BASE_URL = 'https://api.fda.gov/drug/label.json';

/**
 * Fetches drug information from the openFDA API.
 * The API is fuzzy, so we try searching by brand name and generic name.
 * @param medicineName The name of the medicine to search for.
 * @returns A promise that resolves to the API response or null if not found.
 */
export const fetchFdaData = async (medicineName: string): Promise<FdaResult | null> => {
  const cleanedName = medicineName.trim();
  
  // The openFDA search is quite specific, so we construct a query that is more likely to hit.
  // Searching for the brand name is usually the most reliable.
  const searchQuery = `openfda.brand_name:"${cleanedName}" OR openfda.generic_name:"${cleanedName}"`;

  const url = `${FDA_API_BASE_URL}?search=${encodeURIComponent(searchQuery)}&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Don't throw for 404, as it just means not found.
      if (response.status === 404) {
        console.log(`Medicine "${cleanedName}" not found in FDA database.`);
        return null;
      }
      throw new Error(`FDA API request failed with status: ${response.status}`);
    }
    const data: FdaResult = await response.json();
    if (data.results && data.results.length > 0) {
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching data from FDA API:", error);
    // We return null to allow fallback logic to trigger
    return null; 
  }
};
