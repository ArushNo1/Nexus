-- Trigger function to create a user_profile on new user signup
-- ONLY creates profile if role is explicitly provided in metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if role is explicitly provided in metadata
  -- This prevents auto-creating student profiles for OAuth users who haven't chosen a role yet
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, role, full_name, email, avatar_url)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'role',
      NEW.raw_user_meta_data->>'full_name',
      NEW.email,
      NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING; -- Prevent duplicate inserts
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function after a new user is created in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
