create table if not exists kr_logs (id bigint generated always as identity primary key,type text not null,data jsonb not null,created_at timestamptz default now());
create table if not exists kr_memory (id bigint generated always as identity primary key,type text,content text not null,tag text,created_at timestamptz default now());
create table if not exists kr_command_queue (id bigint generated always as identity primary key,device text not null,action text not null,status text default 'pending',claimed_at timestamptz,result jsonb,created_at timestamptz default now());
create table if not exists kr_trade_journal (id bigint generated always as identity primary key,pair text,direction text,entry numeric,stop_loss numeric,take_profit numeric,result text,session text,notes text,created_at timestamptz default now());
create table if not exists kr_alerts (id bigint generated always as identity primary key,type text not null,message text not null,priority text default 'medium',active boolean default true,created_at timestamptz default now());
create table if not exists kr_device_status (id bigint generated always as identity primary key,device text not null,data jsonb not null,created_at timestamptz default now());
create table if not exists kr_update_log (id bigint generated always as identity primary key,version text,changes jsonb,created_at timestamptz default now());
create index if not exists idx_kr_command_queue_pending on kr_command_queue(device,status,created_at);


create table if not exists kr_market_snapshots (
  id bigint generated always as identity primary key,
  pair text,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists kr_research_reports (
  id bigint generated always as identity primary key,
  query text not null,
  summary text,
  results jsonb,
  created_at timestamptz default now()
);

create table if not exists kr_wallet_watch (
  id bigint generated always as identity primary key,
  wallet text not null,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists kr_price_alerts (id bigint generated always as identity primary key,pair text not null,direction text not null,price numeric not null,active boolean default true,triggered_at timestamptz,created_at timestamptz default now());


alter table if exists kr_memory add column if not exists importance text default 'medium';

create table if not exists kr_screenshot_history (
  id bigint generated always as identity primary key,
  prompt text,
  analysis text,
  created_at timestamptz default now()
);


create table if not exists kr_agent_tasks (id bigint generated always as identity primary key, task text not null, agent text not null, status text default 'pending', result jsonb, created_at timestamptz default now());
create table if not exists kr_notifications (id bigint generated always as identity primary key, title text, message text not null, type text default 'manual', created_at timestamptz default now());
create table if not exists kr_conversation_history (id bigint generated always as identity primary key, session_id text default 'default', role text not null, content text not null, created_at timestamptz default now());
create table if not exists kr_portfolio (id bigint generated always as identity primary key, asset text not null, market text default 'crypto', size numeric default 0, entry numeric default 0, notes text, created_at timestamptz default now());
create table if not exists kr_user_preferences (id bigint generated always as identity primary key, language text default 'en', personality text default 'jarvis', created_at timestamptz default now());


create table if not exists kr_screen_awareness (
  id bigint generated always as identity primary key,
  prompt text,
  analysis text,
  created_at timestamptz default now()
);

create table if not exists kr_confirmation_requests (
  id bigint generated always as identity primary key,
  action text not null,
  risk text default 'high',
  status text not null,
  message text,
  created_at timestamptz default now()
);


create table if not exists kr_intelligence_snapshots (
  id bigint generated always as identity primary key,
  score numeric,
  summary text,
  data jsonb,
  created_at timestamptz default now()
);

create table if not exists kr_knowledge_edges (
  id bigint generated always as identity primary key,
  source text not null,
  target text not null,
  relation text,
  data jsonb,
  created_at timestamptz default now()
);


-- K-R Local AI Models Registry (ADD-ONLY)
-- Model files stay on Dikong's laptop. Supabase stores only metadata/config.
create table if not exists kr_local_models (
  id text primary key,
  name text not null,
  runner text,
  type text,
  parameters text,
  quantization text,
  file_size text,
  ram_required text,
  role text,
  notes text,
  active boolean default true,
  created_at timestamptz default now()
);

insert into kr_local_models (id,name,runner,type,parameters,quantization,file_size,ram_required,role,notes,active)
values
('gpt4all-falcon-q4_0','GPT4All Falcon','GPT4All v3.10.0','Falcon','7B','q4_0','3.92 GB','8 GB','emergency_backup','Fast local fallback model. Keep as emergency backup only.',true),
('mistral-7b-instruct-v0.2-gguf-q4_0','TheBloke/Mistral-7B-Instruct-v0.2-GGUF','GPT4All v3.10.0','Mistral','7B','q4_0','3.83 GB','~8 GB','primary_offline_backup','Best current offline backup brain for K-R from the installed models.',true)
on conflict (id) do update set
  name=excluded.name,
  runner=excluded.runner,
  type=excluded.type,
  parameters=excluded.parameters,
  quantization=excluded.quantization,
  file_size=excluded.file_size,
  ram_required=excluded.ram_required,
  role=excluded.role,
  notes=excluded.notes,
  active=excluded.active;
