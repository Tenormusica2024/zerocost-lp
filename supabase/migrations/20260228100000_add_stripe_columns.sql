ALTER TABLE zerocost_keys
  ADD COLUMN IF NOT EXISTS stripe_customer_id    text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_status   text NOT NULL DEFAULT 'none';
-- subscription_status: 'none' | 'active' | 'past_due' | 'canceled'

CREATE INDEX IF NOT EXISTS zerocost_keys_stripe_customer_idx
  ON zerocost_keys(stripe_customer_id);
