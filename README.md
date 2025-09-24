# 📅 API Agenda de Serviços

> **Sistema de gerenciamento de agenda para pequenos negócios**

Uma API robusta desenvolvida em **NestJS** para gerenciar atendimentos e serviços prestados por pequenas empresas, permitindo fácil acesso e visualização dos dados através de aplicativos móveis desenvolvidos em React Native.

## 📋 Descrição do Projeto

Este projeto foi desenvolvido como parte da avaliação da disciplina **Desenvolvimento para Dispositivos Móveis II** do curso de Pós-Graduação em Programação para Internet e Dispositivos Móveis do **Instituto Federal de São Paulo - Campus Barretos**.

A API serve como backend para um aplicativo móvel que permite a pequenas empresas:
- ✅ Gerenciar seus serviços e colaboradores
- ✅ Controlar agendamentos e atendimentos
- ✅ Acompanhar relatórios de clientes
- ✅ Personalizar a experiência com temas
- ✅ Compartilhar dados de atendimento

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
- Criação e edição de serviços personalizados
- Sistema de favoritos para priorização
- Importação de serviços de outros ramos
- Organização automática por relevância

## 🔄 Funcionalidades em Desenvolvimento

### 👥 **Colaboradores** (RF05)
- Cadastro de funcionários
- Gestão de preferências por serviço
- Upload de fotos dos colaboradores

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
5. **Teste as rotas**: Experimente criar serviços, importar do ramo, etc.

## 🎯 Roadmap

### **Próximas Implementações**
- [ ] **RF05** - Sistema de colaboradores
- [ ] **RF06** - Criação de agendamentos  
- [ ] **RF07** - Calendário interativo
- [ ] **RF08** - Gestão de atendimentos
- [ ] **RF09** - Sistema de temas
- [ ] **RF10** - Compartilhamento personalizado
- [ ] **RF11** - Relatórios avançados

### **Melhorias Futuras**
- [ ] Notificações push
- [ ] Integração com calendários externos
- [ ] Dashboard analítico
- [ ] API de pagamentos
- [ ] Sistema de avaliações

## 👥 Equipe

- **Marco Silva** - Desenvolvimento Full-Stack
- **Instituto Federal de São Paulo** - Campus Barretos
