-- Open Arms Foster Care Management Platform — core schema (Phase Two, first slice)
-- Postgres. Chosen over DynamoDB for relational integrity across
-- parents/households/children/placements/logs — see memory/architecture_decisions.md.

create extension if not exists "pgcrypto";

create type user_role as enum (
  'foster_parent',
  'respite_caregiver',
  'therapist',
  'caseworker',
  'administrator',
  'management'
);

create type child_classification as enum ('TFC', 'ITFC', 'CFC');

create type day_status as enum ('empty', 'in_progress', 'complete');

create type weekly_log_status as enum (
  'in_progress',
  'awaiting_therapist_review',
  'changes_requested',
  'completed'
);

-- One row per authenticated person. `cognito_sub` links to the Cognito User Pool
-- identity; the app DB never stores passwords.
create table users (
  id uuid primary key default gen_random_uuid(),
  cognito_sub text unique,
  email text not null unique,
  full_name text not null,
  role user_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A household is the unit a foster parent manages; it can hold multiple children.
create table households (
  id uuid primary key default gen_random_uuid(),
  primary_parent_user_id uuid not null references users(id),
  label text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A second parent/guardian or respite caregiver can also have portal access to a household.
create table household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  relationship text not null default 'foster_parent',
  added_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table children (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  date_of_birth date,
  classification child_classification not null default 'TFC',
  is_itfc boolean not null default false,
  assigned_therapist_user_id uuid references users(id),
  assigned_caseworker_user_id uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Placement history: which household a child belongs to, over time. Staff can
-- move a child between households without losing historical logs — logs stay
-- tied to the placement that was active when they were written.
create table placements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id),
  household_id uuid not null references households(id),
  placement_type text not null default 'foster' check (placement_type in ('foster', 'respite')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  ended_reason text,
  created_at timestamptz not null default now()
);

create unique index one_active_placement_per_child
  on placements (child_id)
  where ended_at is null and placement_type = 'foster';

-- A weekly log is the 7-day documentation period for one child under one placement.
create table weekly_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id),
  placement_id uuid not null references placements(id),
  household_id uuid not null references households(id),
  week_start_date date not null,
  status weekly_log_status not null default 'in_progress',
  summary_notes text,
  parent_signed_by uuid references users(id),
  parent_signed_at timestamptz,
  therapist_signed_by uuid references users(id),
  therapist_signed_at timestamptz,
  signed_document_version int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, week_start_date)
);

-- One row per day (1-7) within a weekly log. Independent per child/week by construction
-- (FK to weekly_logs, which is itself unique per child+week) — this is what guarantees
-- one child's edits can never bleed into another's, the core Phase One/Two requirement.
--
-- `answers` holds the full set of real Jotform fields (two timed skill-activity
-- blocks, respite/ITFC branches, workbook selection, behavior checklist, signature,
-- etc. — see src/data/model.ts on the frontend for the authoritative shape) as JSONB
-- rather than one column per field. The real form has ~40 fields across several
-- conditional branches and is still being reconstructed from the live Jotform
-- (only Day 1 confirmed as of 2026-10-12) — JSONB avoids a migration on every field
-- discovered later. `status`, `is_respite_day`, and `basic_living_skills_minutes`
-- are pulled out as real columns because the API/reporting layer needs to query,
-- filter, and compliance-check on them without parsing JSON.
create table daily_entries (
  id uuid primary key default gen_random_uuid(),
  weekly_log_id uuid not null references weekly_logs(id) on delete cascade,
  day_index smallint not null check (day_index between 0 and 6),
  entry_date date not null,
  status day_status not null default 'empty',
  is_respite_day boolean not null default false,
  is_itfc_day boolean not null default false,
  basic_living_skills_minutes int,
  social_skills_minutes int,
  answers jsonb not null default '{}'::jsonb,
  last_edited_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (weekly_log_id, day_index)
);

create table correction_requests (
  id uuid primary key default gen_random_uuid(),
  weekly_log_id uuid not null references weekly_logs(id) on delete cascade,
  requested_by uuid not null references users(id),
  requested_at timestamptz not null default now(),
  reason text not null,
  resolved_at timestamptz,
  resolved_by uuid references users(id)
);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_user_id uuid references users(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  detail jsonb
);

create index idx_children_classification on children (classification);
create index idx_placements_household on placements (household_id);
create index idx_weekly_logs_child on weekly_logs (child_id);
create index idx_weekly_logs_household_status on weekly_logs (household_id, status);
create index idx_daily_entries_weekly_log on daily_entries (weekly_log_id);
create index idx_audit_events_entity on audit_events (entity_type, entity_id);
