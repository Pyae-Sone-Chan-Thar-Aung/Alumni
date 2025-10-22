-- Quick test to create one connection and test the query issue
INSERT INTO public.user_connections (
    requester_id,
    recipient_id,
    status,
    message,
    created_at,
    updated_at
)
SELECT 
    u1.id as requester_id,
    u2.id as recipient_id,
    'accepted' as status,
    'Test connection' as message,
    NOW() as created_at,
    NOW() as updated_at
FROM public.users u1
CROSS JOIN public.users u2
WHERE u1.id != u2.id
AND u1.approval_status = 'approved'
AND u2.approval_status = 'approved'
LIMIT 1
ON CONFLICT (requester_id, recipient_id) DO NOTHING;

-- Test the problematic query
SELECT 
    uc.*,
    u1.first_name as requester_first_name,
    u1.last_name as requester_last_name,
    u2.first_name as recipient_first_name,
    u2.last_name as recipient_last_name
FROM public.user_connections uc
LEFT JOIN public.users u1 ON uc.requester_id = u1.id
LEFT JOIN public.users u2 ON uc.recipient_id = u2.id
LIMIT 1;
