-- In-App Purchase and Credits SQL schema

-- Create credits table for users
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Note: We generally don't want users updating their own credits directly.
-- For an IAP flow, transactions are verified and changes made using service role keys
-- or database functions, but this simple policy allows inserts for initializing balances.
CREATE POLICY "Users can initialize their own credits"
  ON public.user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can spend their own credits"
  ON public.user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Create credit transactions log
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'gift', 'refund')),
  amount INTEGER NOT NULL, -- positive for purchase/gift, negative for spend
  product_id TEXT, -- for IAP purchases
  transaction_id TEXT, -- native store transaction ID
  receipt TEXT, -- native store receipt token
  platform TEXT, -- 'ios' or 'android'
  action TEXT, -- e.g. 'send_rose', 'profile_boost', etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to safely spend credits
CREATE OR REPLACE FUNCTION spend_user_credits(p_user_id UUID, p_amount INTEGER, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Verify sufficient balance
  SELECT balance INTO v_current_balance 
  FROM user_credits 
  WHERE user_id = p_user_id 
  FOR UPDATE;

  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct balance
  UPDATE user_credits 
  SET balance = balance - p_amount, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO credit_transactions (user_id, type, amount, action)
  VALUES (p_user_id, 'spend', -p_amount, p_action);

  RETURN TRUE;
END;
$$;
