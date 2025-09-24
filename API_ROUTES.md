# API Agenda de Serviços - Documentação das Rotas

## 🔐 Autenticação
- `POST /auth/register` - Registrar usuário e empresa (RF02)
- `POST /auth/login` - Login no sistema (RF02)
- `POST /auth/forgot-password` - Solicitar recuperação de senha (RF12)
- `POST /auth/reset-password` - Resetar senha (RF12)

## 🏢 Ramos de Atividade
- `GET /activity-branches` - Listar ramos de atividade (RF03)
- `GET /activity-branches/:id` - Buscar ramo específico
- `GET /activity-branches/:id/default-services` - Serviços padrão do ramo (RF03)
- `POST /activity-branches` - Criar novo ramo
- `PUT /activity-branches/:id` - Atualizar ramo
- `DELETE /activity-branches/:id` - Excluir ramo

## ⚙️ Serviços
- `GET /services` - Listar serviços da empresa (RF04)
- `GET /services/favorites` - Listar serviços favoritos (RF04)
- `GET /services/:id` - Buscar serviço específico
- `POST /services` - Criar novo serviço (RF04)
- `POST /services/import` - Importar serviços do ramo (RF03)
- `PUT /services/:id` - Atualizar serviço (RF04)
- `PUT /services/:id/toggle-favorite` - Alternar favorito (RF04)
- `DELETE /services/:id` - Excluir serviço (RF04)

## 👥 Funcionários/Colaboradores
- `GET /employees` - Listar colaboradores (RF05)
- `GET /employees/:id` - Buscar colaborador específico
- `POST /employees` - Criar novo colaborador (RF05)
- `PATCH /employees/:id` - Atualizar colaborador (RF05)
- `DELETE /employees/:id` - Excluir colaborador (RF05)
- `GET /employees/:id/service-preferences` - Buscar preferências de serviços (RF05)
- `POST /employees/:id/service-preferences` - Definir preferências de serviços (RF05)

## 👤 Usuários
- `GET /users/:id/theme` - Obter tema do usuário (RF09)
- `PUT /users/:id/theme` - Alterar tema do usuário (RF09)

## 👤 Clientes
- `GET /clients` - Listar clientes (RF11)
- `GET /clients/report` - Relatório de clientes com filtros (RF11)
- `GET /clients/:id` - Buscar cliente específico
- `POST /clients` - Criar novo cliente
- `PUT /clients/:id` - Atualizar cliente
- `DELETE /clients/:id` - Excluir cliente

## 📅 Agendamentos
- `GET /appointments` - Listar agendamentos (RF06)
- `GET /appointments/calendar` - Visualizar calendário (RF07)
- `GET /appointments/date/:date` - Agendamentos por data específica (RF07)
- `GET /appointments/overdue` - Agendamentos em atraso (RF07)
- `GET /appointments/check-availability` - Verificar disponibilidade (RF06)
- `GET /appointments/services/by-favorites` - Serviços ordenados por favoritos (RF06)
- `GET /appointments/employees/by-service/:serviceId` - Funcionários por preferência (RF06)
- `GET /appointments/:id` - Buscar agendamento específico
- `POST /appointments` - Criar novo agendamento (RF06)
- `PATCH /appointments/:id` - Atualizar agendamento (RF06)
- `DELETE /appointments/:id` - Cancelar agendamento (RF06)

## 🏥 Atendimentos
- `GET /attendances` - Listar atendimentos (RF08)
- `GET /attendances/:id` - Buscar atendimento específico (RF08)
- `POST /attendances` - Criar atendimento a partir de agendamento (RF08)
- `PATCH /attendances/:id` - Atualizar atendimento (RF08)
- `POST /attendances/:id/complete` - Finalizar atendimento (RF08)
- `GET /attendances/:id/services` - Listar serviços do atendimento (RF08)
- `POST /attendances/:id/services` - Adicionar serviço ao atendimento (RF08)
- `DELETE /attendances/:id/services/:serviceId` - Remover serviço do atendimento (RF08)
- `POST /attendances/:id/share` - Gerar texto para compartilhamento (RF10)

## 🏢 Empresa/Usuário
- `GET /companies/share-template` - Obter template de compartilhamento (RF10)
- `PUT /companies/share-template` - Personalizar template de compartilhamento (RF10)

## 📊 Relatórios
- `GET /reports/clients` - Relatório de clientes (RF11)
- `GET /reports/services` - Relatório de serviços mais utilizados
- `GET /reports/revenue` - Relatório de faturamento

## 🔧 Utilitários
- `GET /health` - Status da API
- `GET /swagger` - Documentação interativa

## Autenticação
Todas as rotas (exceto auth) requerem Bearer Token:
```
Authorization: Bearer <jwt_token>
```

## Paginação
Rotas de listagem suportam paginação:
```
?page=1&limit=10
```

## Filtros
Diversas rotas suportam filtros específicos como datas, nomes, etc.