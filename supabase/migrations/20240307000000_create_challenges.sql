-- Create the challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    player_name TEXT NOT NULL,
    college_name TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on the date column for faster queries
CREATE INDEX IF NOT EXISTS challenges_date_idx ON public.challenges(date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to read challenges
CREATE POLICY "Allow authenticated users to read challenges"
    ON public.challenges
    FOR SELECT
    TO authenticated
    USING (true);

-- Create a policy that allows only service role to insert/update/delete challenges
CREATE POLICY "Allow service role to manage challenges"
    ON public.challenges
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_challenges_updated_at
    BEFORE UPDATE ON public.challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 