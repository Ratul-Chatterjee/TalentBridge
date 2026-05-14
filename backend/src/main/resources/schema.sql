create table if not exists companies (
  id varchar(64) primary key,
  name varchar(255) not null,
  contact_email varchar(255) not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists requirements (
  id varchar(64) primary key,
  company_id varchar(64) not null references companies(id),
  drive_type varchar(32) not null,
  overall_status varchar(32) not null,
  partial_approval_confirmed boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists roles (
  id varchar(64) primary key,
  requirement_id varchar(64) not null references requirements(id),
  role_title varchar(255) not null,
  position_count integer not null default 1,
  individual_role_status varchar(32) not null,
  about_company text,
  about_role text,
  required_skills text,
  experience text,
  compensation text,
  working_hours text,
  location text,
  admin_internal_notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists candidates (
  id varchar(64) primary key,
  role_id varchar(64) not null references roles(id),
  full_name varchar(255) not null,
  email varchar(255),
  phone varchar(50),
  current_company varchar(255),
  years_of_experience varchar(32),
  source varchar(64),
  current_pipeline_stage varchar(32) not null,
  resume_file_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists interview_rounds (
  id varchar(64) primary key,
  candidate_id varchar(64) not null references candidates(id),
  round_number integer not null,
  round_type varchar(32) not null,
  interviewer_name varchar(255),
  interview_date date,
  notes text,
  rating integer,
  created_at timestamp with time zone not null default now()
);

create table if not exists candidate_notes (
  id varchar(64) primary key,
  candidate_id varchar(64) not null references candidates(id),
  note_text text not null,
  created_by varchar(255) not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists llm_settings (
  id bigint primary key,
  active_provider varchar(32) not null,
  updated_at timestamp with time zone not null default now()
);

insert into llm_settings (id, active_provider, updated_at)
values (1, 'openai', now())
on conflict (id) do nothing;
