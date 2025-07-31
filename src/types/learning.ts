export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  is_mandatory: boolean;
  created_at: string;
  modules?: Module[];
  total_modules: number;
  completed_modules: number;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  material_url?: string;
  content?: string;
  duration_minutes?: number;
  order: number;
}

export interface UserModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed_at?: string;
  last_viewed_at: string;
} 