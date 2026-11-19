# Pirâmide PRIME

Vitrine imobiliária em Next.js e Sanity Studio independente. O Studio aponta inicialmente para o projeto pessoal `fc83c82x`, dataset `production`.

## Desenvolvimento

Requisitos: Node.js 22.12 ou superior e pnpm 11.25.

```powershell
pnpm install
Copy-Item web/.env.example web/.env.local
Copy-Item studio-pirâmide-prime/.env.example studio-pirâmide-prime/.env.local
pnpm dev
```

- Site: http://localhost:3000
- Studio: http://localhost:3333
- Tipos: `pnpm check`
- Builds: `pnpm build` e `pnpm --filter studio build`

O catálogo, as fichas e os destaques vêm do dataset configurado, inclusive em desenvolvimento. A vitrine de um dataset vazio começa a exibir imóveis após a primeira publicação no Studio.

## Fluxo editorial

1. Abra o Studio com uma conta com acesso ao projeto. Cadastre e publique uma cidade e os bairros correspondentes.
2. Crie um empreendimento, gere o slug, selecione o bairro, preencha os dados e escolha **Fotos**, **Videos** ou **Padrão**. Publique para exibir o card na home e a ficha no endereço `/[slug]`.
3. Em **Página inicial**, selecione até 3 imóveis em **Imóveis do hero** e até 5 em **Imóveis de Explore os imóveis**. Arraste as referências para definir a ordem e publique. As listas são independentes; se forem esvaziadas, as seções ficam ocultas sem completar automaticamente com outros imóveis. O número comercial fica em **Configurações do site → Institucional**.
4. Envie imagens JPEG, PNG ou WebP de até 2 MB e MP4 de até 12 MB para clipes ou 40 MB para tours. Use MP4 H.264 e fotos com descrições e enquadramentos revisados. Exporte o clipe de abertura curto e adequado para repetição.
5. Use **Prévia** para revisar rascunhos. O template pode ser alterado após a publicação com o mesmo endereço.

## Vercel e Studio

1. Importe o repositório na Vercel. Use **web** como Root Directory, habilite a inclusão dos arquivos externos a essa pasta e selecione o preset Next.js.
2. Configure `SANITY_PROJECT_ID`, `SANITY_DATASET` e `NEXT_PUBLIC_SITE_URL`. Use `https://prime.piramideimoveissjc.com.br` como URL final e adicione o domínio no projeto da Vercel.
3. Para prévia, crie no Sanity um token de leitura com acesso a rascunhos e configure `SANITY_API_READ_TOKEN` somente no servidor, tanto em produção quanto nos ambientes de prévia desejados. Um dataset privado também exige esse token para as consultas públicas do servidor. Adicione no Sanity os origins do Studio e do site utilizados, com credenciais, incluindo os endereços locais para desenvolvimento. Abra a prévia no navegador com cookies permitidos. Em previews protegidos da Vercel, use a configuração de bypass de proteção do Presentation Tool se necessário.
4. Para hospedar o Studio, configure suas variáveis `SANITY_STUDIO_*` e use `pnpm --filter studio deploy` com a conta que administra o projeto. A variável `SANITY_STUDIO_PREVIEW_URL` deve apontar para a instância web que o Studio abrirá.
5. Smoke test de produção: abra a home, uma ficha de cada template e `/sitemap.xml`. Em seguida confira rascunho, publicação e despublicação pelo Studio. O site consulta o Sanity por requisição, sem webhook de revalidação.

## Projeto definitivo

Ao migrar para a conta da Pirâmide, troque o ID e o dataset nas variáveis do Studio e da Vercel, crie um token no projeto definitivo e refaça o CORS. Se já houver conteúdo que deva ser preservado, exporte o dataset pessoal e importe no definitivo com seus assets antes de trocar as variáveis. Mantenha slugs e IDs de referências durante a migração.


## Conteúdo global no Sanity

Em **Configurações do site**, edite:

- **Institucional**: nome, razão social, apresentação, CRECI, WhatsApp comercial, portal, endereço, horários, redes sociais, unidades e direitos autorais. Endereço e identificação também alimentam o SEO e a apresentação do controlador na política.
- **Privacidade e cookies**: título, apresentação, seções da política, telefone, mensagem e botão de atendimento e texto do aviso de cookies.
- **Conteúdo e chamadas**: diferenciais da empresa, apresentação dos indicadores e títulos, descrições, botões e imagens dos CTAs da Home, catálogo e fichas. A imagem da Home também serve como padrão de compartilhamento e fundo da página 404.

Os valores dos indicadores continuam em **Página inicial → Números e dados em destaque**. Sem indicadores, a seção fica oculta. Não há números comerciais de fallback. Sem título, diferenciais e CTAs ficam ocultos; sem imagem, usam o fundo da seção. Links de contato só aparecem quando há telefone válido e texto de botão.

As alterações devem ser publicadas para aparecer no site público; rascunhos podem ser conferidos em **Prévia**. Em um dataset novo, inicialize o conteúdo anteriormente fixo com:

```powershell
pnpm --filter studio seed:settings
```

O comando usa a sessão autenticada do Sanity, aproveita o telefone comercial legado da Home, envia a imagem existente dos CTAs e cria o documento somente se ainda não existir (publicado ou rascunho). Não altera configurações já cadastradas nem cria indicadores comerciais. `siteSettings.defaults.json` é apenas a entrada dessa migração; o site lê o conteúdo do Sanity.

## Condomínios e navegação por tipo

Em **Condomínios**, cadastre e publique nome, endereço da página, capa, apresentação, bairro/cidade e, opcionalmente, endereço, infraestrutura/lazer/segurança e SEO. As imagens desse cadastro recebem automaticamente a mesma marca d’água dos imóveis; aguarde o processamento e preencha a descrição da foto antes de publicar.

Em cada imóvel, selecione o campo **Condomínio** e mantenha **Tipo de imóvel** com a categoria real da unidade (Casa/Mansão, Apartamento/Cobertura, Terreno etc.). Publique ambos. O campo antigo **Condomínio ou edifício** continua disponível para dados legados, mas não substitui o vínculo com o novo cadastro. Imóveis anteriormente classificados como Condomínio devem ter seu tipo real revisado editorialmente; nenhum conteúdo existente é alterado automaticamente.

O card Condomínio da Home leva a `/condominios`. Essa lista usa a capa e a apresentação dos cadastros publicados. Cada card abre `/condominios/[slug]`, com informações do condomínio e seu catálogo de imóveis, refinável por tipo e demais filtros. Um condomínio publicado sem imóveis mostra sua apresentação e o estado vazio do catálogo. A foto do card da Home continua configurável em **Tipos de imóvel → Condomínio**; sem ela, usa a capa de um condomínio.

Os outros cards da Home abrem `/empreendimentos?tipo=...`. Os títulos do catálogo acompanham os filtros; paginação preserva os parâmetros e, dentro de um condomínio, permanece na mesma página do condomínio.

### Destaques da página de condomínios

Em **Página de condomínios**, configure o título, a apresentação e até três **Condomínios em destaque**. Arraste as referências para escolher a ordem e publique. Os cadastros vinculados também precisam estar publicados para aparecer. Os destaques ocupam três cards maiores na primeira página e não se repetem na grade abaixo. A grade usa quatro colunas no desktop e oito condomínios por página. Ao buscar ou filtrar, todos os resultados correspondentes entram na grade paginada, inclusive os destaques.

Os filtros de cidade e bairro são menus customizados com busca e seleção múltipla; cidade restringe as opções de bairro. Filtros e página são preservados na URL. Modificar filtros reinicia a paginação. O script `scripts/seed-demo-condominiums.ts`, executado via `sanity exec --with-user-token`, apenas cria documentos ausentes e inicializa a seleção de destaques quando ela ainda não existe; não substitui edições existentes.

### Página inicial e faixa do rodapé

O menu **Página inicial** mantém o documento existente `primeHome`. Na aba **Conteúdo**, gerencie **Imóveis do hero** (máximo 3) e **Imóveis de Explore os imóveis** (máximo 5), com referências únicas e ordem por arraste. O site também limita as seleções e ignora referências indisponíveis. A seção **Em destaque** continua com sua seleção própria.

A aba **Rodapé** reúne a **Faixa informativa do rodapé**, com até quatro mensagens ordenáveis. O antigo item separado saiu do menu. `scripts/initialize-home-selections.ts` inicializa somente campos ausentes, preservando as seleções atuais e copiando a faixa legada; rascunhos continuam como rascunhos. Depois da inicialização, listas intencionalmente vazias são respeitadas.

### Banners de campanhas

Em **Página inicial → Banners**, adicione campanhas com nome, imagem, descrição da imagem, link e a opção de abrir em nova aba. Arraste os itens para definir a ordem e publique. A arte fica sem marca d’água; prefira formato horizontal 3:1, como 2400 × 800 px. O banner atual do Parque Una foi importado com seu link original.

Sem itens, a seção fica oculta. Um banner fica estático; dois ou mais alternam a cada 6,5 segundos com controles de navegação e pausa. A rotação pausa durante interação e em abas em segundo plano, e fica desativada com a preferência de movimento reduzido. A configuração substitui a imagem antes fixa entre a seleção de tipos e a seção Em destaque.

### Organização editorial do Studio

A sequência recomendada de cadastro acompanha o menu: **Configurações do site → Cidades → Bairros → Tipos de imóvel → Condomínios → Imóveis → Página inicial / Página de condomínios**. Publique as cidades e os bairros antes de vinculá-los aos cadastros seguintes; organize as páginas depois de publicar os imóveis e condomínios.

Os campos têm instruções específicas de preenchimento, exemplos e indicação de uso no site. O campo **Condomínio ao qual o imóvel pertence** escolhe o cadastro do lugar; **Tipo de imóvel** identifica a unidade à venda. O nome livre de edifício fica oculto quando há um condomínio selecionado. SEO e compartilhamento aparecem ao final dos campos e das abas.

As instruções e a ordem dos campos são centralizadas em `studio-pirâmide-prime/editorial.ts`, sem alterar nomes internos, dados existentes ou regras de publicação. Para conferir a cobertura das instruções, a posição de SEO e os limites editoriais, execute `node --test tests/editorial.test.mjs` a partir da pasta do Studio.
