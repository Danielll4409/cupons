-- =====================================================
-- Script 05: Migração para Chat em Tempo Real por Feedback
-- =====================================================
-- Este script transforma o sistema de chat único em um
-- sistema bidirecional onde cada feedback.id tem seu próprio chat
--
-- IMPORTANTE: Execute este script APÓS os scripts 01, 02 e 03
--
-- Estrutura Final:
-- - Cada feedback tem múltiplas mensagens (1:N)
-- - Mensagens identificam se são do usuário ou admin
-- - Histórico completo persistido no MySQL
-- - Suporte a Socket.IO com salas dinâmicas (feedback_X)
-- =====================================================

USE linux;

-- =====================================================
-- PASSO 1: Garantir que a tabela feedback existe
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  assunto VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  status ENUM('novo', 'lido', 'respondido', 'resolvido') DEFAULT 'novo',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_email (email),
  INDEX idx_criado_em (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PASSO 2: Remover tabela conversas (não será mais usada)
-- =====================================================
DROP TABLE IF EXISTS conversas;

-- =====================================================
-- PASSO 3: Recriar tabela mensagens_chat com estrutura correta
-- =====================================================
DROP TABLE IF EXISTS mensagens_chat;

CREATE TABLE mensagens_chat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  feedback_id INT NOT NULL,
  remetente ENUM('usuario', 'admin') NOT NULL,
  mensagem TEXT NOT NULL,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lida BOOLEAN DEFAULT FALSE,

  -- Foreign Key para garantir integridade
  FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE,

  -- Índices para performance
  INDEX idx_feedback_id (feedback_id),
  INDEX idx_remetente (remetente),
  INDEX idx_data (data),
  INDEX idx_lida (lida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PASSO 4: Verificar estrutura criada
-- =====================================================
SELECT
  'Tabelas criadas/atualizadas com sucesso!' AS status,
  'feedback' AS tabela_1,
  'mensagens_chat' AS tabela_2;

-- =====================================================
-- PASSO 5: Exibir estrutura final
-- =====================================================
SHOW COLUMNS FROM mensagens_chat;
SHOW COLUMNS FROM feedback;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no MySQL
-- 2. Atualize server.js para suportar salas dinâmicas
-- 3. Crie a rota /api/chat/feedback/[feedbackId]/route.ts
-- 4. Implemente o componente Chat.tsx
-- =====================================================
