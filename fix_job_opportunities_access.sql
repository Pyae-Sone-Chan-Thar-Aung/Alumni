-- Fix Job Opportunities Access
-- This script ensures job opportunities are publicly readable

-- 1. Enable RLS on job_opportunities table
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active job opportunities" ON public.job_opportunities;
DROP POLICY IF EXISTS "Public can read active jobs" ON public.job_opportunities;
DROP POLICY IF EXISTS "Admins can manage job opportunities" ON public.job_opportunities;

-- 3. Create policy for PUBLIC READ access to active jobs
CREATE POLICY "Public can read active job opportunities"
ON public.job_opportunities
FOR SELECT
TO public
USING (is_active = true);

-- 4. Create policy for authenticated users to see all jobs
CREATE POLICY "Authenticated users can view all jobs"
ON public.job_opportunities
FOR SELECT
TO authenticated
USING (true);

-- 5. Create policy for admins to manage jobs
CREATE POLICY "Admins can manage job opportunities"
ON public.job_opportunities
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- 6. Verify the table structure
SELECT 
  'job_opportunities table structure:' as info,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'job_opportunities'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Check current job count
SELECT 
  'Current job statistics:' as info,
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE is_active = true) as active_jobs,
  COUNT(*) FILTER (WHERE is_active = false) as inactive_jobs
FROM public.job_opportunities;

-- 8. OPTIONAL: Add sample job opportunities (uncomment if you want sample data)
/*
INSERT INTO public.job_opportunities (
  title,
  company,
  location,
  salary_range,
  description,
  requirements,
  job_type,
  application_url,
  application_deadline,
  is_active,
  is_featured
) VALUES
  (
    'Senior Software Engineer',
    'Tech Innovations Inc.',
    'Manila, Philippines',
    '₱80,000 - ₱120,000',
    'We are looking for a Senior Software Engineer to join our growing team. You will be responsible for developing high-quality applications and collaborating with cross-functional teams.',
    '• 5+ years of experience in software development\n• Proficiency in JavaScript, React, Node.js\n• Experience with database systems (PostgreSQL, MongoDB)\n• Strong problem-solving skills\n• Bachelor''s degree in Computer Science or related field',
    'Full-time',
    'https://example.com/apply/senior-software-engineer',
    CURRENT_DATE + INTERVAL '30 days',
    true,
    true
  ),
  (
    'Frontend Developer',
    'Digital Solutions Corp',
    'Davao City, Philippines',
    '₱50,000 - ₱70,000',
    'Join our team as a Frontend Developer and help create amazing user experiences for our clients.',
    '• 3+ years of frontend development experience\n• Expert in React, Vue, or Angular\n• Understanding of responsive design\n• Experience with version control (Git)\n• Portfolio of previous work',
    'Full-time',
    'https://example.com/apply/frontend-developer',
    CURRENT_DATE + INTERVAL '45 days',
    true,
    false
  ),
  (
    'Data Analyst',
    'Analytics Hub',
    'Cebu City, Philippines',
    '₱40,000 - ₱60,000',
    'We are seeking a Data Analyst to help us make data-driven decisions and improve our business processes.',
    '• 2+ years of experience in data analysis\n• Proficiency in SQL, Python, or R\n• Experience with data visualization tools (Tableau, Power BI)\n• Strong analytical and communication skills\n• Bachelor''s degree in related field',
    'Full-time',
    'https://example.com/apply/data-analyst',
    CURRENT_DATE + INTERVAL '20 days',
    true,
    false
  ),
  (
    'DevOps Engineer',
    'Cloud Systems Ltd',
    'Remote (Philippines)',
    '₱70,000 - ₱100,000',
    'Looking for an experienced DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines.',
    '• 4+ years of DevOps experience\n• Experience with AWS, Azure, or GCP\n• Knowledge of Docker, Kubernetes\n• Experience with CI/CD tools (Jenkins, GitLab CI)\n• Strong scripting skills (Bash, Python)',
    'Remote',
    'https://example.com/apply/devops-engineer',
    CURRENT_DATE + INTERVAL '60 days',
    true,
    true
  ),
  (
    'UI/UX Designer',
    'Creative Designs Studio',
    'Manila, Philippines',
    '₱45,000 - ₱65,000',
    'We are looking for a creative UI/UX Designer to design intuitive and beautiful user interfaces.',
    '• 3+ years of UI/UX design experience\n• Proficiency in Figma, Adobe XD, or Sketch\n• Understanding of user-centered design principles\n• Portfolio showcasing previous work\n• Strong communication skills',
    'Full-time',
    'https://example.com/apply/ui-ux-designer',
    CURRENT_DATE + INTERVAL '30 days',
    true,
    false
  );
*/

-- Display final message
SELECT '✅ Job opportunities RLS policies updated successfully!' as status;
SELECT '💡 To add sample data, uncomment the INSERT statement above and run again.' as note;
