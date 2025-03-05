import { SupabaseClient } from '@supabase/supabase-js';

export interface Player {
  id: number;
  name: string;
  college: string;
  position: string;
  image_url?: string;
  team?: string;
}

export function createSafeClient(): SupabaseClient | null;
export function safeQuery<T>(queryFn: (supabase: SupabaseClient) => Promise<T>, fallbackData?: T | null): Promise<{ data: T | null; error: Error | null; success: boolean }>;
export function checkSupabaseConnection(): Promise<boolean>;
export function getColleges(): Promise<string[]>;
export function getRandomPlayer(difficulty?: string | null): Promise<Player>;
export function getTodaysChallengePlayer(difficulty?: string): Promise<Player>;
export function getFallbackPlayer(): Player; 