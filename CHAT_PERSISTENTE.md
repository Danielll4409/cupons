# Sistema de Chat Persistente - Documentação

## Resumo das Alterações

O sistema de chat foi reformulado para manter o histórico de conversas e não resetar quando a página é recarregada. O chat agora só fecha quando o admin marca o feedback como "resolvido".

## Arquivos Criados

### 1. `scripts/06-fix-chat-structure.sql`
Script SQL para corrigir a estrutura das tabelas de chat:
- Remove tabelas antigas incompatíveis
- Cria tabela `mensagens_chat` simplificada com campos:
  - `feedback_id` (FK para feedback)
  - `remetente` (ENUM: 'usuario', 'admin')
  - `mensagem` (TEXT)
  - `data` (TIMESTAMP)
  - `lida` (BOOLEAN)

### 2. `components/contact-form-persistent.tsx`
Novo componente de formulário de contato com persistência:
- Verifica se existe feedback ativo no localStorage
- Busca feedback existente ao carregar a página
- Mantém referência ao `feedback_id` e `email` do usuário
- Mostra status da conversa (novo, lido, respondido)
- Permite enviar nova mensagem ou continuar conversa existente
- Integra com componente de chat persistente

### 3. `components/chat-persistent.tsx`
Componente de chat melhorado:
- Scroll automático corrigido (apenas no container de mensagens)
- Identifica corretamente o papel do usuário (admin ou usuario)
- Carrega mensagens anteriores ao abrir
- Socket.IO para mensagens em tempo real
- Fecha automaticamente quando feedback é marcado como "resolvido"
- Remove dados do localStorage ao resolver

### 4. `app/api/feedback/[id]/route.ts`
Rota API atualizada com:
- **GET**: Buscar feedback individual por ID
- **PATCH**: Atualizar status do feedback (requer admin)
  - Emite evento Socket.IO quando marcado como "resolvido"
- **DELETE**: Deletar feedback (requer admin)

## Arquivos Atualizados

### `app/contato/page.tsx`
- Substituído `ContactFormRealtime` por `ContactFormPersistent`

## Como Funciona

### Fluxo do Usuário

1. **Primeira visita:**
   - Usuário preenche formulário de contato
   - Sistema cria feedback e mensagem inicial
   - Salva `feedback_id` e `email` no localStorage
   - Abre chat flutuante automaticamente

2. **Retorno à página:**
   - Sistema busca `feedback_id` do localStorage
   - Verifica se feedback ainda está ativo (não resolvido)
   - Carrega histórico de mensagens
   - Usuário pode continuar a conversa de onde parou

3. **Durante a conversa:**
   - Mensagens aparecem em tempo real via Socket.IO
   - Scroll desce automaticamente ao receber/enviar mensagem
   - Remetente identificado corretamente (admin/usuario)

4. **Finalização:**
   - Admin marca feedback como "resolvido"
   - Chat fecha automaticamente
   - localStorage é limpo
   - Usuário pode enviar novo feedback

### Fluxo do Admin

1. Admin acessa painel de feedback (`/admin/feedback`)
2. Visualiza lista de feedbacks com status
3. Pode marcar como:
   - **lido**: Visualizou mas ainda não respondeu
   - **respondido**: Enviou resposta ao usuário
   - **resolvido**: Conversa finalizada (fecha o chat)

## Banco de Dados

### Executar Migration

```bash
mysql -u root -p linux < scripts/06-fix-chat-structure.sql
```

### Estrutura Final

```sql
-- Tabela feedback (já existente)
CREATE TABLE feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(50),
  assunto VARCHAR(255),
  mensagem TEXT,
  status ENUM('novo', 'lido', 'respondido', 'resolvido'),
  criado_em TIMESTAMP,
  atualizado_em TIMESTAMP
);

-- Tabela mensagens_chat (nova estrutura)
CREATE TABLE mensagens_chat (
  id INT PRIMARY KEY AUTO_INCREMENT,
  feedback_id INT,
  remetente ENUM('usuario', 'admin'),
  mensagem TEXT,
  data TIMESTAMP,
  lida BOOLEAN,
  FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE
);
```

## Autenticação JWT

O sistema usa JWT para autenticação:
- Token armazenado em cookie httpOnly
- Campo `papel` identifica se é admin ou usuario
- Todas as rotas protegidas verificam papel no banco

### Variável de Ambiente Necessária

```env
JWT_SECRET=811fe075757e7d30f342ac37a293ff8b2948bb61fb7295c8db8019f1e5be08ee
```

## Socket.IO

### Eventos

**Cliente → Servidor:**
- `join_feedback` - Entrar em sala do feedback
- `leave_feedback` - Sair da sala

**Servidor → Cliente:**
- `nova_mensagem` - Nova mensagem recebida
- `feedback_resolvido` - Feedback marcado como resolvido

### Configuração

Socket.IO configurado em `server.js`:
```javascript
io.on('connection', (socket) => {
  socket.on('join_feedback', (feedbackId) => {
    socket.join(`feedback_${feedbackId}`)
  })

  socket.on('leave_feedback', (feedbackId) => {
    socket.leave(`feedback_${feedbackId}`)
  })
})
```

## Testes

### Teste de Persistência

1. Acesse `/contato`
2. Envie uma mensagem
3. Aguarde resposta do admin
4. **Recarregue a página** (F5)
5. ✅ Chat deve reabrir com histórico completo

### Teste de Finalização

1. Admin marca feedback como "resolvido"
2. ✅ Chat fecha automaticamente
3. ✅ localStorage é limpo
4. ✅ Usuário pode enviar novo feedback

### Teste de Scroll

1. Envie várias mensagens
2. ✅ Scroll deve estar sempre no final
3. ✅ Apenas container de mensagens rola (não a página inteira)

## Próximos Passos

- Adicionar notificações de desktop
- Implementar indicador "digitando..."
- Adicionar suporte a anexos/imagens
- Sistema de notificações por email quando admin responde
