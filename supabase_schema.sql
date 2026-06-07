create table if not exists kr_logs (
  id bigint generated always as identity primary key,
  type text not null,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists kr_memory (
  id bigint generated always as identity primary key,
  title text,
  content text not null,
  tags text[],
  created_at timestamptz default now()
);
