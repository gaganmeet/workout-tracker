-- Global exercise library. Runs under the service role (bypasses RLS), so
-- created_by stays null for all rows, marking them as global/seeded.
-- Safe to re-run: skips any name that already exists as a global exercise.

insert into public.exercises (name, muscle_group, equipment)
select v.name, v.muscle_group::public.muscle_group, v.equipment::public.equipment_type
from (values
  -- Chest
  ('Barbell Bench Press', 'chest', 'barbell'),
  ('Incline Barbell Bench Press', 'chest', 'barbell'),
  ('Decline Barbell Bench Press', 'chest', 'barbell'),
  ('Dumbbell Bench Press', 'chest', 'dumbbell'),
  ('Incline Dumbbell Bench Press', 'chest', 'dumbbell'),
  ('Dumbbell Fly', 'chest', 'dumbbell'),
  ('Cable Fly', 'chest', 'cable'),
  ('Chest Press Machine', 'chest', 'machine'),
  ('Pec Deck', 'chest', 'machine'),
  ('Push-Up', 'chest', 'bodyweight'),
  ('Dip', 'chest', 'bodyweight'),
  -- Back
  ('Deadlift', 'back', 'barbell'),
  ('Barbell Row', 'back', 'barbell'),
  ('Pendlay Row', 'back', 'barbell'),
  ('T-Bar Row', 'back', 'barbell'),
  ('Dumbbell Row', 'back', 'dumbbell'),
  ('Seated Cable Row', 'back', 'cable'),
  ('Lat Pulldown', 'back', 'cable'),
  ('Straight-Arm Pulldown', 'back', 'cable'),
  ('Pull-Up', 'back', 'bodyweight'),
  ('Chin-Up', 'back', 'bodyweight'),
  ('Inverted Row', 'back', 'bodyweight'),
  ('Rack Pull', 'back', 'barbell'),
  ('Romanian Deadlift', 'back', 'barbell'),
  -- Shoulders
  ('Overhead Press', 'shoulders', 'barbell'),
  ('Seated Dumbbell Shoulder Press', 'shoulders', 'dumbbell'),
  ('Arnold Press', 'shoulders', 'dumbbell'),
  ('Lateral Raise', 'shoulders', 'dumbbell'),
  ('Cable Lateral Raise', 'shoulders', 'cable'),
  ('Front Raise', 'shoulders', 'dumbbell'),
  ('Rear Delt Fly', 'shoulders', 'dumbbell'),
  ('Face Pull', 'shoulders', 'cable'),
  ('Upright Row', 'shoulders', 'barbell'),
  ('Shrug', 'shoulders', 'dumbbell'),
  ('Shoulder Press Machine', 'shoulders', 'machine'),
  -- Biceps
  ('Barbell Curl', 'biceps', 'barbell'),
  ('EZ-Bar Curl', 'biceps', 'barbell'),
  ('Dumbbell Curl', 'biceps', 'dumbbell'),
  ('Hammer Curl', 'biceps', 'dumbbell'),
  ('Incline Dumbbell Curl', 'biceps', 'dumbbell'),
  ('Preacher Curl', 'biceps', 'barbell'),
  ('Cable Curl', 'biceps', 'cable'),
  ('Concentration Curl', 'biceps', 'dumbbell'),
  -- Triceps
  ('Close-Grip Bench Press', 'triceps', 'barbell'),
  ('Triceps Pushdown', 'triceps', 'cable'),
  ('Overhead Triceps Extension', 'triceps', 'dumbbell'),
  ('Skull Crusher', 'triceps', 'barbell'),
  ('Triceps Kickback', 'triceps', 'dumbbell'),
  ('Bench Dip', 'triceps', 'bodyweight'),
  -- Quads
  ('Back Squat', 'quads', 'barbell'),
  ('Front Squat', 'quads', 'barbell'),
  ('Leg Press', 'quads', 'machine'),
  ('Leg Extension', 'quads', 'machine'),
  ('Bulgarian Split Squat', 'quads', 'dumbbell'),
  ('Walking Lunge', 'quads', 'dumbbell'),
  ('Goblet Squat', 'quads', 'dumbbell'),
  ('Hack Squat', 'quads', 'machine'),
  ('Step-Up', 'quads', 'dumbbell'),
  -- Hamstrings
  ('Lying Leg Curl', 'hamstrings', 'machine'),
  ('Seated Leg Curl', 'hamstrings', 'machine'),
  ('Stiff-Leg Deadlift', 'hamstrings', 'barbell'),
  ('Good Morning', 'hamstrings', 'barbell'),
  ('Nordic Curl', 'hamstrings', 'bodyweight'),
  -- Glutes
  ('Hip Thrust', 'glutes', 'barbell'),
  ('Glute Bridge', 'glutes', 'bodyweight'),
  ('Cable Kickback', 'glutes', 'cable'),
  ('Sumo Deadlift', 'glutes', 'barbell'),
  -- Calves
  ('Standing Calf Raise', 'calves', 'machine'),
  ('Seated Calf Raise', 'calves', 'machine'),
  ('Calf Press on Leg Press', 'calves', 'machine'),
  -- Core
  ('Plank', 'core', 'bodyweight'),
  ('Hanging Leg Raise', 'core', 'bodyweight'),
  ('Cable Crunch', 'core', 'cable'),
  ('Sit-Up', 'core', 'bodyweight'),
  ('Russian Twist', 'core', 'bodyweight'),
  ('Ab Wheel Rollout', 'core', 'bodyweight'),
  ('Side Plank', 'core', 'bodyweight'),
  ('Weighted Sit-Up', 'core', 'dumbbell'),
  -- Forearms
  ('Wrist Curl', 'forearms', 'dumbbell'),
  ('Reverse Wrist Curl', 'forearms', 'dumbbell'),
  ('Farmer''s Carry', 'forearms', 'dumbbell'),
  -- Full body
  ('Clean and Jerk', 'full_body', 'barbell'),
  ('Snatch', 'full_body', 'barbell'),
  ('Kettlebell Swing', 'full_body', 'kettlebell'),
  ('Thruster', 'full_body', 'barbell'),
  ('Burpee', 'full_body', 'bodyweight'),
  -- Cardio
  ('Treadmill Run', 'cardio', 'other'),
  ('Rowing Machine', 'cardio', 'machine'),
  ('Assault Bike', 'cardio', 'machine'),
  ('Jump Rope', 'cardio', 'other'),
  ('Stair Climber', 'cardio', 'machine')
) as v(name, muscle_group, equipment)
where not exists (
  select 1 from public.exercises e
  where e.created_by is null and lower(e.name) = lower(v.name)
);
