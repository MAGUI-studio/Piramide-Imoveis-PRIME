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
2. Crie um empreendimento, gere o slug, selecione o bairro, preencha os dados e escolha **Editorial**, **Imersivo** ou **Mosaico**. Publique para exibir o card na home e a ficha no endereço `/[slug]`.
3. Em **Home**, configure o número comercial em formato internacional, selecione um imóvel de abertura e organize os destaques. Publique a configuração. Sem imóvel de abertura, a home usa o primeiro destaque disponível ou o imóvel mais recente.
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

