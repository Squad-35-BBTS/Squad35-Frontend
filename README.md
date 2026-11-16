# SGBD — Lei do Bem | Frontend

Interface web para acompanhamento de projetos de Pesquisa, Desenvolvimento e Inovação, com controle de acesso, marcos experimentais, evidências, dedicação de pessoas, dispêndios e preparação de dossiês.

Projeto acadêmico desenvolvido no contexto da residência BBTS.

> Os relatórios são materiais internos de apoio. A plataforma não realiza submissão automática ao MCTI nem certifica elegibilidade fiscal.

## Tecnologias

- React.
- TypeScript.
- Vite.
- CSS e Tailwind CSS.
- ESLint.
- Integração com API REST e autenticação JWT.

## Arquitetura

| Componente | Responsabilidade | Hospedagem |
| --- | --- | --- |
| Frontend | Interface e navegação por perfil | Vercel |
| Backend | Autenticação, autorização e regras de negócio | Render |
| PostgreSQL | Persistência dos dados | Neon |

O navegador acessa o backend por HTTPS.

O frontend não se conecta diretamente ao PostgreSQL e não deve receber credenciais do banco.

## Funcionalidades

- Login, logout e manutenção da própria conta.
- Dashboard com indicadores e acompanhamento das etapas dos projetos.
- Busca por projetos.
- Filtros por classificação, situação do dossiê e ano-base.
- Cadastro e edição de projetos conforme as permissões.
- Abertura de projetos pela tabela e navegação por teclado.
- Consulta e cadastro de marcos experimentais.
- Upload e download de evidências.
- Registro de horas e aprovação pelo gestor.
- Acompanhamento de dispêndios.
- Preparação técnica e anual do dossiê FORMP&D.
- Exportação CSV.
- Impressão para salvar em PDF.
- Consulta cadastral de CNPJ.
- Tema claro e escuro.
- Layout responsivo e ferramentas de acessibilidade.

A consulta de CNPJ apresenta informações cadastrais; ela não determina a elegibilidade à Lei do Bem.

## Perfis de acesso

| Perfil | Escopo |
| --- | --- |
| Gestor | Acesso amplo; valida registros, aprova horas, emite pareceres e fecha/reabre dossiês |
| Analista P&D | Cadastra e edita projetos e registros operacionais; prepara informações e consulta relatórios |
| Auditor | Consulta projetos, marcos, evidências e dedicação das pessoas, sem editar nem visualizar custos |
| Consultoria especializada | Consulta projetos e edita enquadramento e complementos técnicos, sem acesso financeiro |

Todos podem acessar a própria conta.

Algumas operações são compartilhadas entre perfis. As permissões também são aplicadas no backend: esconder um botão não substitui a autorização da API.

## Requisitos

- Node.js 22.12 ou superior da linha 22.x.
- npm.
- Git.
- Backend configurado para o modo integrado.

O arquivo `.node-version` indica a versão desejada, mas não instala o Node.js.

Confira a instalação:

```bash
node -v
npm -v
```

## Instalação

Clone este repositório e abra o terminal na raiz do projeto.

Instale as dependências:

```bash
npm ci
```

Mantenha o `package-lock.json` versionado para permitir uma instalação reproduzível.

### Configuração local

Crie um arquivo `.env` na raiz:

```env
VITE_API_URL=/api
VITE_DEMO_MODE=false
BACKEND_URL=http://localhost:3300
```

Essa configuração usa o proxy de desenvolvimento do Vite:

- O frontend chama caminhos iniciados por `/api`.
- O Vite encaminha as chamadas ao backend.
- O prefixo `/api` é removido antes do encaminhamento.

Inicie o backend conforme o README dele.

Depois, execute o frontend:

```bash
npm run dev
```

Endereço local:

```text
http://localhost:5173
```

### Usar um backend remoto

Configure a URL HTTPS do backend:

```env
VITE_API_URL=https://SEU_BACKEND.onrender.com
VITE_DEMO_MODE=false
```

Não acrescente `/api` quando o backend publicado expõe as rotas diretamente na raiz.

Reinicie o Vite após alterar o `.env`.

A origem do frontend também precisa estar autorizada em `CORS_ORIGINS` no backend.

## Modo demonstração

Para visualizar a interface com dados fictícios:

```env
VITE_DEMO_MODE=true
```

Características:

- Disponível apenas no desenvolvimento.
- Utiliza dados simulados.
- Permite explorar a interface.
- Bloqueia operações de gravação.

Para testar a integração real, utilize:

```env
VITE_DEMO_MODE=false
```

Entre com uma conta autorizada.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Iniciar desenvolvimento local |
| `npm run build` | Verificar TypeScript e gerar a pasta `dist` |
| `npm run lint` | Executar análise estática |
| `npm run preview` | Visualizar localmente o build gerado |

Execute antes de enviar alterações:

```bash
npm run lint
npm run build
```

O comando `preview` serve o build já gerado e não deve depender do proxy de desenvolvimento.

Para essa verificação, gere o build com a URL real do backend configurada.

## Testes funcionais

Use uma base de testes, contas autorizadas e dados fictícios.

### Analista

1. Criar um projeto com ano-base definido.
2. Editar sua descrição.
3. Cadastrar um marco experimental.
4. Anexar uma evidência fictícia.
5. Registrar horas com justificativa.
6. Registrar um dispêndio.
7. Confirmar que não pode aprovar horas ou fechar o dossiê.

### Consultoria

1. Consultar o projeto.
2. Editar o enquadramento.
3. Preencher o complemento técnico.
4. Confirmar que os dados permanecem após atualizar a página.
5. Confirmar ausência de acesso financeiro.
6. Testar o aviso de alterações não salvas no complemento técnico.

### Auditor

1. Consultar o projeto.
2. Consultar marcos e evidências.
3. Baixar uma evidência de teste.
4. Consultar dedicação das pessoas.
5. Confirmar ausência de edição e de valores financeiros.

### Gestor

1. Conferir os registros cadastrados.
2. Validar evidência e marco.
3. Aprovar horas.
4. Editar horas aprovadas e confirmar que exigem nova aprovação.
5. Conferir o dossiê e suas pendências.
6. Exportar CSV e abrir a impressão.
7. Testar fechamento e reabertura quando os requisitos estiverem atendidos.
8. Consultar os logs disponíveis.

### Conferências gerais

- Despesas de R$ 0,10 e R$ 0,20 devem totalizar R$ 0,30 em um projeto sem outras despesas.
- Uma despesa com data fora do ano-base deve ser recusada.
- Atualizar a página deve preservar os dados gravados.
- Custos de pessoal e dispêndios devem permanecer separados.
- Testar temas claro e escuro.
- Testar visualização no celular.
- Testar Tab, Shift+Tab e fechamento dos formulários com Escape.

A segurança das permissões também deve ser verificada por chamadas diretas à API: operações não autorizadas devem retornar 403.

Se a suíte automatizada estiver incluída e o script estiver configurado no `package.json`, execute:

```bash
npm test
```

Testes simulados não substituem a conferência integrada no navegador.

## Publicação na Vercel

| Configuração | Valor |
| --- | --- |
| Preset | Vite |
| Instalação | `npm ci` |
| Build | `npm run build` |
| Diretório de saída | `dist` |
| Node.js | 22.x |

Configure no painel:

```env
VITE_API_URL=https://SEU_BACKEND.onrender.com
VITE_DEMO_MODE=false
```

O `vercel.json` configura o fallback das rotas SPA para `index.html`.

Após publicar:

1. Autorize a origem exata do frontend em `CORS_ORIGINS` no backend.
2. Atualize `FRONTEND_URL` no backend.
3. Aplique as alterações do serviço.
4. Teste login e consultas pelo endereço publicado.

Alterações nas variáveis utilizadas pelo Vite exigem um novo build para aparecer no frontend publicado.

## Segurança

As variáveis `VITE_*` entram no código público gerado.

Nunca coloque nelas:

- Senhas.
- Tokens privados.
- `DATABASE_URL`.
- `DIRECT_URL`.
- `JWT_SECRET`.
- Credenciais de serviços de e-mail.

Não versione:

- `.env` e backups de configuração.
- Dumps de banco.
- Credenciais.
- Arquivos de evidência reais.
- Capturas de tela ou logs com dados sensíveis.

Um `.env.example`, quando existir, deve conter somente exemplos fictícios.

## Limitações

- Indicadores de progresso não representam aprovação fiscal.
- Relatórios são materiais de apoio ao preenchimento.
- A recuperação de senha exige configuração do provedor de e-mail.
- Serviços gratuitos podem apresentar limites e demora após inatividade.
- O ambiente acadêmico não deve ser tratado como infraestrutura com disponibilidade garantida.
