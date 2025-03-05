export interface Ingredient {
  id: number;
  name: string;
  price: number;
  available: boolean;
}

export interface PizzaSelection {
  crust: Ingredient | null;
  sauce: Ingredient[];
  toppings: Ingredient[];
}

export interface ValidationResponse {
  isValid: boolean;
  totalPrice: number;
  error?: string;
} 