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

insert into daily_entries (weekly_log_id, day_index, entry_date, status, start_time, stop_time, duration_minutes, skill_area, teaching_method, child_performance, notes) values
  ('40000000-0000-0000-0000-000000000001', 0, '2026-10-05', 'complete', '08:00 AM', '08:30 AM', 30, 'Personal Hygiene', 'Model', 'With Minimal Assistance', 'Completed morning routine with minimal prompts.'),
  ('40000000-0000-0000-0000-000000000001', 1, '2026-10-06', 'complete', '07:45 AM', '08:20 AM', 35, 'Meal Preparation', 'Guide', 'Independently', 'Helped prepare breakfast independently.'),
  ('40000000-0000-0000-0000-000000000002', 0, '2026-10-05', 'in_progress', '06:30 PM', null, null, 'Personal Space', 'Model', null, null);
