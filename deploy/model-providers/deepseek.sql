-- Provider: deepseek
-- Default model: deepseek-chat
-- OPENAI_BASE_URL: https://api.deepseek.com
INSERT IGNORE INTO `model_infos` (`name`, `label`, `provider`, `tier`, `enabled`, `is_default`, `context_limit`, `max_output`, `capabilities`)
VALUES
    ('deepseek-chat', 'DeepSeek Chat', 'deepseek', 't2', 1, 1, 64000, 8000, '{}'),
    ('deepseek-reasoner', 'DeepSeek Reasoner', 'deepseek', 't1', 1, 0, 64000, 8000, '{}');
