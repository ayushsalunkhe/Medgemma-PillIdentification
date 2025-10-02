export interface FdaResult {
  results: {
    active_ingredient?: string[];
    purpose?: string[];
    warnings?: string[];
    dosage_and_administration?: string[];
    adverse_reactions?: string[];
    drug_interactions?: string[];
    storage_and_handling?: string[];
    openfda?: {
      brand_name?: string[];
      generic_name?: string[];
    };
  }[];
}

export interface SideEffectChartItem {
  name: string;
  frequencyPercent: number;
  frequencyDescription: string;
}

export interface SideEffectsInfo {
  summary: string;
  chartData?: SideEffectChartItem[];
}

export interface MedicineInfo {
  name: string;
  summary?: string;
  activeIngredients?: string[] | string;
  purpose?: string[] | string;
  howToTake?: string[] | string;
  sideEffects?: string[] | string | SideEffectsInfo;
  whatToAvoid?: string[] | string;
  storage?: string[] | string;
  warnings?: string[] | string;
}

export interface FallbackMedicineInfo {
  summary: string;
  activeIngredients: string;
  purpose: string;
  howToTake: string;
  sideEffects: SideEffectsInfo;
  whatToAvoid: string;
  storage: string;
  warnings: string;
}

export interface FdaDataToSummarize {
    purpose?: string;
    howToTake?: string;
    sideEffects?: string;
    whatToAvoid?: string;
    storage?: string;
    warnings?: string;
}

export interface SummarizedMedicineInfo {
  summary: string;
  purpose: string;
  howToTake: string;
  sideEffects: SideEffectsInfo;
  whatToAvoid: string;
  storage: string;
  warnings: string;
}