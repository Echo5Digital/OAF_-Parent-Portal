-- Synthetic demo data only — never load real foster child records into dev/test.
-- Mirrors the Emma/Liam/Sophie fixture already used in the front-end prototype
-- (src/data/model.ts) so the UI's look-and-feel carries over once wired to the API.

insert into users (id, cognito_sub, email, full_name, role) values
  ('00000000-0000-0000-0000-000000000001', null, 'jessica.smith@example.com', 'Jessica Smith', 'foster_parent'),
  ('00000000-0000-0000-0000-000000000002', null, 'maria.lopez@example.com', 'Dr. Maria Lopez, BCBA', 'therapist'),
  ('00000000-0000-0000-0000-000000000003', null, 'james.carter@example.com', 'Dr. James Carter, LPC', 'therapist'),
  ('00000000-0000-0000-0000-000000000004', null, 'admin@example.com', 'Open Arms Admin', 'administrator');

insert into households (id, primary_parent_user_id, label) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Smith Household');

insert into children (id, display_name, date_of_birth, classification, is_itfc, assigned_therapist_user_id) values
  ('20000000-0000-0000-0000-000000000001', 'Emma R.', '2017-03-14', 'TFC', false, '00000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000002', 'Liam T.', '2014-07-02', 'ITFC', true, '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000003', 'Sophie M.', '2019-11-20', 'CFC', false, '00000000-0000-0000-0000-000000000002');

insert into placements (id, child_id, household_id, placement_type) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'foster'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'foster'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'respite');

-- One current weekly log per child, each independent (enforced by the
-- unique (child_id, week_start_date) constraint on weekly_logs).
insert into weekly_logs (id, child_id, placement_id, household_id, week_start_date) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-10-05'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '2026-10-05'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '2026-10-05');

-- `answers` matches the shape of DailyLogEntry in src/data/model.ts (frontend is
-- the source of truth for field names since it was reconstructed from the live
-- Jotform). Real values here are synthetic.
insert into daily_entries (weekly_log_id, day_index, entry_date, status, is_respite_day, is_itfc_day, basic_living_skills_minutes, social_skills_minutes, answers) values
  ('40000000-0000-0000-0000-000000000001', 0, '2026-10-05', 'complete', false, false, 30, 60, '{
    "respite": "No",
    "basicLivingSkills": {"start": "08:00 AM", "stop": "08:30 AM", "minutes": 30, "skills": ["1: Age appropriate hygiene/self-care"], "method": "Model", "completion": "w/Minimal Assistance", "response": "Listened/Modeled"},
    "itfc": "No",
    "describeWhatHappened": "Calm morning, cooperative throughout.",
    "importantEvents": "None",
    "behaviorManagedUsing": ["Guided redirection"],
    "socialSkills": {"start": "04:00 PM", "stop": "05:00 PM", "minutes": 60, "skills": ["4: Social skills, sharing, taking turns"], "method": "Guided", "completion": "w/Minimal Assistance"},
    "behaviorChecklist": [],
    "parentSignature": "Jessica Smith",
    "signatureDate": "10-05-2026"
  }'::jsonb),
  ('40000000-0000-0000-0000-000000000002', 0, '2026-10-05', 'in_progress', false, false, null, null, '{
    "respite": "No",
    "basicLivingSkills": {"start": "06:30 PM", "stop": "", "minutes": "", "skills": ["5: Care for personal space/Belongings"], "method": "Model"}
  }'::jsonb);

-- Give Sophie's log a signed-and-awaiting-review status and an open correction
-- request so the staff dashboard's stat tiles and submissions list aren't all
-- zero/empty against this minimal seed set.
update weekly_logs
set status = 'awaiting_therapist_review', parent_signed_by = '00000000-0000-0000-0000-000000000001', parent_signed_at = now()
where id = '40000000-0000-0000-0000-000000000003';

insert into correction_requests (weekly_log_id, requested_by, reason) values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Please clarify the Day 2 notes for Emma — description is too brief for compliance review.');
