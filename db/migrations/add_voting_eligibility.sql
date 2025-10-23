
-- Add voting eligibility columns to assemblies table
ALTER TABLE assemblies 
ADD COLUMN IF NOT EXISTS voting_eligibility VARCHAR(20) DEFAULT 'todos',
ADD COLUMN IF NOT EXISTS allowed_categories JSONB DEFAULT '["fundador","efetivo","contribuinte"]'::jsonb;

-- Update existing assemblies to have default voting eligibility
UPDATE assemblies 
SET voting_eligibility = 'todos', 
    allowed_categories = '["fundador","efetivo","contribuinte"]'::jsonb
WHERE voting_eligibility IS NULL;

COMMENT ON COLUMN assemblies.voting_eligibility IS 'Controla quem pode votar: todos, fundador_efetivo, apenas_fundador';
COMMENT ON COLUMN assemblies.allowed_categories IS 'Array de categorias de associados permitidas para votar';
