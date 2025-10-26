-- ============================================================
-- Script para corrigir estrutura de chat persistente
-- ============================================================

USE linux;

-- Remover tabelas antigas de chat se existirem
DROP TABLE IF EXISTS mensagens_chat;
DROP TABLE IF EXISTS conversas;

-- Criar tabela de mensagens do chat simplificada e compatível
CREATE TABLE IF NOT EXISTS mensagens_chat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  feedback_id INT NOT NULL,
  remetente ENUM('usuario', 'admin') NOT NULL,
  mensagem TEXT NOT NULL,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lida BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE,
  INDEX idx_feedback_id (feedback_id),
  INDEX idx_remetente (remetente),
  INDEX idx_data (data)
) ENGINE=InnoDB;

-- Garantir que feedback tem status resolvido
ALTER TABLE feedback
MODIFY COLUMN status ENUM('novo', 'lido', 'respondido', 'resolvido') DEFAULT 'novo';

-- Adicionar índice em email do feedback para busca rápida
CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email);

-- Limpar mensagens órfãs se houver
DELETE FROM mensagens_chat WHERE feedback_id NOT IN (SELECT id FROM feedback);
