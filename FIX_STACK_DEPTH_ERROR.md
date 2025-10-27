# Fix: Stack Depth Limit Exceeded

## Error
```
Failed to send invitation: stack depth limit exceeded
```

---

## What Happened?

The trigger `expire_old_invitations()` is causing an **infinite loop**. It updates the same table it's monitoring, which triggers itself again and again until the stack overflows.

---

## ✅ Quick Fix (2 Options)

### **Option 1: Fix the Trigger** (Keeps existing data)

Run this in Supabase SQL Editor:

```sql
-- Copy and paste content from: fix_trigger_recursion.sql
```

This removes the recursive trigger and replaces it with a safe one.

---

### **Option 2: Fresh Start** (Recommended - Simplest)

Run this in Supabase SQL Editor:

```sql
-- Copy and paste content from: setup_invitations_simple.sql
```

This:
- ✅ Drops the old table (if you have any test data, it will be deleted)
- ✅ Creates a new clean table
- ✅ No problematic triggers
- ✅ Simple permissive RLS policies
- ✅ Works immediately

---

## After Running the Fix

1. **Refresh your browser** (clear any cached errors)
2. Go to **User Management**
3. Click **"Add User"**
4. Fill the form
5. Click **"Send Invitation"**

It should work now! ✅

---

## Why This Happened

The original `create_pending_invitations_table.sql` had this trigger:

```sql
CREATE TRIGGER trigger_expire_invitations
    AFTER INSERT OR UPDATE ON public.pending_invitations
    EXECUTE FUNCTION expire_old_invitations();
```

The function did:
```sql
UPDATE public.pending_invitations  -- ❌ This triggers the same trigger!
SET invitation_status = 'expired'
WHERE ...
```

This created an infinite loop:
```
INSERT → Trigger fires → UPDATE → Trigger fires again → UPDATE → ...
```

---

## Recommendation

Use **Option 2** (`setup_invitations_simple.sql`) - it's the cleanest solution and sets everything up correctly from scratch.
