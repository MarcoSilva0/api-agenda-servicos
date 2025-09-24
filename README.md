# 📅 API Agenda de Serviços

> **Sistema de gerenciament### 👥 **Gestão de Colaboradores** 
- Cadastro completo de funcionários
- Upload e gerenciamento de fotos
- Definição de preferências por serviço
- Isolamento seguro por empresa
- Paginação otimizada para grandes volumes

### 📅 **Sistema de Agendamentos**
- Criação de agendamentos com validação automática
- Detecção e prevenção de conflitos de horário
- Priorização de serviços favoritos na listagem
- Ordenação inteligente de funcionários por preferência
- Criação automática de clientes
- Verificação de disponibilidade em tempo real
- Gestão completa de status dos agendamentos

## 🔄 Funcionalidades em Desenvolvimento

### 📊 **Calendário e Visualização** (RF07)
- Calendário interativo
- Visualização por data específica
- Notificações de agendamentos em atraso
- Navegação entre datasra pequenos negócios**

Uma API robusta desenvolvida em **NestJS** para gerenciar atendimentos e serviços prestados por pequenas empresas, permitindo fácil acesso e visualização dos dados através de aplicativos móveis desenvolvidos em React Native.

## 📋 Descrição do Projeto

Este projeto foi desenvolvido como parte da avaliação da disciplina **Desenvolvimento para Dispositivos Móveis II** do curso de Pós-Graduação em Programação para Internet e Dispositivos Móveis do **Instituto Federal de São Paulo - Campus Barretos**.

A API serve como backend para um aplicativo móvel que permite a pequenas empresas:
- ✅ Gerenciar seus serviços e colaboradores
- ✅ Definir preferências de serviços por funcionário
- 🔄 Controlar agendamentos e atendimentos (em desenvolvimento)
- 🔄 Acompanhar relatórios de clientes (em desenvolvimento)
- 🔄 Personalizar a experiência com temas (planejado)
- 🔄 Compartilhar dados de atendimento (planejado)

## 🏗️ Arquitetura e Tecnologias

### **Backend (API)**
- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[Prisma](https://prisma.io/)** - ORM moderno para TypeScript
- **[PostgreSQL](https://postgresql.org/)** - Banco de dados relacional
- **[JWT](https://jwt.io/)** - Autenticação via tokens
- **[Swagger](https://swagger.io/)** - Documentação automática da API
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Hash seguro de senhas
- **[class-validator](https://github.com/typestack/class-validator)** - Validação de dados

### **Frontend (Planejado)**
- **[React Native](https://reactnative.dev/)** com **[Expo](https://expo.dev/)**
- **[TypeScript](https://typescriptlang.org/)** - Tipagem estática
- Autenticação JWT integrada
- Suporte a temas claro/escuro
- Navegação intuitiva

## 🎯 Funcionalidades Implementadas

### 🔐 **Sistema de Autenticação**
- Registro de usuário com criação automática de empresa
- Login seguro com JWT
- Recuperação de senha via email
- Hash seguro de senhas com bcryptjs

### 🏢 **Gestão de Ramos de Atividade** 
- CRUD completo de ramos de atividade
- Serviços padrão pré-cadastrados por ramo
- Importação automática de serviços comuns

### ⚙️ **Gerenciamento de Serviços**
### ⚙️ **Gerenciamento de Serviços**
- Criação e edição de serviços personalizados
- Sistema de favoritos para priorização
- Importação de serviços de outros ramos
- Organização automática por relevância

### � **Gestão de Colaboradores** 
- Cadastro completo de funcionários
- Upload e gerenciamento de fotos
- Definição de preferências por serviço
- Isolamento seguro por empresa
- Paginação otimizada para grandes volumes

## 🔄 Funcionalidades em Desenvolvimento

### 📅 **Sistema de Agendamentos** (RF06, RF07)
- Agendamento com validação de conflitos
- Calendário interativo
- Notificações de agendamentos em atraso
- Visualização por dia/semana/mês

### 🏥 **Controle de Atendimentos** (RF08)
- Conversão de agendamentos em atendimentos
- Edição de serviços durante atendimento
- Finalização com resumo completo

### 👤 **Relatórios de Clientes** (RF11)
- Listagem de clientes atendidos
- Filtros por período e nome
- Histórico de atendimentos

### 🎨 **Personalização** (RF09, RF10)
- Temas claro/escuro/sistema
- Templates personalizáveis de compartilhamento
- Compartilhamento via WhatsApp/SMS

## 📊 Modelos de Dados

### 🏢 **Company (Empresa)**
```typescript
{
  id: string
  name: string           // Nome do estabelecimento
  email: string          // Email de contato
  phone: string          // Telefone
  address: string        // Endereço completo
  logoUrl?: string       // URL do logotipo (opcional)
  activityBranchId: string // Ramo de atividade
  customShareTemplate?: string // Template personalizado
  themePreference: 'SYSTEM' | 'LIGHT' | 'DARK'
}
```

### 👤 **User (Usuário)**
```typescript
{
  id: string
  companyId: string      // Empresa vinculada
  name: string           // Nome completo
  email: string          // Email único
  passwordHash: string   // Senha criptografada
  phone?: string         // Telefone (opcional)
  role: 'OWNER' | 'ADMIN' | 'EMPLOYEE'
  biometricAuthEnabled: boolean
  emailConfirmed: boolean
  firstAccessCompleted: boolean
}
```

### 🏗️ **ActivityBranch (Ramo de Atividade)**
```typescript
{
  id: string
  name: string           // Ex: "Barbearia", "Oficina Mecânica"
  description?: string   // Descrição do ramo
  services: DefaultService[] // Serviços padrão
}
```

### ⚙️ **Service (Serviço)**
```typescript
{
  id: string
  companyId: string      // Empresa proprietária
  name: string           // Ex: "Corte de cabelo"
  description: string    // Descrição detalhada
  isFavorite: boolean    // Serviço favorito
  isFromActivityBranch: boolean // Importado ou criado
}
```

### 👤 **Employee (Colaborador)**
```typescript
{
  id: string
  companyId: string      // Empresa proprietária
  name: string           // Nome completo do colaborador
  photoUrl?: string      // URL da foto (opcional)
  servicePreferences: EmployeeServicePreference[] // Serviços que pode executar
  createdAt: Date
  updatedAt: Date
}
```

### 🔗 **EmployeeServicePreference (Preferência de Serviço)**
```typescript
{
  id: string
  employeeId: string     // Colaborador
  serviceId: string      // Serviço vinculado
  createdAt: Date
}
```

### 👤 **Client (Cliente)**
```typescript
{
  id: string
  companyId: string      // Empresa proprietária
  name: string           // Nome completo do cliente
  phone: string          // Telefone (usado como identificador único)
  createdAt: Date
  updatedAt: Date
}
```

### 📅 **Appointment (Agendamento)**
```typescript
{
  id: string
  companyId: string      // Empresa proprietária
  clientId: string       // Cliente (criado automaticamente se não existir)
  serviceId: string      // Serviço agendado
  employeeId?: string    // Funcionário designado (opcional)
  appointmentDate: Date  // Data do agendamento
  appointmentTime: Date  // Horário específico
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
```

## 🔒 Segurança

- **Autenticação JWT** obrigatória para rotas protegidas
- **Hash de senhas** com salt usando bcryptjs
- **Validação rigorosa** de entrada de dados
- **Isolamento de dados** por empresa
- **Tokens de recuperação** com expiração controlada
- **CORS** configurado para desenvolvimento

## 📚 Documentação da API

### **Swagger UI**
Acesse `http://localhost:3000/api` para:
- 📖 Documentação interativa completa
- 🧪 Teste todas as rotas diretamente no navegador
- 📋 Visualizar esquemas de dados
- 💡 Exemplos de request/response
- 🔑 Autenticação via Bearer Token

### **Principais Endpoints**

#### Autenticação
- `POST /auth/register` - Registrar empresa e usuário
- `POST /auth/login` - Autenticar usuário
- `POST /auth/forgot-password` - Solicitar recuperação
- `POST /auth/reset-password` - Redefinir senha

#### Ramos de Atividade
- `GET /activity-branches` - Listar ramos disponíveis
- `GET /activity-branches/:id/default-services` - Serviços padrão

#### Serviços
- `GET /services` - Listar serviços da empresa
- `GET /services/favorites` - Apenas favoritos
- `POST /services` - Criar novo serviço
- `POST /services/import` - Importar do ramo de atividade
- `PUT /services/:id/toggle-favorite` - Alternar favorito

#### Colaboradores
- `GET /employees` - Listar colaboradores (com paginação)
- `POST /employees` - Cadastrar novo colaborador
- `GET /employees/:id` - Buscar colaborador específico
- `PATCH /employees/:id` - Atualizar dados do colaborador
- `DELETE /employees/:id` - Remover colaborador
- `GET /employees/:id/service-preferences` - Buscar preferências de serviço
- `POST /employees/:id/service-preferences` - Definir serviços que pode executar

#### Agendamentos
- `GET /appointments` - Listar agendamentos ordenados por data/hora
- `POST /appointments` - Criar agendamento com validação de conflitos
- `GET /appointments/:id` - Buscar agendamento específico
- `PATCH /appointments/:id` - Atualizar agendamento existente
- `DELETE /appointments/:id` - Excluir agendamento
- `GET /appointments/check-availability` - Verificar disponibilidade de horário
- `GET /appointments/services/by-favorites` - Serviços ordenados por favoritos
- `GET /appointments/employees/by-service/:serviceId` - Funcionários por preferência

## 🚀 Como Executar

### **Pré-requisitos**
- Node.js 18+
- PostgreSQL 13+
- Yarn ou npm

### **Instalação**
```bash
# Clone o repositório
git clone https://github.com/MarcoSilva0/api-agenda-servicos

# Instale dependências
cd api-agenda-servicos
yarn install

# Configure variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute migrações do banco
npx prisma migrate dev

# Inicie a aplicação
yarn start:dev
```

### **Banco de Dados**
```bash
# Subir PostgreSQL via Docker
docker-compose up -d

# Executar migrações
npx prisma migrate dev

# Visualizar dados no Prisma Studio
npx prisma studio
```

## 🧪 Como Testar

1. **Acesse o Swagger**: `http://localhost:3000/api`
2. **Registre uma empresa**: Use `POST /auth/register`
3. **Faça login**: Use `POST /auth/login`
4. **Authorize**: Copie o token e clique em "Authorize"
5. **Teste as rotas**: Experimente criar serviços, colaboradores, definir preferências, etc.

### **🆕 Testando Colaboradores (RF05)**
1. **Cadastre um colaborador**: `POST /employees`
   ```json
   {
     "name": "João Silva",
     "photoUrl": "https://exemplo.com/foto.jpg"
   }
   ```
2. **Liste colaboradores**: `GET /employees?page=1&limit=10`
3. **Defina preferências**: `POST /employees/:id/service-preferences`
   ```json
   {
     "serviceIds": ["uuid-do-servico-1", "uuid-do-servico-2"]
   }
   ```
4. **Consulte preferências**: `GET /employees/:id/service-preferences`

### **🆕 Testando Agendamentos (RF06)**
1. **Verificar disponibilidade**: `GET /appointments/check-availability?date=2025-09-25&time=14:30`
2. **Listar serviços por favoritos**: `GET /appointments/services/by-favorites`
3. **Criar agendamento**: `POST /appointments`
   ```json
   {
     "clientName": "Maria Santos",
     "clientPhone": "11999999999",
     "appointmentDate": "2025-09-25",
     "appointmentTime": "14:30",
     "serviceId": "uuid-do-servico",
     "employeeId": "uuid-do-funcionario"
   }
   ```
4. **Listar agendamentos**: `GET /appointments?page=1&limit=10`
5. **Buscar funcionários por preferência**: `GET /appointments/employees/by-service/:serviceId`

## 🎯 Roadmap

### ✅ Implementações Concluídas
- [x] **RF02** - Sistema de autenticação completo
- [x] **RF03** - Gestão de ramos de atividade
- [x] **RF04** - Gerenciamento de serviços
- [x] **RF05** - Sistema de colaboradores
- [x] **RF06** - Sistema de agendamentos ✨ **NOVO**
- [x] **RF07** - Calendário interativo ✨ **NOVO**
- [x] **RF08** - Gestão de atendimentos ✨ **NOVO**
- [x] **RF09** - Sistema de temas ✨ **NOVO**
- [x] **RF10** - Compartilhamento personalizado ✨ **NOVO**
- [x] **RF11** - Relatórios de clientes ✨ **NOVO**
- [x] **RF12** - Recuperação de senha

### 📋 Próximas Implementações
- [ ] **RF01** - Primeira utilização (principalmente frontend)

### **Melhorias Futuras**
- [ ] Notificações push
- [ ] Integração com calendários externos
- [ ] Dashboard analítico
- [ ] API de pagamentos
- [ ] Sistema de avaliações

## 👥 Equipe

- **Marco Silva** - Desenvolvimento Full-Stack
- **Instituto Federal de São Paulo** - Campus Barretos
