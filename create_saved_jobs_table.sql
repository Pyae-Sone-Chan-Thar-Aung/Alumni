-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES job_opportunities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);

-- Enable RLS (Row Level Security)
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own saved jobs
CREATE POLICY "Users can view their own saved jobs"
    ON saved_jobs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own saved jobs
CREATE POLICY "Users can save jobs"
    ON saved_jobs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved jobs
CREATE POLICY "Users can unsave jobs"
    ON saved_jobs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON saved_jobs TO authenticated;
GRANT ALL ON saved_jobs TO service_role;
