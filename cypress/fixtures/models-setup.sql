INSERT IGNORE INTO `model_infos`
  (`name`, `label`, `provider`, `tier`, `created_at`, `enabled`, `updated_at`, `context_limit`, `max_output`, `capabilities`)
VALUES
  ('openai/gpt-4o-mini', 'GPT-4o Mini', 'openai', 't2', now(), 1, now(), 128000, 16384, '{"functionCall":true,"vision":true}'),
  ('google/gemini-flash-1.5', 'Gemini Flash 1.5', 'google', 't2', now(), 1, now(), 1000000, 8192, '{"vision":true}'),
  ('openai/gpt-4o', 'GPT-4o', 'openai', 't1', now(), 1, now(), 128000, 16384, '{"vision":true}'),
  ('anthropic/claude-3.5-sonnet', 'Claude 3.5 Sonnet', 'anthropic', 't1', now(), 1, now(), 200000, 8192, '{"vision":true}');
