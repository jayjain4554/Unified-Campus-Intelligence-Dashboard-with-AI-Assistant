export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  calories?: number;
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  availability: boolean;
}

export interface MealMenu {
  date: string;
  mealType: MealType;
  items: MenuItem[];
}

export interface CafeteriaBalance {
  studentId: string;
  balance: number;
  lastTransactionDate: string;
}

export interface WaitTimeEstimate {
  cafeteriaName: string;
  currentWaitMinutes: number;
  crowdStatus: 'Low' | 'Medium' | 'High';
}
