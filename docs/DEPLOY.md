# Deploy: homologação e passagem para produção

Registro atualizado em **19/11/2026**. Este documento descreve o que foi feito e o roteiro para a próxima implantação. Os passos de produção ainda não foram executados.

## 1. Contas e ambientes

**Confirmado pelo responsável:** a homologação está na Vercel pessoal e no Sanity pessoal. Após a aprovação, será feito **outro deploy, na conta Vercel do cliente**, com o **projeto Sanity na conta/organização do cliente**. Não é apenas uma troca de domínio no projeto pessoal.

| Item | Homologação atual | Produção futura |
|---|---|---|
| Vercel | Conta pessoal | Conta/equipe do cliente; novo projeto |
| Site | https://prime.magui.studio | Domínio do cliente, a confirmar |
| Domínio previsto no código | Não se aplica ao endereço atual | `https://prime.piramideimoveissjc.com.br`; confirmar antes de usar |
| Sanity | Projeto pessoal `fc83c82x` | Novo projeto do cliente; ID a preencher |
| Dataset | `production` | `production` no projeto do cliente, salvo decisão diferente |
| Studio | https://piramide-prime.sanity.studio/ | Novo endereço disponível, vinculado ao projeto do cliente |
| Studio antigo | https://piramide-prime-homolog.sanity.studio/ também segue publicado | Não utilizar como destino de produção |
| Repositório | https://github.com/MAGUI-studio/Piramide-Imoveis-PRIME | Mesmo repositório, se o cliente autorizar a integração, ou cópia na organização dele |
| Branch publicada | `main` | Definir branch de produção no novo projeto |

O nome `production` do dataset atual **não significa que o ambiente esteja na conta do cliente**. Os dois endereços atuais do Studio acessam o mesmo conteúdo pessoal. Publicações dos testadores alteram esse conteúdo.

O ambiente `Production` da Vercel também é uma classificação interna: o deploy principal do projeto pessoal continua sendo homologação para o negócio.

## 2. Estrutura e ferramentas

- Raiz: workspace pnpm, `pnpm-lock.yaml` e `packageManager: pnpm@11.25.0`.
- `web`: aplicação Next.js, hospedada na Vercel.
- `studio-pirâmide-prime`: Sanity Studio independente, publicado pelo Sanity CLI.
- O banco de conteúdo e os arquivos ficam no Sanity; publicar o site ou o Studio não copia o dataset.
- Conteúdo publicado usa API CDN do Sanity e cache de dados Next.js com revalidação de 60 segundos. A prévia consulta a API sem cache; ainda não há webhook de revalidação. Ver seção 12.
- O projeto declara Node `>=22`; o README pede 22.12 ou superior. Node 22.x foi a recomendação inicial; o painel da Vercel mostrou 26.x. A versão final efetivamente utilizada na homologação não foi registrada. Conferir o painel antes de repetir em produção e validar o build na versão escolhida.
- Não trocar a versão do pnpm apenas para fazer o deploy: usar a versão fixada no repositório pelo Corepack.

## 3. Como a homologação foi publicada

### Site na Vercel pessoal

Importação do repositório com estas configurações:

| Campo | Configuração |
|---|---|
| Framework | Next.js |
| Root Directory | `web` |
| Arquivos externos à Root Directory | Incluir no build, pois o workspace e o lockfile ficam na raiz |
| Install Command | `corepack pnpm install --frozen-lockfile` |
| Build Command | `corepack pnpm build` |
| Output Directory | Padrão do Next.js |
| Integração Git | Push na branch configurada dispara deploy automático |

Variáveis no **projeto web** da Vercel, nos ambientes que serão publicados:

```dotenv
ENABLE_EXPERIMENTAL_COREPACK=1
SANITY_PROJECT_ID=fc83c82x
SANITY_DATASET=production
SANITY_API_READ_TOKEN=<TOKEN_DE_LEITURA_DO_PROJETO_PESSOAL>
NEXT_PUBLIC_SITE_URL=https://prime.magui.studio
NEXT_PUBLIC_GA_ID=<ID_GA4_SE_FOR_USAR>
```

O domínio `prime.magui.studio` foi adicionado pelo responsável à Vercel. Após mudar variáveis, foi feito redeploy. O token de leitura precisa permitir os rascunhos para a prévia editorial; em dataset privado, também é necessário para as consultas do servidor.

`SANITY_STUDIO_PREVIEW_URL` pertence ao **build do Studio**. Colocá-la somente na Vercel do site não muda o Studio hospedado no Sanity.

### Studio no Sanity pessoal

Arquivo local `studio-pirâmide-prime/.env.local` utilizado:

```dotenv
SANITY_STUDIO_PROJECT_ID=fc83c82x
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_PREVIEW_URL=https://prime.magui.studio/
```

Comandos, a partir da raiz do repositório:

```powershell
pnpm --filter studio run deploy
```

A CLI utilizou uma sessão já autenticada. O primeiro endereço escolhido foi `piramide-prime-homolog.sanity.studio`. Depois foi criado e publicado `piramide-prime.sanity.studio`, preservando o anterior.

O novo endereço reutilizou o build já validado com:

```powershell
pnpm --filter studio run deploy --no-build
```

Esse comando foi usado **somente porque o build anterior já tinha o projeto e a URL de prévia corretos**. Para produção, gerar um build novo: não reutilizar `dist` da homologação.

Configuração atual de `studio-pirâmide-prime/sanity.cli.ts`:

```typescript
studioHost: 'piramide-prime',
deployment: {appId: 't8f1e45nc49p5afqp44id8pk'},
```

O app antigo tem ID `cxu7kfqvhrfd3lf49pugbxka`. IDs de app não são tokens, mas identificam destinos de deploy específicos. Nenhum deles deve ser reutilizado no novo projeto do cliente.

### CORS e membros

Foram adicionadas estas origens com credenciais no Sanity pessoal:

- `https://prime.magui.studio`
- `https://piramide-prime-homolog.sanity.studio`
- `https://piramide-prime.sanity.studio`

`http://localhost:3333` já existia. Antes de depurar a prévia local, conferir também a origem `http://localhost:3000`.

Exemplo do comando executado:

```powershell
pnpm --filter studio exec sanity cors add https://piramide-prime.sanity.studio --credentials --yes
pnpm --filter studio exec sanity cors list
```

Para acesso editorial: Sanity Manage → projeto → Members → Invite project member → e-mail → **Editor**. O convidado aceita o convite e entra no Studio com a conta que o aceitou. Não precisa ser membro da Vercel para editar conteúdo.

## 4. Erros encontrados e solução

| Sintoma | Diagnóstico e solução |
|---|---|
| `NEXT_NO_VERSION` / Next.js não detectado | Build estava na raiz, cujo `package.json` não contém Next.js. Usar Root Directory `web`; não instalar Next.js artificialmente na raiz. |
| Lockfile incompatível, `ERR_INVALID_THIS`, `Value of this must be of type URLSearchParams` | Override `pnpm install` selecionava um pnpm antigo. Habilitar Corepack e usar os comandos da tabela acima. Não apagar o lockfile para contornar o problema. |
| `ERR_PNPM_INVALID_DEPLOY_TARGET` ao executar `pnpm --filter studio deploy` | `deploy` também é comando interno do pnpm. Usar explicitamente **`pnpm --filter studio run deploy`**. |
| Erro de permissão ao executar CLI pelo ambiente restrito do agente | Foi necessário executar com acesso à sessão local do Sanity, ao store do pnpm e à rede. Isso não é uma configuração adicional exigida no servidor de produção. |
| Turbopack local falha ao processar CSS do Leaflet/iniciar subprocesso | O build completo foi validado com `pnpm --filter web exec next build --webpack`. O comando padrão do projeto continua `next build`; não foi alterado para Webpack. |
| WhatsApp sem imagem na home e no condomínio | HTML público foi consultado com agentes WhatsApp e Facebook: tags no `<head>` e imagens HTTP 200. Cache foi a hipótese principal, não uma causa comprovada. A arte padrão foi reduzida de aproximadamente 1,14 MB em PNG para 94 KB em JPEG. |

Foi encontrado um `web/package-lock.json` junto do lockfile pnpm; a revisão local o removeu para manter um único gerenciador. Não executar `npm install` dentro de `web`.

## 5. Compartilhamento, Analytics e indexação

Prioridade das imagens em Open Graph e Twitter:

1. `seo.socialImage` cadastrado e publicado no Sanity.
2. Capa do imóvel ou condomínio nas respectivas fichas.
3. `/utils/SEO/og-image.jpg` para fallback; home e páginas gerais usam essa arte quando não possuem imagem de SEO.

O PNG original foi preservado em `web/public/utils/SEO/og-image.png`. O JPEG tem 1200 × 630 pixels. Ao alterar a arte, atualizar também o JPEG. Imagens sociais do Sanity são solicitadas em JPEG, com 1200 × 630.

O Google Analytics é ativado por `NEXT_PUBLIC_GA_ID=G-...`, definido no build. Na revisão local, passou a carregar somente após o aceite de cookies, inclusive salvo de visitas anteriores; não carrega no modo de prévia editorial. Manter o aviso de cookies preenchido no Sanity para que novos visitantes possam aceitar. Conferir navegação entre páginas no DebugView/Tempo real e a medição otimizada de mudanças de página no fluxo GA4.

**Indexação:** o código bloqueia páginas em modo editorial e deploys `VERCEL_ENV=preview`, mas o projeto pessoal publicado como `Production` não recebe bloqueio automático por ser homologação. Ainda falta definir/aplicar a estratégia de `noindex` para homologação. Não bloquear produção ao copiar futuras configurações de homologação. `robots.txt` bloqueia `/api/`, não o site inteiro.

Para depuração de compartilhamento: https://developers.facebook.com/tools/debug/ → URL → Debug → Scrape Again. Isso atualiza a coleta do Facebook; não garante limpeza imediata do cache do WhatsApp. Um parâmetro novo na URL pode ajudar a testar uma coleta nova.

## 6. Preparação para produção na conta do cliente

Preencher antes da implantação:

- [ ] Conta/equipe Vercel do cliente e acesso para criar o projeto.
- [ ] Acesso da integração Vercel ao repositório escolhido e branch de produção.
- [ ] Organização/projeto Sanity do cliente; novo project ID e dataset.
- [ ] Conta com permissões de exportação na origem e importação/deploy no destino.
- [ ] Novo token de leitura do Sanity do cliente, com acesso necessário a rascunhos.
- [ ] Domínio definitivo aprovado e acesso ao DNS.
- [ ] Novo endereço do Studio e disponibilidade do hostname.
- [ ] ID GA4 do cliente, usuários editores e responsáveis pela aprovação.
- [ ] Lista de conteúdo de demonstração a remover ou substituir antes da entrega.

Criar **outro projeto na Vercel do cliente**, mantendo o projeto pessoal de homologação. O repositório pode continuar na MAGUI se isso for acordado; a integração precisa receber acesso explícito a ele.

O endereço `piramide-prime.sanity.studio` já está ocupado pelo app pessoal. Escolher um novo hostname disponível para o cliente ou planejar separadamente uma liberação/migração do nome. Não presumir que ele acompanha a cópia do dataset.

## 7. Migração do conteúdo Sanity

Fazer a migração após a aprovação, com uma janela sem edição/publicação na origem. Exportar novamente no corte final caso tenha havido alterações depois da primeira cópia.

Os comandos abaixo usam a **CLI instalada neste repositório** (`sanity dataset`, singular). Confirmamos suas opções pelo `--help`; documentação de CLIs mais novas pode usar `datasets` e opções diferentes.

### 7.1 Exportar a origem

Em um terminal PowerShell na raiz, definir explicitamente a origem para não depender dos fallbacks:

```powershell
$env:SANITY_STUDIO_PROJECT_ID = 'fc83c82x'
$env:SANITY_STUDIO_DATASET = 'production'
New-Item -ItemType Directory -Force -Path '.sanity-backups'
pnpm --filter studio exec sanity dataset export production ../.sanity-backups/homologacao-aprovada.tar.gz
```

Não usar `--no-assets`, `--no-drafts` ou `--raw` para esta cópia completa. O export inclui rascunhos e arquivos por padrão. Conferir avisos: nesta versão, arquivos com HTTP 401/403/404 podem ser ignorados; um arquivo exportado não prova que todos os assets foram incluídos. Guardar uma cópia segura fora do Git.

### 7.2 Importar em um dataset vazio do cliente

Criar o projeto/dataset do cliente no Sanity Manage. Em outro terminal PowerShell na raiz, substituir o placeholder pelo ID real:

```powershell
$env:SANITY_STUDIO_PROJECT_ID = '<PROJECT_ID_DO_CLIENTE>'
$env:SANITY_STUDIO_DATASET = 'production'
pnpm --filter studio exec sanity dataset import ../.sanity-backups/homologacao-aprovada.tar.gz production
```

Essas variáveis valem para a sessão do terminal e prevalecem sobre valores locais; fechar o terminal ao terminar ou restaurar os valores antes de voltar a operar a homologação.

Não usar `--replace` por padrão. Se o destino já contiver documentos, parar e decidir como conciliar, com backup do destino. Não ignorar falhas de assets para concluir a migração artificialmente.

Preservar os IDs dos documentos, slugs, relacionamentos, imagens, vídeos, recortes, descrições e as versões já marcadas com marca d’água. Conferir os arquivos no novo projeto, sem depender do CDN pessoal. Não rodar scripts de demonstração, seeds, migrações legadas ou reaplicação de marca d’água indiscriminadamente sobre o conteúdo aprovado.

## 8. Publicar o Studio do cliente

1. Preparar `studio-pirâmide-prime/.env.local` para o destino, sem versionar o arquivo:

```dotenv
SANITY_STUDIO_PROJECT_ID=<PROJECT_ID_DO_CLIENTE>
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_PREVIEW_URL=https://<DOMINIO_DEFINITIVO>
```

2. Atualizar **ambos** `sanity.cli.ts` e `sanity.config.ts`: remover/substituir o fallback pessoal `fc83c82x`. Conferir o dataset desejado.
3. Em `sanity.cli.ts`, remover o `deployment.appId` pessoal e trocar `studioHost` por um hostname disponível do cliente. Se executar com o appId atual, a CLI pode tentar operar o app pessoal.
4. Entrar com a conta autorizada, confirmar projeto e rodar um deploy com build novo:

```powershell
pnpm --filter studio exec sanity login
pnpm --filter studio run deploy
```

5. Salvar o **novo** `deployment.appId` retornado pela CLI na configuração destinada ao cliente.
6. Adicionar no CORS do **Sanity do cliente**, com credenciais, o domínio do site e o novo domínio do Studio. Adicionar localhost apenas se necessário ao desenvolvimento. Não copiar todas as origens pessoais sem necessidade.
7. Convidar os editores no projeto do cliente; convites do projeto pessoal não migram com o dataset.

Se for necessário publicar os dois Studios futuramente a partir do mesmo código, separar explicitamente a configuração de deploy por ambiente antes de alternar destinos. Uma configuração versionada com um único appId não representa dois destinos diferentes.

## 9. Publicar o site na Vercel do cliente

Criar o novo projeto com as configurações da seção 3 e estas variáveis próprias:

```dotenv
ENABLE_EXPERIMENTAL_COREPACK=1
SANITY_PROJECT_ID=<PROJECT_ID_DO_CLIENTE>
SANITY_DATASET=production
SANITY_API_READ_TOKEN=<NOVO_TOKEN_DO_SANITY_DO_CLIENTE>
NEXT_PUBLIC_SITE_URL=https://<DOMINIO_DEFINITIVO>
NEXT_PUBLIC_GA_ID=<ID_GA4_DO_CLIENTE>
```

Não copiar o token pessoal. `SANITY_API_READ_TOKEN` é exclusivo do servidor: nunca usar prefixos `NEXT_PUBLIC_` ou `SANITY_STUDIO_` nele. Variáveis públicas e `SANITY_STUDIO_*` entram nos bundles; não colocar segredos nelas. Os `.env.local` já estão ignorados no Git.

Configurar variáveis nos ambientes necessários do novo projeto. Um Preview da Vercel apontando ao Sanity do cliente também lê conteúdo daquele projeto: isso não cria isolamento de dados. Para prévias isoladas, planejar um dataset/projeto separado e um Studio que o utilize.

Validar primeiro o endereço temporário da nova Vercel e depois:

1. Adicionar o domínio definitivo ao projeto do cliente.
2. Aplicar no DNS os registros **exatos apresentados pela Vercel naquele momento**, sem adivinhar IP/CNAME e preservando registros de e-mail.
3. Aguardar a validação do domínio e HTTPS.
4. Confirmar `NEXT_PUBLIC_SITE_URL` definitivo e fazer novo deploy se foi alterado.
5. Confirmar `SANITY_STUDIO_PREVIEW_URL` definitivo e republicar o Studio se foi alterado.
6. Verificar proteção dos deploys: o site público deve estar acessível aos visitantes e robôs; a prévia editorial deve funcionar com a proteção escolhida.

## 10. Validação e corte

As fichas de imóveis usam exclusivamente `/imoveis/[slug]`, inclusive as vinculadas a condomínios. As páginas dos condomínios continuam em `/condominios/[slug]`. Por decisão do responsável, a antiga rota de imóveis na raiz foi removida **sem redirecionamento**; links antigos precisam ser substituídos em campanhas, favoritos e campos de links internos cadastrados no Sanity. O deploy do site e a republicação do Studio devem acompanhar essa mudança para atualizar também o Presentation Tool. Nenhum slug ou documento precisa ser migrado no dataset.

Auditoria local de links em 19/11/2026: 78 URLs internas e 1.516 referências verificadas, sem erros HTTP ou âncoras ausentes após a correção. Os botões da home que apontavam para uma seção opcional `#imoveis` agora abrem `/imoveis`. Também foram verificados 25 arquivos locais referenciados, sem erros ou diferenças de maiúsculas/minúsculas nos caminhos públicos. Essa checagem não valida disponibilidade de sites externos nem garante que links cadastrados futuramente no Sanity sejam válidos.

Executar antes de entregar:

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm --filter web build
pnpm --filter studio build
```

Se o Turbopack falhar **localmente**, usar adicionalmente `pnpm --filter web exec next build --webpack` para diagnóstico. Isso não substitui conferir o resultado do build real da Vercel.

- [ ] Home, catálogo, filtros, paginação, condomínios e fichas Fotos/Vídeos/Padrão.
- [ ] Fotos, vídeos, marca d’água e mapas; links WhatsApp, redes e portal.
- [ ] Configurações institucionais, CRECI, contatos, privacidade e aviso de cookies aprovados.
- [ ] Login de Editor no Studio do cliente; cadastro, upload, rascunho, Prévia, publicação e despublicação.
- [ ] Alterações publicadas aparecem no site; rascunhos não vazam para visitantes.
- [ ] Prévia abre o domínio do cliente, não o domínio MAGUI.
- [ ] `robots.txt`, `sitemap.xml`, canonical, `og:url` e imagens apontam aos endereços corretos; produção indexável conforme aprovação.
- [ ] Home compartilha arte padrão; condomínio e imóvel compartilham suas capas; imagem SEO publicada sobrescreve as capas.
- [ ] URLs de imagens e HTML respondem sem login; testar compartilhamento e cache.
- [ ] GA4 usa a propriedade do cliente e respeita o aceite; confirmar navegação no Tempo real/DebugView.
- [ ] Nenhuma variável de produção aponta para `fc83c82x`; revisar fallbacks e appId do Studio.
- [ ] Conferir conteúdo de demonstração, referências, quantidade de documentos e assets após importação.
- [ ] Registrar aprovação, commit publicado, URLs, IDs dos projetos/apps, versão Node/pnpm, horário do corte e responsáveis.

O checkpoint publicado antes desta documentação foi `fb59943` (imagens sociais otimizadas e novo endereço do Studio). A revisão posterior adicionou correções e testes locais; confirmar commit/push e deploy dessa versão antes de tratá-la como publicada.

Validações locais da revisão de 19/11/2026: TypeScript dos dois projetos, 19 testes, build web com Webpack e build do Studio passaram. Não representam um teste manual completo de todas as telas nem aprovação final do cliente.

## 11. Retorno em caso de falha e encerramento

- Manter a homologação pessoal e o backup enquanto a produção é validada.
- Em falha do código, republicar o último deploy validado **no projeto Vercel do cliente**. O rollback do site não desfaz alterações no Sanity.
- Antes de alterar/importar um dataset de destino já usado, exportá-lo. Restauração de conteúdo exige um plano próprio; evitar sobrescrever edições feitas após a entrada em produção.
- Se o corte de DNS falhar, restaurar os registros anteriores anotados antes da troca, considerando o tempo de propagação.
- Após aceite de produção, combinar retenção dos backups, remoção de acessos temporários e encerramento dos endereços pessoais. Não apagar o Sanity pessoal antes de confirmar a migração de todos os assets e referências.

## 12. Consumo, cache e campanhas

Otimizações implementadas no PRIME após a análise de consumo:

- **Dados publicados:** cliente Sanity com `useCdn: true`, perspectiva `published`, `cache: force-cache`, `next.revalidate: 60` e tag `sanity-content`. O cache de dados é compartilhado entre requisições na instância/plataforma Next.js; React `cache()` continua deduplicando chamadas dentro da mesma renderização.
- **Prévia e autenticação:** o cliente base mantém `useCdn: false`; rascunhos usam `no-store`, sem as opções de cache público. A validação do link de prévia também continua na API direta. Não colocar HTML de usuários em modo editorial num cache público.
- **Prazo de publicação:** 60 segundos é o intervalo de revalidação do cache de dados, não uma garantia de atualização em exatamente um minuto. O primeiro acesso após o vencimento pode receber o valor anterior e disparar uma atualização em segundo plano. O CDN Sanity pode adicionar atraso; falhas no upstream também podem prolongar o uso do resultado anterior. A aba Prévia não usa esse cache. Uma mudança urgente pode exigir um fluxo de invalidação por webhook a implementar depois; redeploy não deve ser tratado como garantia de limpeza de todo cache de dados.
- **Consultas menores:** catálogo e semelhantes não buscam a home inteira; ficha de condomínio busca apenas esse condomínio e seus imóveis; diretório recebe contagens calculadas no GROQ em vez do catálogo completo; sitemap busca apenas slugs e datas necessárias. A home mantém os dados necessários às seleções, tipos e fallbacks editoriais legados.
- **Sitemap:** revalidação de 60 segundos, em vez de renderização obrigatória em todos os acessos.
- **Vídeos:** capa estática; players diretos sem `src` antes de interação, com `preload=none`. Embeds da visita inline ficam atrás de um botão; players em modal são montados ao abrir. Clicar num capítulo ou abrir um modal já é interação e pode iniciar carregamento/reprodução. Sem novos MP4s locais ou serviços de streaming adicionados.
- **Imagens:** mantida a entrega direta do CDN Sanity com tamanhos responsivos, compressão e lazy loading existentes. A arte social padrão continua JPEG de aproximadamente 94 KB.

Além do cache de **dados**, o build local validado pré-gerou a home, a lista de condomínios, a página 404 e o sitemap com revalidação de um minuto. As fichas e o catálogo com filtros continuam dinâmicos, reaproveitando os dados cacheados. Draft Mode é tratado pelo Next.js; não foram adicionados cabeçalhos de cache público genéricos a respostas editoriais. Conferir o resumo do build real da Vercel com as variáveis do ambiente de destino, pois a classificação das rotas pode variar. A tag foi preparada para uma futura invalidação autenticada; não há endpoint de invalidação exposto nesta versão.

Nenhuma configuração nova de ambiente é necessária para ativar essas otimizações após o deploy. Medir a economia no Usage dos projetos reais; sem histórico de tráfego e fatura discriminada, não estimar redução em dólares nem prometer ausência de excedentes.

Validação local desta otimização: 22 testes passaram (incluindo consultas GROQ executadas sobre fixtures e ausência de fonte de vídeo no HTML inicial), TypeScript passou e o build Webpack passou. Em `next start`, home, catálogo, diretório, ficha de condomínio, ficha de imóvel e sitemap retornaram HTTP 200. Home, diretório e sitemap retornaram `x-nextjs-cache: HIT`, e foram encontrados registros persistentes de consultas ao API CDN. Uma requisição com cookie de Draft Mode retornou `Cache-Control` privado/sem armazenamento; a validação editorial completa com login, token e rascunhos deve ser repetida no ambiente publicado. Testes locais não representam medição financeira nem teste de campanha.

### Antes de iniciar uma campanha

1. Na conta Vercel responsável, abrir Usage e Billing/Spend Management. Registrar a linha de base e separar transferência, requisições, execução de funções e cache; filtrar pelo projeto e pelo período da campanha.
2. Definir com o cliente o orçamento e os destinatários dos alertas. Um orçamento/alerta sozinho não limita gastos. A pausa automática de produção deve ser escolhida explicitamente, pois deixa o site indisponível e pode ocorrer com atraso; não foi habilitada por este trabalho.
3. No Sanity do ambiente, conferir o plano, as franquias e o uso de API, API CDN, armazenamento e largura de banda de assets. Configurar alertas oferecidos pelo plano e revisar durante a campanha.
4. Medir no navegador quanto uma visita típica transfere sem play e com play. Conferir que vídeos não baixam antes do clique e que imagens usam larguras compatíveis com a tela. Não usar só a contagem de visitantes do Analytics como prova de consumo: há robôs e visitantes sem consentimento.
5. Preparar vídeos comprimidos para o uso real; os limites de upload do Studio são limites máximos de arquivo, não metas de tamanho. Para volume alto de reprodução, avaliar streaming adaptativo e comparar custo de entrega, sem presumir que mover arquivos de um provedor a outro elimina o custo.
6. Conferir publicação, despublicação e mudança de preço após o ciclo de cache; conferir a prévia imediatamente. Não usar um item real de produção como teste sem uma janela editorial combinada.

Vercel e Sanity cobram recursos diferentes: um arquivo entregue diretamente por `cdn.sanity.io` consome entrega no Sanity; mover vídeos para lá não os torna gratuitos. Arquivos na CDN Vercel ainda podem consumir transferência ao visitante mesmo num cache hit.

Referências desta seção: [cache de fetch no Next.js](https://nextjs.org/docs/app/api-reference/functions/fetch), [camadas de cache Sanity/Next.js](https://www.sanity.io/docs/nextjs/caching-and-revalidation-in-nextjs), [transferência Vercel](https://vercel.com/docs/manage-cdn-usage) e [Spend Management](https://vercel.com/docs/spend-management).

## Referências oficiais

- [Vercel: gerenciadores de pacotes e override de instalação](https://vercel.com/docs/package-managers)
- [Vercel: configuração de domínio](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Sanity: publicação do Studio](https://www.sanity.io/docs/studio/deployment)
- [Sanity: CORS](https://www.sanity.io/docs/content-lake/cors)
- [Sanity: exportação de datasets](https://www.sanity.io/docs/content-lake/exporting-data)
- [Sanity: ambientes de desenvolvimento, staging e produção](https://www.sanity.io/docs/content-lake/environments)

As referências podem mostrar a CLI mais nova; para executar comandos, conferir sempre o `--help` da versão instalada e os arquivos deste repositório.
