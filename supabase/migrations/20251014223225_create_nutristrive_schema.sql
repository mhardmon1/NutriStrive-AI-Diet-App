/*
  # NutriStrive Database Schema - Phase 1A
  
  ## Overview
  Complete database schema for NutriStrive AI-powered nutrition tracking app.
  Supports user profiles, meal logging, food database caching, workouts, hydration tracking,
  and offline sync capabilities.
  
  ## New Tables
  
  ### Authentication & User Management
  - `users` - User profiles with physical stats and goals
  - `nutrition_targets` - Daily nutrition goals per user
  
  ### Food & Nutrition
  - `usda_food_cache` - Cached USDA FoodData Central API results
  - `custom_foods` - User-created custom foods
  - `meals` - Logged meals with meal type and timestamp
  - `meal_foods` - Individual food items within meals
  - `recent_foods` - User's recently logged foods for quick access
  
  ### Activity Tracking
  - `workouts` - Workout sessions with duration and intensity
  - `hydration_logs` - Water intake tracking
  
  ### Offline Support
  - `sync_queue` - Pending changes to sync when online
  
  ## Security
  - All tables have RLS enabled
  - Policies restrict access to authenticated users
  - Users can only access their own data
  
  ## Notes
  - Uses `auth.uid()` for user identification
  - Default values provided where appropriate
  - Timestamps use `timestamptz` for timezone awareness
  - Foreign key constraints ensure data integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  sex text CHECK (sex IN ('male', 'female', 'other')),
  date_of_birth date,
  height_cm integer,
  weight_kg decimal(5,2),
  sport text,
  position text,
  goals text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- ============================================================================
-- NUTRITION TARGETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS nutrition_targets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_calories integer NOT NULL DEFAULT 2500,
  target_protein integer NOT NULL DEFAULT 150,
  target_carbs integer NOT NULL DEFAULT 250,
  target_fat integer NOT NULL DEFAULT 70,
  target_water_ml integer NOT NULL DEFAULT 2500,
  activity_level text DEFAULT 'moderate' CHECK (activity_level IN ('low', 'moderate', 'high', 'athlete')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_nutrition_targets_user ON nutrition_targets(user_id);

ALTER TABLE nutrition_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own targets"
  ON nutrition_targets FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own targets"
  ON nutrition_targets FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own targets"
  ON nutrition_targets FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================================
-- USDA FOOD CACHE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS usda_food_cache (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fdc_id integer UNIQUE NOT NULL,
  food_name text NOT NULL,
  brand_name text,
  data_type text,
  description text,
  ingredients text,
  serving_size decimal(10,2),
  serving_size_unit text,
  calories_per_100g decimal(10,2),
  protein_per_100g decimal(10,2),
  carbs_per_100g decimal(10,2),
  fat_per_100g decimal(10,2),
  fiber_per_100g decimal(10,2),
  sugar_per_100g decimal(10,2),
  sodium_per_100g decimal(10,2),
  raw_data jsonb,
  search_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usda_food_fdc ON usda_food_cache(fdc_id);
CREATE INDEX IF NOT EXISTS idx_usda_food_name ON usda_food_cache(food_name);
CREATE INDEX IF NOT EXISTS idx_usda_food_search_count ON usda_food_cache(search_count DESC);

ALTER TABLE usda_food_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cached foods"
  ON usda_food_cache FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- CUSTOM FOODS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS custom_foods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  brand_name text,
  description text,
  serving_size decimal(10,2),
  serving_size_unit text,
  calories_per_100g decimal(10,2) NOT NULL,
  protein_per_100g decimal(10,2) NOT NULL DEFAULT 0,
  carbs_per_100g decimal(10,2) NOT NULL DEFAULT 0,
  fat_per_100g decimal(10,2) NOT NULL DEFAULT 0,
  fiber_per_100g decimal(10,2) DEFAULT 0,
  sugar_per_100g decimal(10,2) DEFAULT 0,
  sodium_per_100g decimal(10,2) DEFAULT 0,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_foods_user ON custom_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_foods_favorites ON custom_foods(user_id, is_favorite) WHERE is_favorite = true;

ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom foods"
  ON custom_foods FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own custom foods"
  ON custom_foods FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own custom foods"
  ON custom_foods FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own custom foods"
  ON custom_foods FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================================
-- MEALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_type text NOT NULL DEFAULT 'meal' CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'meal')),
  meal_date date NOT NULL DEFAULT CURRENT_DATE,
  logged_at timestamptz DEFAULT now() NOT NULL,
  notes text,
  image_url text,
  total_calories decimal(10,2) DEFAULT 0,
  total_protein decimal(10,2) DEFAULT 0,
  total_carbs decimal(10,2) DEFAULT 0,
  total_fat decimal(10,2) DEFAULT 0,
  is_synced boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, meal_date DESC);
CREATE INDEX IF NOT EXISTS idx_meals_sync ON meals(is_synced) WHERE is_synced = false;

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================================
-- MEAL FOODS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_foods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  food_source text DEFAULT 'usda' CHECK (food_source IN ('usda', 'custom', 'ai')),
  fdc_id integer,
  custom_food_id uuid REFERENCES custom_foods(id) ON DELETE SET NULL,
  quantity_grams decimal(10,2) NOT NULL,
  calories_per_100g decimal(10,2) NOT NULL,
  protein_per_100g decimal(10,2) NOT NULL DEFAULT 0,
  carbs_per_100g decimal(10,2) NOT NULL DEFAULT 0,
  fat_per_100g decimal(10,2) NOT NULL DEFAULT 0,
  preparation_method text,
  image_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meal_foods_meal ON meal_foods(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_foods_fdc ON meal_foods(fdc_id);

ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view foods in own meals"
  ON meal_foods FOR SELECT
  TO authenticated
  USING (meal_id IN (SELECT id FROM meals WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

CREATE POLICY "Users can insert foods in own meals"
  ON meal_foods FOR INSERT
  TO authenticated
  WITH CHECK (meal_id IN (SELECT id FROM meals WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

CREATE POLICY "Users can update foods in own meals"
  ON meal_foods FOR UPDATE
  TO authenticated
  USING (meal_id IN (SELECT id FROM meals WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())))
  WITH CHECK (meal_id IN (SELECT id FROM meals WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

CREATE POLICY "Users can delete foods in own meals"
  ON meal_foods FOR DELETE
  TO authenticated
  USING (meal_id IN (SELECT id FROM meals WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- ============================================================================
-- RECENT FOODS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS recent_foods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  food_source text NOT NULL CHECK (food_source IN ('usda', 'custom')),
  fdc_id integer,
  custom_food_id uuid REFERENCES custom_foods(id) ON DELETE CASCADE,
  last_used_at timestamptz DEFAULT now() NOT NULL,
  use_count integer DEFAULT 1,
  UNIQUE(user_id, food_source, fdc_id, custom_food_id)
);

CREATE INDEX IF NOT EXISTS idx_recent_foods_user_last_used ON recent_foods(user_id, last_used_at DESC);

ALTER TABLE recent_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recent foods"
  ON recent_foods FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own recent foods"
  ON recent_foods FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own recent foods"
  ON recent_foods FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================================
-- WORKOUTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_type text NOT NULL,
  workout_date date NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes integer,
  intensity text CHECK (intensity IN ('low', 'moderate', 'high', 'max')),
  calories_burned integer,
  notes text,
  is_synced boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_sync ON workouts(is_synced) WHERE is_synced = false;

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================================
-- HYDRATION LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS hydration_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_ml integer NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  logged_at timestamptz DEFAULT now() NOT NULL,
  is_synced boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hydration_user_date ON hydration_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_hydration_sync ON hydration_logs(is_synced) WHERE is_synced = false;

ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hydration logs"
  ON hydration_logs FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own hydration logs"
  ON hydration_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own hydration logs"
  ON hydration_logs FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own hydration logs"
  ON hydration_logs FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================================================
-- SYNC QUEUE TABLE (for offline support)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_queue (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  operation text NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
  record_id uuid NOT NULL,
  payload jsonb NOT NULL,
  retry_count integer DEFAULT 0,
  last_error text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_user ON sync_queue(user_id, created_at);

ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync queue"
  ON sync_queue FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own sync queue items"
  ON sync_queue FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own sync queue items"
  ON sync_queue FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));