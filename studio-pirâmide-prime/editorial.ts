// Editorial instructions live together so the same field has consistent guidance
// in the Studio. Only presentation and ordering change; stored names stay intact.
type Node = {
  name?: string; type?: string; title?: string; description?: string; group?: string | string[]
  fields?: Node[]; of?: Node[]; groups?: Node[]
}
type Guidance = {title?: string; description: string}
const guidance: Record<string, string | Guidance> = {
  primePhoto: 'Envie uma imagem JPEG, PNG ou WebP de até 2 MB e preencha a descrição abaixo. Nas fotos de imóveis e condomínios, aguarde a aplicação automática da marca d’água. Banners e imagens institucionais ficam sem marca d’água.',
  'primePhoto.alt': {title: 'Descrição da imagem para acessibilidade', description: 'Descreva em uma frase o que a foto mostra. Ex.: Fachada da casa com jardim e piscina. Esse texto ajuda quem usa leitor de tela; não é uma chamada de venda. Use de 3 a 160 caracteres.'},
  'primePhoto.caption': {title: 'Legenda da foto (opcional)', description: 'Texto curto exibido junto da imagem no modelo Fotos. Ex.: Varanda integrada à sala de estar. Deixe vazio se não quiser uma legenda. Máximo de 120 caracteres.'},
  primeSeo: 'Preenchimento opcional, indicado após concluir o cadastro. Ajusta a apresentação da página em buscadores e no compartilhamento de links; não altera o título visível do imóvel ou condomínio.',
  'primeSeo.title': 'Título sugerido para a aba do navegador e os resultados de busca. Ex.: Casa com 4 suítes no Urbanova. Prefira até 60 caracteres; o site acrescenta o nome da Pirâmide automaticamente.',
  'primeSeo.description': 'Resumo sugerido para os resultados de busca. Destaque localização e características em uma ou duas frases, de preferência até 160 caracteres. O buscador pode escolher outro trecho da página.',
  'primeSeo.socialImage': 'Imagem usada ao compartilhar o link em redes sociais e aplicativos de mensagem. Prefira uma foto horizontal de 1200 × 630 px. Se ficar vazia, o site usa a imagem padrão disponível para a página.',
  'city.name': 'Informe o nome completo da cidade, com acentos. Ex.: São José dos Campos. Cadastre cada cidade uma única vez; ela será usada nos bairros e filtros do site.',
  'neighborhood.city': 'Primeiro selecione a cidade à qual este bairro pertence. Se ela ainda não aparece, faça o cadastro em Cidades e publique antes de continuar.',
  'neighborhood.name': 'Informe apenas o nome do bairro. Ex.: Urbanova. A cidade é escolhida no campo acima; o mesmo nome de bairro pode existir em cidades diferentes.',
  'propertyTypeOption.name': 'Nome da categoria exibida nos filtros e nos cards de Qual imóvel você procura?. Ex.: Casa/Mansão, Apartamento/Cobertura ou Terreno. A opção Condomínio é um atalho para a lista de condomínios; o cadastro de cada condomínio é feito no menu Condomínios.',
  'propertyTypeOption.image': {title: 'Foto do card na página inicial', description: 'Imagem da categoria na seção Qual imóvel você procura?. Prefira uma foto com bom enquadramento vertical. Ela fica sem marca d’água e não muda as fotos dos imóveis dessa categoria.'},
  'condominium.name': 'Nome público do condomínio. Ex.: Reserva das Oliveiras. Aparece nos cards, na página do condomínio e nos imóveis vinculados. Não informe aqui o nome de uma casa ou apartamento.',
  'condominium.slug': {title: 'Endereço da página do condomínio', description: 'Depois de preencher o nome, clique em Generate para criar o final do link. Ex.: reserva-das-oliveiras gera /condominios/reserva-das-oliveiras. Use letras minúsculas, números e hífens; evite alterar depois de divulgar o link.'},
  'condominium.description': 'Apresente o condomínio: estilo de vida, localização e principais diferenciais. Esse texto aparece na página do condomínio e, resumido, na lista. Descreva o lugar como um todo; as características de cada unidade ficam no cadastro do imóvel. Máximo de 3.000 caracteres.',
  'condominium.neighborhood': 'Selecione o bairro onde fica o condomínio. A cidade é preenchida a partir desse bairro e aparece nos cards e filtros. Se faltar uma opção, cadastre e publique primeiro a cidade e o bairro.',
  'condominium.address': {title: 'Endereço público do condomínio (opcional)', description: 'Informe rua ou avenida e número da entrada. Ex.: Avenida das Oliveiras, 1000. O texto aparece na apresentação do condomínio; bairro e cidade são acrescentados automaticamente.'},
  'condominium.cover': 'Foto principal usada na lista e na abertura da página do condomínio. Prefira uma imagem horizontal da entrada, fachada ou área comum. Envie até 2 MB, preencha a descrição da imagem e aguarde a marca d’água antes de publicar.',
  'condominium.features': 'Adicione um item por estrutura ou serviço compartilhado. Ex.: Portaria 24 horas, Academia, Piscina ou Espaço pet. A lista aparece na página do condomínio. Use até 30 itens, sem repetições; detalhes de uma unidade pertencem ao cadastro do imóvel.',
  'primeCondominiumDirectory.title': 'Título principal da página que lista os condomínios. Ex.: Conheça nossos condomínios. Se ficar vazio, o site usa esse título padrão. Máximo de 100 caracteres.',
  'primeCondominiumDirectory.description': 'Texto curto abaixo do título da lista de condomínios. Apresente a seleção em uma ou duas frases. Se ficar vazio, o site usa a apresentação padrão. Máximo de 300 caracteres.',
  'primeCondominiumDirectory.featured': 'Escolha até 3 condomínios para os cards maiores no topo da lista. Arraste para ordenar. Cadastre e publique os condomínios antes de selecioná-los; eles não se repetem na grade abaixo. Essa seleção não altera os imóveis da página inicial.',
  'property.title': {title: 'Título do imóvel', description: 'Nome que identifica este imóvel nos cards e na sua página. Ex.: Apartamento com varanda no Alto das Palmeiras. Prefira uma identificação clara e diferente dos outros imóveis. Máximo de 100 caracteres.'},
  'property.refCode': 'Código deste imóvel no sistema da imobiliária. Ex.: PR-1042. É opcional, mas ajuda a equipe e os visitantes a localizar o cadastro. Não repita o código de outro imóvel.',
  'property.propertyType': 'Escolha o que está à venda. Ex.: um apartamento no Reserva das Oliveiras tem o tipo Apartamento/Cobertura; uma casa no mesmo lugar tem o tipo Casa/Mansão. O nome do condomínio é escolhido no próximo campo. Novas categorias podem ser cadastradas em Tipos de imóvel.',
  'property.condominium': {title: 'Condomínio ao qual o imóvel pertence (opcional)', description: 'Este imóvel fica dentro de um condomínio? Selecione o nome dele aqui. Ex.: para um apartamento no Reserva das Oliveiras, escolha Reserva das Oliveiras. Isso inclui o imóvel na página desse condomínio. Se o nome ainda não aparece, cadastre e publique em Condomínios. Se não se aplica, deixe vazio.'},
  'property.condominiumName': {title: 'Nome do edifício sem cadastro (opcional)', description: 'Use apenas para informar um edifício que não tem cadastro em Condomínios. Ex.: Edifício Alto das Acácias. Esse nome aparece na localização do imóvel, mas não cria vínculo com a lista de condomínios. Se selecionou um condomínio acima, este campo não é necessário.'},
  'property.neighborhood': 'Selecione o bairro onde este imóvel está localizado. A cidade vem do cadastro do bairro e será usada nos filtros. Para unidades de um condomínio, confira se o bairro é o mesmo informado no condomínio. Cadastre opções ausentes em Cidades e Bairros.',
  'property.summary': 'Resumo de venda exibido nos cards e na abertura da página do imóvel. Destaque os principais atrativos em uma ou duas frases, sem repetir o título. Máximo de 175 caracteres.',
  'property.description': 'Apresentação completa do imóvel. Descreva os ambientes, acabamentos, distribuição e diferenciais de localização. Use parágrafos curtos. Metragens, preços e quantidades devem ser preenchidos também nos campos próprios abaixo.',
  'property.architect': 'Nome do arquiteto ou escritório responsável pelo projeto. Ex.: Studio Oliveira Arquitetura. Preencha somente quando essa informação estiver confirmada; se não souber, deixe vazio.',
  'property.specifications': 'Preencha os dados confirmados deste imóvel. Informe áreas em metros quadrados e quantidades em números inteiros. Deixe vazio o que não se aplica ou ainda não foi confirmado.',
  'property.specifications.totalArea': 'Área total do imóvel, em metros quadrados, conforme a documentação. Digite apenas o número. Esse dado é independente da área construída, privativa ou do terreno; o site não soma as áreas automaticamente. Deixe vazio se ainda não tiver a informação confirmada.',
  'property.specifications.area': 'Área construída da casa ou área privativa do apartamento, em m². Digite apenas o número, como 185 ou 185,5, sem escrever m².',
  'property.specifications.landArea': 'Área total do terreno ou lote, em m². Ex.: 720. Em terrenos, esse valor é usado como metragem principal do card.',
  'property.specifications.bedrooms': 'Total de dormitórios do imóvel, incluindo os que são suítes. Ex.: 4 dormitórios, dos quais 3 são suítes. Não some novamente as suítes ao total.',
  'property.specifications.suites': 'Quantidade de dormitórios com banheiro privativo. Esse número também alimenta o filtro de suítes. Informe 0 se não houver; deixe vazio se ainda não souber.',
  'property.specifications.bathrooms': 'Quantidade de banheiros completos do imóvel, incluindo os das suítes. Não inclua lavabos nesse total.',
  'property.specifications.lavabos': 'Quantidade de lavabos, sem chuveiro. Não inclua esses ambientes novamente no total de banheiros completos.',
  'property.specifications.parking': 'Total de vagas de garagem, somando cobertas e descobertas. Ex.: 4 vagas. O número de vagas cobertas abaixo deve fazer parte desse total.',
  'property.specifications.coveredParking': 'Das vagas totais acima, quantas são cobertas? Ex.: 2 de um total de 4. Este número não pode ser maior que o total de vagas.',
  'property.specifications.floorProfile': 'Escolha a característica que melhor descreve a unidade. Ex.: Térrea para casa em um piso, Sobrado para casa em dois pisos ou Cobertura para apartamento de cobertura. Deixe vazio quando não se aplicar.',
  'property.specifications.sunOrientation': 'Selecione a posição solar predominante, quando confirmada. Ex.: Sol da manhã ou Face norte. Não estime essa informação; deixe vazio se não souber.',
  'property.specifications.hasOffice': 'Ative se o imóvel tem um ambiente destinado a escritório ou trabalho em casa.',
  'property.specifications.hasHobbyBox': 'Ative se há um depósito privativo ou hobby box pertencente à unidade.',
  'property.specifications.hasEvCharger': 'Ative se a unidade tem ponto para recarga de veículo elétrico.',
  'property.customFacts': 'Acrescente informações que não tenham um campo próprio acima. Em cada item, informe o nome do dado e seu valor. Ex.: Nome: Tipo de piso; Valor: Porcelanato. Os itens aparecem após os dados fixos da ficha técnica, com o mesmo ícone de confirmação. Arraste para ordenar. Se o campo fixo já atende à informação, preencha-o para evitar repetições.',
  'property.customFacts.label': 'Nome da característica exibido na ficha técnica. Ex.: Tipo de piso, Ano de construção ou Vista. Use até 60 caracteres; não inclua o valor neste campo.',
  'property.customFacts.value': 'Informação correspondente ao nome acima. Ex.: Porcelanato, 2022 ou Vista para a serra. Inclua a unidade de medida quando necessário, como 12 m². Use até 160 caracteres.',
  'property.attributes': 'Até 3 informações curtas para os cards, com até 45 caracteres cada. Ex.: Vista para a serra. Se ficar vazio, o card usa os dados disponíveis de metragem, suítes e vagas.',
  'property.features': 'Características exclusivas deste imóvel, uma por item. Ex.: Piscina aquecida, Adega climatizada ou Energia solar. Não inclua aqui serviços compartilhados do condomínio. Até 100 caracteres por item.',
  'property.condoFeatures': 'Estruturas compartilhadas do condomínio que devem aparecer na página deste imóvel. Ex.: Portaria 24 horas ou Quadra de tênis. Esta lista é própria da ficha do imóvel; não é copiada automaticamente do cadastro do condomínio.',
  'property.address': 'Preencha somente os dados de endereço que podem aparecer publicamente na página do imóvel. Bairro e cidade vêm da seleção feita no cadastro. Os campos são opcionais.',
  'property.address.street': {title: 'Rua ou avenida', description: 'Nome da via, sem o número. Ex.: Avenida São João. Informe somente se o endereço puder ser divulgado.'},
  'property.address.number': 'Número do imóvel. Aceita letras e s/n. Ex.: 120A. Deixe vazio se não for divulgar.',
  'property.address.complement': 'Informação adicional que pode ser pública. Ex.: Bloco B. Evite informar número de unidade ou detalhes de acesso sem autorização.',
  'property.address.state': {title: 'Estado (UF)', description: 'Selecione a sigla do estado onde está o imóvel. Ex.: SP para São Paulo.'},
  'property.address.postalCode': 'CEP do endereço, com oito dígitos. Ex.: 12242-840. Se não souber, deixe vazio.',
  'property.address.point': 'Coordenadas do ponto a mostrar no mapa. Use latitude e longitude conferidas. Para preservar a localização exata, use um ponto próximo e ative Localização aproximada abaixo.',
  'property.address.approximate': {title: 'Localização aproximada no mapa', description: 'Ative quando o ponto indica apenas a região ou uma referência próxima. A página avisará que a localização é aproximada. Deixe desativado quando o ponto for o endereço exato.'},
  'property.availability': 'Situação comercial atual: Disponível, Reservado ou Vendido. Reservado e Vendido recebem identificação nos cards; marcar Vendido não remove automaticamente o imóvel do site.',
  'property.price': 'Preço total de venda, em reais. Digite apenas o valor, sem R$. Ex.: 1850000. Se ficar vazio, o site mostra Valor sob consulta.',
  'property.condoFee': 'Valor mensal da taxa de condomínio, em reais. Informe 0 para indicar isenção ou deixe vazio para não exibir essa informação.',
  'property.iptu': 'Valor anual do IPTU, em reais. Não informe o valor de uma parcela mensal. Use 0 para indicar isenção ou deixe vazio para não exibir.',
  'property.conditions': 'Ative apenas as condições confirmadas para esta negociação. As opções desativadas não são apresentadas como benefícios na página.',
  'property.conditions.exclusive': 'Ative quando a venda tem exclusividade com a Pirâmide. O imóvel receberá a identificação Exclusivo.',
  'property.conditions.furnished': 'Ative se a venda inclui a mobília, conforme a negociação aprovada. Explique itens e exceções na descrição do imóvel.',
  'property.conditions.acceptsTrade': 'Ative se o proprietário aceita analisar propostas com permuta. Isso não significa aprovação automática de qualquer proposta.',
  'property.conditions.acceptsFinancing': 'Ative se a operação admite financiamento, conforme as condições e a documentação do imóvel.',
  'property.externalListingUrl': 'Link completo da página deste mesmo imóvel no portal principal da Pirâmide. Não use o endereço geral da imobiliária. Se não houver uma página correspondente, deixe vazio.',
  'property.cover': 'Foto principal usada nos cards e na abertura da página do imóvel. Prefira uma foto horizontal que represente bem a unidade. Envie até 2 MB, descreva a imagem e aguarde a aplicação da marca d’água antes de publicar.',
  'property.gallery': 'Fotos que compõem a visita ao imóvel. Arraste para ordenar e preencha a descrição de cada imagem. É necessária pelo menos uma foto nos modelos Fotos e Padrão. Cada arquivo pode ter até 2 MB; aguarde a marca d’água antes de publicar.',
  'property.videoGallery': 'Vídeos da visita, organizados por ordem de exibição. Adicione até 12 vídeos MP4, com até 40 MB cada. No modelo Vídeos, escolha somente um para a abertura; sem marcação, o primeiro vídeo disponível é usado.',
  'property.videoGallery.title': 'Nome curto deste trecho da visita. Ex.: Área de lazer ou Ambientes internos. Ajuda o visitante a identificar o conteúdo. Máximo de 80 caracteres.',
  'property.videoGallery.file': 'Envie o vídeo deste item em MP4, preferencialmente H.264, com até 40 MB. Não adicione o mesmo arquivo duas vezes à lista.',
  'property.videoGallery.poster': 'Foto exibida como capa deste vídeo. Escolha uma imagem que represente o trecho da visita. É opcional; envie até 2 MB e preencha a descrição da imagem.',
  'property.videoGallery.opening': {title: 'Usar este vídeo na abertura', description: 'No modelo Vídeos, ative em apenas um item para escolhê-lo como vídeo inicial. Se nenhum estiver marcado, a página usa o primeiro vídeo disponível.'},
  'property.clip': 'Vídeo curto de abertura, em MP4 H.264, com até 12 MB. Prefira um trecho que funcione bem em repetição. É opcional e também pode ser usado pelo modelo Vídeos.',
  'property.tour': 'Vídeo completo do tour, em MP4 H.264, com até 40 MB. Use a galeria de vídeos acima para organizar vários trechos separados.',
  'property.externalVideoUrl': 'Link completo de um vídeo no YouTube ou Vimeo. Ex.: https://www.youtube.com/watch?v=... Use quando quiser oferecer um vídeo externo, sem enviar o arquivo ao Sanity.',
  'property.virtualTourUrl': 'Link completo de uma visita virtual 360°, como Matterport. O visitante poderá abrir o tour a partir da página do imóvel. Deixe vazio se não houver tour.',
  'property.template': {title: 'Modelo de apresentação da página', description: 'Escolha como o imóvel será apresentado: Fotos valoriza o ensaio fotográfico; Vídeos valoriza a visita em vídeo e exige um MP4; Padrão combina fotos, informações e vídeos. Você pode mudar o modelo mantendo o mesmo endereço.'},
  'property.slug': {title: 'Endereço da página do imóvel', description: 'Depois de preencher o título, clique em Generate para criar o final do link. Ex.: casa-no-urbanova gera /casa-no-urbanova. O endereço fica bloqueado após a primeira publicação para preservar links já divulgados.'},
  'property.sectionPhoto': 'Foto da seção de apresentação do imóvel. É opcional; sem uma escolha, a página usa uma foto da galeria ou a capa. Envie até 2 MB e preencha a descrição da imagem.',
  'property.detailsPhoto': 'Até 2 fotos para Detalhes em foco, no modelo Fotos. A primeira aparece à esquerda e a segunda à direita. Arraste para trocar a ordem. Cada imagem pode ter até 2 MB.',
  'property.mediaPhoto': 'Foto de acesso à galeria na seção Fotos e tour do modelo Padrão. Se ficar vazia, a página usa uma imagem disponível do imóvel.',
  'property.mediaVideoPhoto': 'Capa da área de vídeo na seção Fotos e tour do modelo Padrão. É opcional; use para destacar uma imagem diferente da capa do imóvel.',
  'property.videoTourPhoto': 'Imagem de apresentação da seção Visita em vídeo no modelo Vídeos. As capas dos trechos individuais são escolhidas na galeria de vídeos.',
  'property.faq': 'Perguntas e respostas úteis sobre este imóvel. Ex.: O proprietário analisa permuta? Adicione até 10 perguntas. Se a lista ficar vazia, essa seção não aparece.',
  'property.faq.question': 'Pergunta como o visitante faria. Ex.: O imóvel possui energia solar? Use até 140 caracteres.',
  'property.faq.answer': 'Resposta objetiva e confirmada pela equipe. Explique condições quando necessário. Use até 600 caracteres.',
  'property.noIndex': {title: 'Não mostrar esta página em buscadores', description: 'Opcional. Ative para pedir que buscadores não incluam esta página nos resultados e para retirá-la do mapa do site. O imóvel continua acessível pelo link e pelas listas do site; esta opção não torna o cadastro privado.'},
  'primeHome.heroSlides': 'Imóveis exibidos na abertura da página inicial, em carrossel. Escolha até 3 imóveis já cadastrados e publicados. Arraste para definir a sequência; o primeiro abre a página. Essa lista não altera as seções Em destaque e Explore os imóveis.',
  'primeHome.featured': 'Imóveis apresentados na seção Em destaque, em dois cards por linha no computador. Arraste para definir a ordem. Essa seleção é independente do hero e de Explore os imóveis. Sem itens, a seção fica oculta.',
  'primeHome.propertyTypeOrder': 'Defina a sequência dos cards de Qual imóvel você procura? arrastando os tipos nesta lista. Condomínio fica sempre em primeiro e não precisa ser adicionado. Os demais aparecem na ordem escolhida; tipos não incluídos ficam ao final. Só aparecem no site os tipos com imóveis cadastrados.',
  'primeHome.homeSelection': 'Imóveis apresentados na seção Explore os imóveis da página inicial. Escolha até 5 imóveis cadastrados e publicados e arraste para ordenar os cards. Não é necessário preencher todos os lugares; a lista não é completada automaticamente.',
  'primeHome.banners': 'Campanhas exibidas entre Qual imóvel você procura? e Em destaque. Adicione imagem e link e arraste para ordenar. Um banner fica estático; dois ou mais alternam automaticamente. Sem itens, a seção fica oculta. Prefira artes 3:1, como 2400 × 800 px, com até 2 MB.',
  'primeHome.banners.title': 'Nome que identifica a campanha no cadastro e nos controles de acessibilidade. Ex.: Lançamento Parque Una. Não é escrito sobre a imagem do banner.',
  'primeHome.banners.image': 'Arte pronta da campanha, sem marca d’água. Prefira JPEG, PNG ou WebP horizontal, na proporção 3:1, com até 2 MB. Inclua o texto da campanha na própria arte e preencha a descrição da imagem.',
  'primeHome.banners.href': 'Página que será aberta ao clicar nesta imagem. Use o link completo de um site, como https://exemplo.com/evento, ou um caminho deste site, como /imoveis.',
  'primeHome.banners.newTab': 'Ative para abrir o destino em outra aba e manter este site aberto. Desative para navegar na mesma aba. Em links para campanhas externas, prefira uma nova aba.',
  'primeHome.marquee': 'Até 4 mensagens na faixa em movimento próxima ao rodapé da página inicial. Cada mensagem tem um título e uma frase de apoio. Arraste para definir a ordem; sem mensagens, a faixa fica oculta.',
  'primeHome.marquee.title': 'Chamada curta da mensagem. Ex.: Casas e mansões. Ela aparece em destaque na faixa. Máximo de 60 caracteres.',
  'primeHome.marquee.description': 'Frase que acompanha a chamada. Ex.: Explore imóveis selecionados em São José dos Campos. Máximo de 120 caracteres.',
  'primeHome.stats': 'Até 6 indicadores numéricos apresentados na página inicial. Adicione apenas dados confirmados e arraste para ordenar. O título de apresentação da seção fica em Configurações do site → Conteúdo e chamadas.',
  'primeHome.stats.label': 'O que este número representa. Ex.: Anos de tradição ou Clientes atendidos. Máximo de 60 caracteres.',
  'primeHome.stats.value': 'Número final do indicador, sem separador de milhar, símbolo ou texto. Ex.: 45 ou 50000. Use os campos de prefixo e sufixo para acrescentar símbolos.',
  'primeHome.stats.prefix': 'Texto ou símbolo antes do número. Ex.: + ou R$. É opcional. Máximo de 10 caracteres.',
  'primeHome.stats.suffix': 'Texto ou símbolo depois do número. Ex.: mil, % ou m². É opcional. Máximo de 12 caracteres.',
  'primeHome.homeSeo': 'Ajustes opcionais de busca e compartilhamento da página inicial. Preencha depois de organizar as imagens e os imóveis da página.',
  'primeHome.catalogSeo': 'Ajustes opcionais de busca e compartilhamento da página que lista todos os imóveis. Não altera as informações comerciais dos imóveis.',
  'primeMarquee.items': 'Cadastro anterior da faixa do rodapé. A edição atual fica em Página inicial → Rodapé.',
  'primeMarquee.items.title': 'Chamada curta exibida na faixa, com até 60 caracteres.',
  'primeMarquee.items.description': 'Frase de apoio da chamada, com até 120 caracteres.',
  'primeSiteSettings.organization': 'Dados públicos da imobiliária usados no cabeçalho, rodapé, contatos e identificação institucional. Confira os dados antes de publicar.',
  'primeSiteSettings.organization.name': 'Nome comercial da imobiliária exibido no site. Ex.: Pirâmide Imóveis.',
  'primeSiteSettings.organization.legalName': 'Razão social completa da empresa responsável pelo site. É usada na identificação institucional e na política de privacidade.',
  'primeSiteSettings.organization.description': 'Apresentação breve da imobiliária exibida no rodapé. Prefira um parágrafo curto sobre a atuação da empresa.',
  'primeSiteSettings.organization.creci': 'Registro profissional da imobiliária, com a identificação de pessoa jurídica quando aplicável. Ex.: 3787-J. Digite somente o registro; o site acrescenta CRECI onde necessário.',
  'primeSiteSettings.organization.commercialPhone': 'Número do WhatsApp que recebe os contatos comerciais do site. Digite código do país, DDD e número, somente dígitos. Ex.: 5512999999999. Sem um número válido, os links de atendimento não ficam disponíveis.',
  'primeSiteSettings.organization.portalUrl': 'Link completo do portal principal da imobiliária. Ex.: https://www.piramideimoveissjc.com.br. Este campo não é o link de um imóvel específico.',
  'primeSiteSettings.organization.officeTitle': 'Título da unidade principal no rodapé. Ex.: Sede principal ou Unidade São José dos Campos.',
  'primeSiteSettings.organization.streetAddress': 'Endereço da sede com rua ou avenida, número e bairro. Ex.: Avenida São João, 1301, Jardim Esplanada. Informe a cidade nos próximos campos.',
  'primeSiteSettings.organization.city': 'Cidade da sede da imobiliária. Ex.: São José dos Campos. Não altera as cidades cadastradas para os imóveis.',
  'primeSiteSettings.organization.state': 'Sigla do estado da sede. Ex.: SP.',
  'primeSiteSettings.organization.postalCode': 'CEP da sede. Ex.: 12242-840.',
  'primeSiteSettings.organization.country': 'Sigla de duas letras do país da sede. Ex.: BR para Brasil.',
  'primeSiteSettings.organization.openingHours': 'Horários públicos de atendimento. Use uma linha por período. Ex.: Segunda a sexta, 8h às 18h. Na linha seguinte: Sábado, 9h às 13h.',
  'primeSiteSettings.organization.copyright': 'Frase de direitos autorais no rodapé. Ex.: Todos os direitos reservados. O ano é acrescentado automaticamente.',
  'primeSiteSettings.organization.socialLinks': 'Links das redes sociais e outros canais da imobiliária. Adicione o nome, o endereço completo e o ícone. Arraste para definir a ordem de exibição.',
  'primeSiteSettings.organization.socialLinks.label': 'Nome do canal. Ex.: Instagram ou YouTube. Também identifica o link para quem usa leitor de tela.',
  'primeSiteSettings.organization.socialLinks.href': 'Link completo do perfil oficial. Ex.: https://www.instagram.com/nomedoperfil. Não use apenas o nome de usuário.',
  'primeSiteSettings.organization.socialLinks.icon': 'Escolha o símbolo correspondente ao canal. Para outros sites, use Site.',
  'primeSiteSettings.organization.branches': 'Outras unidades da imobiliária exibidas no rodapé. Adicione um nome e um link público para localização ou atendimento de cada unidade.',
  'primeSiteSettings.organization.branches.label': 'Identificação da unidade. Ex.: Unidade Urbanova.',
  'primeSiteSettings.organization.branches.href': 'Link completo para localizar ou conhecer esta unidade. Pode ser um endereço no Google Maps ou uma página institucional.',
  'primeSiteSettings.privacy': 'Conteúdo da política de privacidade e do aviso de cookies. Use textos revisados e coerentes com o funcionamento do site.',
  'primeSiteSettings.privacy.title': 'Título que abre a política de privacidade. Ex.: Política de privacidade e cookies.',
  'primeSiteSettings.privacy.subtitle': 'Apresentação curta abaixo do título da política. Explique de forma simples o objetivo deste documento.',
  'primeSiteSettings.privacy.controllerIntroduction': 'Frase que apresenta a empresa responsável pelos dados pessoais. Ex.: A empresa responsável por este site é. Os dados institucionais da empresa são acrescentados à identificação.',
  'primeSiteSettings.privacy.sections': 'Conteúdo da política dividido em assuntos. Ex.: Dados coletados, Uso das informações e Direitos do titular. Cada seção tem título e texto; arraste para ordenar.',
  'primeSiteSettings.privacy.sections.title': 'Assunto desta seção da política. Ex.: Como usamos os dados pessoais.',
  'primeSiteSettings.privacy.sections.body': 'Texto completo desta seção. Use parágrafos claros, com informações revisadas pela equipe responsável pela privacidade.',
  'primeSiteSettings.privacy.contactPhone': 'WhatsApp destinado a solicitações de privacidade. Digite país, DDD e número, somente dígitos. Ex.: 5512999999999. Pode ser diferente do telefone comercial.',
  'primeSiteSettings.privacy.contactMessage': 'Mensagem que já aparecerá preenchida ao abrir o WhatsApp pela política. Ex.: Gostaria de falar sobre meus dados pessoais.',
  'primeSiteSettings.privacy.contactLabel': 'Texto do botão de contato dentro da política. Ex.: Falar sobre privacidade.',
  'primeSiteSettings.privacy.cookieNotice': 'Texto do aviso de cookies mostrado ao visitante. Explique de forma breve o uso das tecnologias e a relação com a política.',
  'primeSiteSettings.differentiators': 'Seção institucional que apresenta os diferenciais da imobiliária na página inicial. Preencha o título e os itens que deseja exibir.',
  'primeSiteSettings.differentiators.items': 'Um item por diferencial da empresa. Ex.: Curadoria, Atendimento exclusivo ou Negociação segura. Cada item tem título e explicação.',
  'primeSiteSettings.differentiators.items.title': 'Nome curto do diferencial. Ex.: Atendimento exclusivo.',
  'primeSiteSettings.differentiators.items.text': 'Explique o benefício para o cliente em uma ou duas frases. Evite repetir o título do item.',
  'primeSiteSettings.statsIntro': 'Textos que apresentam os indicadores da página inicial. Os números e rótulos são cadastrados em Página inicial → Conteúdo → Números e dados em destaque. Sem indicadores, a seção fica oculta.',
}

// Repeated introductory and contact fields get guidance in their actual context.
for (const section of ['differentiators', 'statsIntro', 'homeCta', 'catalogCta', 'propertyCta']) {
  const root = 'primeSiteSettings.' + section
  guidance[root + '.eyebrow'] = 'Chamada curta que identifica a seção, quando prevista pelo layout. Ex.: Atendimento Prime. É um texto complementar ao título principal.'
  guidance[root + '.title'] = 'Texto principal desta seção. Use uma frase curta e clara. Nas chamadas de atendimento, deixar este campo vazio oculta a chamada.'
  guidance[root + '.description'] = 'Texto de apoio da seção. Explique o benefício ou o próximo passo em uma ou duas frases, sem repetir o título.'
}
for (const [section, location] of [['homeCta', 'da página inicial'], ['catalogCta', 'das listas de imóveis e condomínios'], ['propertyCta', 'das páginas dos imóveis']]) {
  const root = 'primeSiteSettings.' + section
  guidance[root] = 'Chamada de atendimento no final ' + location + '. Preencha título, texto de apoio e botão. O destino de contato usa o WhatsApp comercial da aba Institucional.'
  guidance[root + '.buttonLabel'] = 'Texto do botão que abre o WhatsApp comercial. Ex.: Falar com um especialista. Confira também o número cadastrado na aba Institucional.'
  guidance[root + '.secondaryLabel'] = section === 'homeCta' ? 'Texto do link que leva de volta a Explore os imóveis na página inicial. Ex.: Ver imóveis. Deixe vazio para não mostrar o link.' : 'Texto do link secundário da chamada, quando previsto pelo layout. Deixe vazio para não exibir.'
  guidance[root + '.image'] = 'Foto de fundo da chamada de atendimento. Prefira uma imagem horizontal, sem textos, com até 2 MB. Se ficar vazia, a seção usa apenas o fundo de cor.'
}

const fieldOrder: Record<string, string[]> = {
  neighborhood: ['city', 'name'],
  condominium: ['name', 'neighborhood', 'address', 'description', 'cover', 'features', 'slug', 'seo'],
  property: ['title', 'refCode', 'propertyType', 'condominium', 'condominiumName', 'summary', 'description', 'architect', 'specifications', 'customFacts', 'features', 'condoFeatures', 'attributes', 'neighborhood', 'address', 'availability', 'price', 'condoFee', 'iptu', 'conditions', 'externalListingUrl', 'cover', 'gallery', 'videoGallery', 'clip', 'tour', 'externalVideoUrl', 'virtualTourUrl', 'template', 'slug', 'sectionPhoto', 'detailsPhoto', 'mediaPhoto', 'mediaVideoPhoto', 'videoTourPhoto', 'faq', 'firstPublishedSlug', 'firstPublishedAt', 'seo', 'noIndex'],
  primeHome: ['heroSlides', 'propertyTypeOrder', 'featured', 'homeSelection', 'stats', 'banners', 'marquee', 'hero', 'whatsapp', 'homeSeo', 'catalogSeo'],
}

const isSeo = (node: Node) => node.type === 'primeSeo' || node.name === 'noIndex' || (Array.isArray(node.group) ? node.group.includes('seo') : node.group === 'seo')

export function withEditorialGuidance<T>(definition: T): T {
  function visit(node: Node, path: string, annotate = true): Node {
    const entry = annotate ? guidance[path] || (node.type ? guidance[node.type] : undefined) : undefined
    const metadata = typeof entry === 'string' ? {description: entry} : entry
    const next = {...node, ...metadata}
    if (node.fields) {
      const order = fieldOrder[path] || []
      const rank = (field: Node) => {const index = order.indexOf(field.name || ''); return index < 0 ? order.length : index}
      next.fields = node.fields.map((field) => visit(field, path + '.' + field.name)).sort((a, b) => Number(isSeo(a)) - Number(isSeo(b)) || rank(a) - rank(b))
    }
    if (node.of) next.of = node.of.map((member) => visit(member, path, false))
    if (node.groups) {
      const order = path === 'primeHome' ? ['content', 'banners', 'footer', 'seo'] : node.groups.map((group) => group.name)
      next.groups = [...node.groups].sort((a, b) => Number(a.name === 'seo') - Number(b.name === 'seo') || order.indexOf(a.name) - order.indexOf(b.name))
    }
    return next
  }
  return visit(definition as Node, (definition as Node).name || '') as T
}
