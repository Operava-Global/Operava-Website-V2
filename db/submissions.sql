-- OPERAVA Website + Recruitment AVA schema for Cloudflare D1.
-- Apply remotely to operava-submissions before deployment.

CREATE TABLE IF NOT EXISTS form_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_id TEXT NOT NULL UNIQUE,
  form_type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  payload TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'PENDING',
  status TEXT NOT NULL DEFAULT 'NEW',
  resume_key TEXT,
  resume_text TEXT,
  resume_parsed TEXT,
  created_at TEXT NOT NULL,
  verified_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(form_type, created_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON form_submissions(email);

CREATE TABLE IF NOT EXISTS form_otps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  form_type TEXT NOT NULL,
  draft_id TEXT NOT NULL UNIQUE,
  code_hash TEXT NOT NULL,
  payload TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  resends INTEGER NOT NULL DEFAULT 0,
  last_sent_at INTEGER NOT NULL,
  consumed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_form_otps_email ON form_otps(email, form_type, consumed);

CREATE TABLE IF NOT EXISTS applicants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_verified INTEGER NOT NULL DEFAULT 0,
  email_verified_at TEXT,
  phone TEXT,
  position_title TEXT NOT NULL,
  position_code TEXT NOT NULL CHECK (position_code IN ('tech', 'ops', 'cx')),
  education TEXT,
  experience_years TEXT,
  experience_summary TEXT,
  skills TEXT NOT NULL DEFAULT '[]',
  position_specific TEXT,
  availability TEXT,
  start_date TEXT,
  additional TEXT,
  status TEXT NOT NULL DEFAULT 'APPLICATION_IN_PROGRESS',
  source TEXT NOT NULL DEFAULT 'recruitment_ava',
  application_txt TEXT,
  application_txt_name TEXT,
  terms_accepted INTEGER NOT NULL DEFAULT 0,
  privacy_accepted INTEGER NOT NULL DEFAULT 0,
  otp_confirmed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS applicants_email_position_uidx ON applicants(email, position_code);
CREATE INDEX IF NOT EXISTS applicants_status_idx ON applicants(status);
CREATE INDEX IF NOT EXISTS applicants_created_idx ON applicants(created_at);

CREATE TABLE IF NOT EXISTS applicant_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (application_id) REFERENCES applicants(application_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS applicant_messages_app_idx ON applicant_messages(application_id, created_at);

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id TEXT NOT NULL UNIQUE,
  position_code TEXT NOT NULL CHECK (position_code IN ('tech', 'ops', 'cx')),
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETE', 'ABANDONED')),
  current_index INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  answers TEXT NOT NULL DEFAULT '[]',
  questions TEXT NOT NULL DEFAULT '[]',
  score_percent REAL,
  passed INTEGER,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (application_id) REFERENCES applicants(application_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS assessments_app_idx ON assessments(application_id);

CREATE TABLE IF NOT EXISTS document_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_id TEXT NOT NULL UNIQUE,
  title TEXT,
  issued_at TEXT,
  status TEXT NOT NULL DEFAULT 'verified',
  note TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS document_verifications_status_idx ON document_verifications(status);

CREATE TABLE IF NOT EXISTS resumes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 resume_key TEXT NOT NULL UNIQUE,
 original_filename TEXT,
 content_type TEXT,
 text_content TEXT NOT NULL,
 parsed_json TEXT,
 full_name TEXT,
 email TEXT,
 phone TEXT,
 location TEXT,
 education TEXT,
 experience TEXT,
 skills TEXT,
 summary TEXT,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_resumes_email ON resumes(email);
CREATE INDEX IF NOT EXISTS idx_resumes_key ON resumes(resume_key);

-- Ava Screening: public OTP registration, provider-backed mobile identity and monitored assessment.
-- Keep these tables separate from the disabled legacy Recruitment AVA tables.
CREATE TABLE IF NOT EXISTS ava_screening_sessions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('tech','ops','cx')),
  invite_exp INTEGER NOT NULL,
  otp_hash TEXT,
  otp_expires INTEGER NOT NULL DEFAULT 0,
  otp_attempts INTEGER NOT NULL DEFAULT 0,
  otp_sent INTEGER NOT NULL DEFAULT 0,
  otp_count INTEGER NOT NULL DEFAULT 0,
  verified_at INTEGER,
  session_hash TEXT,
  session_expires INTEGER,
  identity_status TEXT NOT NULL DEFAULT 'not_submitted',
  identity_key TEXT,
  identity_kind TEXT,
  identity_submitted INTEGER,
  identity_reviewed INTEGER,
  identity_consent_at INTEGER,
  profile TEXT,
  consent_at INTEGER,
  monitor_consent_at INTEGER,
  proctor_consent_at INTEGER,
  ai_consent_at INTEGER,
  proctor_paused_at INTEGER,
  proctor_pause_reason TEXT,
  proctor_incidents INTEGER NOT NULL DEFAULT 0,
  proctor_heartbeat_at INTEGER,
  assessment_rules_accepted_at INTEGER,
  assessment_status TEXT NOT NULL DEFAULT 'not_started',
  assessment_started INTEGER,
  deadline INTEGER,
  completed INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ava_screening_review_idx ON ava_screening_sessions(identity_status, identity_submitted);
CREATE INDEX IF NOT EXISTS ava_screening_email_idx ON ava_screening_sessions(email, created_at);

CREATE TABLE IF NOT EXISTS ava_screening_answers (
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'typed',
  review_status TEXT NOT NULL DEFAULT 'pending',
  review_json TEXT,
  submitted_at INTEGER NOT NULL,
  PRIMARY KEY(session_id, question_id),
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ava_screening_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ava_screening_event_idx ON ava_screening_events(session_id, occurred_at);
CREATE TABLE IF NOT EXISTS ava_screening_manual_reviews (
  session_id TEXT PRIMARY KEY,
  review_status TEXT NOT NULL CHECK (review_status IN ('reviewed','follow_up_required')),
  reviewer_note TEXT NOT NULL DEFAULT '',
  reviewed_at INTEGER NOT NULL,
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ava_screening_review_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  recorded_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ava_screening_review_events_idx
  ON ava_screening_review_events(session_id, recorded_at);

-- Individual invitation audit and recruiter dashboard tracking.
CREATE TABLE IF NOT EXISTS ava_screening_invitations (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('tech','ops','cx')),
  sent_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  invited_by TEXT NOT NULL DEFAULT 'reviewer_api'
);
CREATE INDEX IF NOT EXISTS ava_screening_invitation_sent_idx
  ON ava_screening_invitations(sent_at DESC);

-- Public self-registration maps one normalized email to one resumable assessment.
CREATE TABLE IF NOT EXISTS ava_screening_public_accounts (
  email TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ava_screening_public_account_session_idx
  ON ava_screening_public_accounts(session_id);

-- Rolling 24-hour OTP send event audit; independent of the latest send cooldown.
CREATE TABLE IF NOT EXISTS ava_screening_public_otp_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  recorded_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ava_public_otp_by_email_time
  ON ava_screening_public_otp_events(email, recorded_at);


-- Ava V2+ per-submission assessments, certified identity events and onboarding workflow.
-- Existing Ava v1 sessions are migrated safely by functions/api/ava-screening.ts ensure().
CREATE TABLE IF NOT EXISTS ava_screening_application_links (
  reference_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ava_screening_questions (
  session_id TEXT NOT NULL,
  question_number INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  PRIMARY KEY(session_id, question_number),
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);
-- OPERAVA-owned live camera capture: challenge and private R2 object keys only.
-- No automatic biometric match, forged authenticity or certified liveness claim.
CREATE TABLE IF NOT EXISTS ava_screening_owned_identity (
  session_id TEXT PRIMARY KEY,
  challenge_hash TEXT NOT NULL,
  issued_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  document_key TEXT,
  selfie_key TEXT,
  motion_key TEXT,
  document_type TEXT,
  consent_at INTEGER,
  submitted_at INTEGER,
  reviewed_at INTEGER,
  reviewer_note TEXT,
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ava_screening_identity_intents (
  session_id TEXT PRIMARY KEY,
  vendor_reference TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  provider_url TEXT,
  link_token_hash TEXT,
  link_expires_at INTEGER,
  link_used_at INTEGER,
  provider_status TEXT NOT NULL DEFAULT 'created',
  attempt_count INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ava_screening_identity_provider_decisions (
  session_id TEXT PRIMARY KEY,
  vendor_reference TEXT NOT NULL UNIQUE,
  provider_status TEXT NOT NULL,
  decision_code INTEGER,
  document_type TEXT,
  document_country TEXT,
  name_match INTEGER NOT NULL DEFAULT 0,
  decision_time INTEGER,
  received_at INTEGER NOT NULL,
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ava_screening_identity_attestations (
  session_id TEXT PRIMARY KEY,
  vendor_reference TEXT NOT NULL UNIQUE,
  face_score REAL NOT NULL,
  liveness_pass INTEGER NOT NULL,
  document_authentic INTEGER NOT NULL,
  document_name_match INTEGER NOT NULL,
  passport_nfc_pass INTEGER NOT NULL,
  status TEXT NOT NULL,
  checked_at INTEGER NOT NULL,
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ava_screening_provider_events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  received_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS ava_screening_proctor_evidence (
  session_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  chunk_id TEXT NOT NULL,
  object_key TEXT NOT NULL,
  recorded_at INTEGER NOT NULL,
  PRIMARY KEY(session_id,kind,chunk_id),
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ava_proctor_evidence_latest
  ON ava_screening_proctor_evidence(session_id,kind,recorded_at DESC);
CREATE TABLE IF NOT EXISTS ava_screening_onboarding_documents (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  request_note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'requested',
  original_name TEXT,
  content_type TEXT,
  object_key TEXT,
  requested_at INTEGER NOT NULL,
  submitted_at INTEGER,
  reviewed_at INTEGER,
  review_note TEXT,
  FOREIGN KEY(session_id) REFERENCES ava_screening_sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ava_onboarding_session_idx
  ON ava_screening_onboarding_documents(session_id,requested_at DESC);
CREATE INDEX IF NOT EXISTS ava_onboarding_status_idx
  ON ava_screening_onboarding_documents(status,requested_at DESC);
