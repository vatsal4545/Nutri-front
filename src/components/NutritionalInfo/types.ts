export interface AdditiveWarning {
  code: string;
  risk: string;
}

export interface NutritionalInfoData {
  product_name: string;
  brand_name: string;
  energy_kcal_100g: number;
  proteins_100g: number;
  carbohydrates_100g: number;
  sugars_100g: number;
  fat_100g: number;
  "saturated-fat_100g": number;
  fiber_100g: number;
  salt_100g: number;
  sodium_100g: number;
  calcium_100g: number;
  iron_100g: number;
  "vitamin-c_100g": number;
  nutri_grade: string;
  eco_score: string;
  co2_emission: number;
  ingredients: string;
  allergens: string[];
  additives: {
    tags: string[];
    warnings: AdditiveWarning[];
    count: number;
  };
}
