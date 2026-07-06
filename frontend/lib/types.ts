export interface User {
  id: string;
  email: string;
  name: string;
  profile_pic: string;
  email_verified: boolean;
  reminder_on: boolean;
  created_at: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  synonyms: string;
  antonyms: string;
  introduced_cycle: number;
  created_at: string;
}

export interface Review {
  id: string;
  word: string;
  meaning: string;
  review_count: number;
  last_reviewed: string;
}

export interface CycleReviewStatus {
  total_words: number;
  min_reviews: number;
  can_complete: boolean;
  reviews_needed: number;
}

export interface Cycle {
  id: string;
  cycle_number: number;
  is_full_review: boolean;
  is_completed: boolean;
  started_at: string;
  completed_at: string | null;
  word_count: number;
}

export interface CycleDetail {
  id: string;
  cycle_number: number;
  is_full_review: boolean;
  is_completed: boolean;
  started_at: string;
  completed_at: string | null;
  reviews: Review[];
  review_status: CycleReviewStatus;
}

export interface Stats {
  total_words: number;
  completed_cycles: number;
  current_cycle_number: number;
  current_cycle_id: string | null;
  is_full_review: boolean;
  streak: number;
  words_today: number;
  daily_goal: number;
  daily_goal_percentage: number;
}
