-- TEN-004: In-App Notification Infrastructure
CREATE TABLE notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID        NOT NULL REFERENCES tenants(id),
  user_id    UUID        NOT NULL REFERENCES auth.users(id),
  type       TEXT        NOT NULL,
  -- correction_filed | correction_approved | correction_rejected
  -- ot_filed | ot_approved | ot_rejected
  -- leave_filed | leave_approved | leave_rejected
  -- payroll_generated | payroll_finalized | payroll_release_reminder
  -- account_invited | password_changed | 13th_month_reminder
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  payload    JSONB,
  -- { entity_type, entity_id, action_url } for deep-linking from notification center
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at);
CREATE INDEX idx_notifications_tenant      ON notifications(tenant_id);

-- Enable Realtime for live in-app notification pushes (TEN-004)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
