-- User Profiles with Tier System
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('personal', 'team', 'enterprise')) DEFAULT 'personal',
  limits JSONB NOT NULL DEFAULT '{}',
  usage JSONB NOT NULL DEFAULT '{"messagesUsed": 0, "agentsCreated": 0, "storageUsed": 0}',
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Team Profiles
CREATE TABLE team_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  billing JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES team_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team Shared Resources
CREATE TABLE team_shared_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES team_profiles(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('agent', 'conversation', 'file', 'workspace')),
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  permissions TEXT[] NOT NULL DEFAULT ARRAY['read']
);

-- Enterprise Profiles
CREATE TABLE enterprise_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rate_limits JSONB NOT NULL DEFAULT '{}',
  billing JSONB NOT NULL DEFAULT '{}',
  support JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id)
);

-- Enterprise Custom LLM Endpoints
CREATE TABLE enterprise_llm_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  api_key_encrypted TEXT,
  model_type TEXT NOT NULL,
  rate_limit INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_shared_resources_team_id ON team_shared_resources(team_id);
CREATE INDEX idx_enterprise_llm_endpoints_enterprise_id ON enterprise_llm_endpoints(enterprise_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_shared_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_llm_endpoints ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Team Profiles: Team members can view, owners can manage
CREATE POLICY "Team members can view team profile" ON team_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = team_profiles.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage team profile" ON team_profiles
  FOR ALL USING (auth.uid() = owner_id);

-- Team Members: Team members can view, admins can manage
CREATE POLICY "Team members can view team members" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_members.team_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_members.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
  );

-- Team Shared Resources: Team members can view, contributors can manage
CREATE POLICY "Team members can view shared resources" ON team_shared_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = team_shared_resources.team_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Resource owners can manage shared resources" ON team_shared_resources
  FOR ALL USING (auth.uid() = shared_by);

-- Enterprise Profiles: Only owners can access
CREATE POLICY "Enterprise owners can manage profile" ON enterprise_profiles
  FOR ALL USING (auth.uid() = owner_id);

-- Enterprise LLM Endpoints: Only enterprise owners can access
CREATE POLICY "Enterprise owners can manage LLM endpoints" ON enterprise_llm_endpoints
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM enterprise_profiles 
      WHERE id = enterprise_llm_endpoints.enterprise_id 
      AND owner_id = auth.uid()
    )
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_profiles_updated_at 
  BEFORE UPDATE ON team_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_profiles_updated_at 
  BEFORE UPDATE ON enterprise_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
