import type { KnowledgeTopic, RefusalPattern } from "@/lib/chatbot/types";

export const urgencyPatterns: RegExp[] = [
  /\bvenceu\b/i,
  /\bvencendo\b/i,
  /\bvencer\b/i,
  /\bprazo\b/i,
  /\bintima(ç|c)(ã|a)o\b/i,
  /\bapreens(ã|a)o\b/i,
  /\bapreendida\b/i,
  /\bindenferimento\b.*\bprazo\b/i,
  /\brecurso\b.*\bprazo\b/i,
  /\bmulta\b/i,
  /\bnotifica(ç|c)(ã|a)o\b/i,
  /\burgen(te|cia)\b/i
];

export const refusalPatterns: RefusalPattern[] = [
  {
    test:
      /(como\s+)?(usar|manusear|limpar|montar|desmontar)\s+(\w+\s+)?(arma|pistola|rev(ó|o)lver|rifle|fuzil|escopeta)/i,
    reply:
      "Essa orientação é operacional e está fora do escopo deste atendimento, que trata exclusivamente das questões <strong>jurídicas, documentais e administrativas</strong> do universo CAC. Se a sua dúvida envolve documentação, registro ou processo junto à Polícia Federal, posso ajudar agora."
  },
  {
    test:
      /modificar|convers(ã|a)o|adaptar|pe(ç|c)as?\s+(de\s+)?(arma|ferrolho|cano|carregador)|rajada/i,
    reply:
      "Alterações técnicas em armas de fogo não são objeto deste atendimento. Aqui tratamos de <strong>CRAF, registro, processos administrativos e documentação</strong>. Posso te orientar sobre algum desses temas?"
  },
  {
    test:
      /(comprar|adquirir|conseguir).*(sem\s+registro|no\s+mundo\s+clandestino|paralel)|esconder|ocultar|fugir\s+da\s+fiscaliza(ç|c)(ã|a)o|n(a|ã)o\s+registrar/i,
    reply:
      "Não é possível fornecer esse tipo de orientação. Este canal existe justamente para manter sua situação <strong>100% regular</strong> junto à Polícia Federal. Se existe uma pendência ou irregularidade no seu caso, a melhor rota é tratar isso com acompanhamento profissional — quer falar com a equipe?"
  },
  {
    test: /(melhor\s+)?(calibre|muni(ç|c)(ã|a)o|marca)\s+(para|de)\s+/i,
    reply:
      "Indicação de calibre, munição ou equipamento é decisão técnica e pessoal, fora do escopo jurídico deste atendimento. Se quiser, posso explicar os <strong>aspectos documentais</strong> envolvidos na aquisição dentro da sua cota."
  }
];

export const profileOptions = [
  { id: "ATIRADOR", label: "Atirador desportivo" },
  { id: "CACADOR", label: "Caçador" },
  { id: "COLECIONADOR", label: "Colecionador" },
  { id: "MULTIPLO", label: "Mais de um" },
  { id: "INICIANTE", label: "Estou iniciando" }
];

export const greeting =
  "Atendimento Advocac. Conte, com suas palavras, o que está acontecendo — <strong>você não precisa saber o nome do procedimento</strong>. A partir do que você descrever, eu localizo a orientação certa.";

export const fallbackText =
  "Não encontrei na minha base um enquadramento preciso para essa situação — e aqui eu prefiro <strong>não arriscar</strong>: orientação genérica em matéria de armas pode custar caro.<br><br>Você pode reformular mencionando o tema (CRAF, registro, exigência, indeferimento, habitualidade…) ou seguir direto para a equipe.";

export const localTopics: KnowledgeTopic[] = [
  {
    id: "CRAF_RENOVACAO",
    label: "Renovação de CRAF",
    patterns: [
      ["renovar", 3],
      ["renova(ç|c)(ã|a)o", 3],
      ["craf", 4],
      ["vencendo", 2],
      ["venceu", 2],
      ["vencendo o craf", 4],
      ["portal pf", 2]
    ],
    clarify:
      "Para eu te orientar corretamente: seu registro está vinculado à atividade de <strong>CAC</strong> (caçador, atirador desportivo ou colecionador)?",
    answer:
      "Entendi: <em>renovação de CRAF</em>. O quadro atual, conforme informação oficial da Polícia Federal:<br><br>A renovação do registro para CACs passou a ser realizada pelo <strong>novo Portal de Serviços da PF</strong>, lançado em julho de 2026 — a renovação do CRAF foi o primeiro serviço disponibilizado, com demais serviços em migração gradual.<br><br>Taxa informada pela PF: <strong>R$ 88,00 por arma</strong>, com processamento estimado de até <strong>60 dias corridos</strong>.",
    steps: [
      "Acessar o Portal de Serviços da PF com sua conta gov.br",
      "Conferir validade do CRAF e dados do acervo antes de iniciar",
      "Separar documentos pessoais e comprovações da atividade CAC",
      "Se houver exigência ou pendência anterior, resolver antes de protocolar"
    ],
    docs: [
      "Documento de identificação",
      "CRAF atual",
      "Comprovantes vinculados à atividade (clube/entidade)"
    ],
    source: { label: "Polícia Federal · Portal de Serviços", verified: "29/07/2026" }
  },
  {
    id: "CRAF_VALIDADE_PRAZO",
    label: "Validade e prazos do CRAF",
    patterns: [
      ["validade", 3],
      ["válido", 3],
      ["valido", 3],
      ["expirou", 3],
      ["quantos anos", 2],
      ["quanto tempo dura", 2],
      ["prazo do craf", 3]
    ],
    clarify:
      "Você quer saber sobre a validade do seu documento atual ou sobre o prazo de processamento de uma renovação já protocolada?",
    answer:
      "Sobre prazos e validade, dois pontos centrais:<br><br>O <strong>CRAF tem validade limitada</strong> e precisa ser renovado dentro do período estabelecido pela regulamentação vigente — deixar expirar gera irregularidade no porte do acervo.<br><br>Já o <strong>processamento</strong> da renovação pelo novo Portal PF tem estimativa oficial de até <strong>60 dias corridos</strong>, com taxa de R$ 88,00 por arma.<br><br>Como seu caso está próximo do vencimento ou já venceu? A conduta recomendada muda conforme a situação.",
    steps: [
      "Identificar a data exata de validade no documento",
      "Se ainda válido: renovar com antecedência pelo Portal PF",
      "Se vencido: tratar como prioridade para regularizar o acervo"
    ],
    source: { label: "Polícia Federal · Portal de Serviços", verified: "29/07/2026" },
    urgentIfExpired: true
  },
  {
    id: "EXIGENCIA_PF",
    label: "Exigência no processo",
    patterns: [
      ["exig(ê|e)ncia", 5],
      ["exigencia", 5],
      ["pend(ê|e)ncia", 3],
      ["pediu documenta", 3],
      ["faltou documento", 3],
      ["em exame", 2],
      ["an(á|a)lise", 1]
    ],
    clarify:
      "A exigência chegou pelo Portal PF/SINARM-CAC? Você consegue me dizer qual documento ou informação eles estão pedindo?",
    answer:
      "<em>Exigência em processo administrativo</em>. Situação comum e normalmente solucionável — o processo fica <strong>suspenso até o cumprimento</strong>, e o ponto crítico é o prazo de atendimento.<br><br>O caminho seguro é: identificar exatamente o que foi pedido, verificar se o documento precisa de versão específica (por exemplo, avaliação psicológica em formato aceito pela PF) e protocolar a resposta corretamente pelo sistema onde o requerimento corre.",
    steps: [
      "Ler a exigência e listar item por item o que foi solicitado",
      "Conferir se cada documento atende ao formato/exigência da PF",
      "Protocolar resposta dentro do prazo indicado no sistema",
      "Guardar o recibo do protocolo"
    ],
    docs: ["Inteiro teor da exigência", "Documentos solicitados"],
    source: { label: "Prática processual · SINARM-CAC / Portal PF", verified: "08/2026" },
    escalateHint: true
  },
  {
    id: "INDEFERIMENTO_RECURSO",
    label: "Indeferimento e recurso",
    patterns: [
      ["indenferido", 5],
      ["indeferido", 5],
      ["negado", 4],
      ["negaram", 3],
      ["recorrer", 4],
      ["recurso", 3],
      ["cancelaram", 3]
    ],
    clarify:
      "O indeferimento saiu para renovação, aquisição ou outro tipo de requerimento? E você já sabe se consta prazo para apresentar recurso?",
    answer:
      "<em>Processo indeferido.</em> Importante: indeferimento <strong>não é sentença definitiva</strong> — em regra cabe apresentar recurso ou novo requerimento, conforme o fundamento da decisão e os prazos do procedimento.<br><br>O que define a estratégia é o <strong>motivo</strong> apontado na decisão (documentação insuficiente, restrição cadastral, questão técnica). Cada fundamento pede uma resposta diferente.",
    steps: [
      "Obter a íntegra da decisão com os fundamentos",
      "Mapear o prazo recursal a partir da ciência",
      "Levantar provas/documentos que afastam o motivo apontado",
      "Protocolar recurso fundamentado dentro do prazo"
    ],
    docs: ["Decisão (inteiro teor)", "Documentos que contrariam o fundamento"],
    source: {
      label: "Prática processual · Lei nº 10.826/2003 e normativos SFPC",
      verified: "08/2026"
    },
    escalateHint: true
  },
  {
    id: "RENDA_CR",
    label: "Renda e requisitos do CR",
    patterns: [
      ["renda", 5],
      ["rendimento", 5],
      ["sal(á|a)rio", 4],
      ["capacidade financeira", 4],
      ["ocupa(ç|c)(ã|a)o l(í|i)cita", 5],
      ["requisito.*\\bcr\\b", 3]
    ],
    clarify:
      "Sua dúvida é sobre a exigência de renda no requerimento do CR?",
    answer:
      "<em>Renda não é requisito para o CR</em>. O Decreto nº 11.615/2023 exige comprovação de <strong>ocupação lícita</strong> — não de renda ou de rendimentos mínimos. Indeferimento fundado em 'rendimentos insuficientes' merece revisão: o fundamento legal é a ocupação lícita. Matrícula em universidade, isoladamente, não comprova ocupação lícita.<br><br>Se o seu processo foi negado por esse motivo, vale analisar a decisão e as provas apresentadas.",
    steps: [
      "Ler o fundamento do indeferimento e verificar se ele trata de renda",
      "Reunir provas da ocupação lícita exercida",
      "Avaliar recurso ou novo requerimento com fundamentação adequada"
    ],
    source: { label: "Decreto nº 11.615/2023 · conteúdo Advocac", verified: "10/2026" },
    escalateHint: true
  },
  {
    id: "HABITUALIDADE",
    label: "Comprovação de habitualidade",
    patterns: [
      ["habitualidade", 5],
      ["atualiza(ç|c)(ã|a)o de cadastro", 3],
      ["treinamento", 2],
      ["clube de tiro", 3],
      ["comprovante de treino", 3],
      ["n(í|i)vel i", 2]
    ],
    clarify:
      "Sua dúvida é sobre quantos comprovantes precisam, o nível de habitualidade exigido ou como atualizar o cadastro?",
    answer:
      "<em>Habitualidade</em>. A atividade de atirador desportivo exige comprovação periódica de prática de tiro para manutenção do registro — os níveis (I, II e III) determinam frequência e quantidade de comprovantes, além de afetar limites de aquisição.<br><br>Falhas nesse controle são uma das causas mais frequentes de exigências e problemas na renovação.",
    steps: [
      "Confirmar seu nível de atuação atual (I, II ou III)",
      "Organizar os comprovantes de treinamento do período exigido",
      "Manter vínculo com clube/entidade ativo e documentado"
    ],
    source: {
      label: "Regulamento do SINARM · Decreto nº 11.615/2023",
      verified: "08/2026"
    }
  },
  {
    id: "CR_REGISTRO",
    label: "Registro (CR)",
    patterns: [
      ["\\bcr\\b", 4],
      ["registro de arma", 4],
      ["registrar arma", 4],
      ["sinarm", 4],
      ["sinarm-cac", 4],
      ["registro vencido", 4]
    ],
    clarify:
      "É registro novo (primeiro CR), renovação ou transferência de arma já registrada?",
    answer:
      "<em>Registro de arma de fogo (CR)</em>. O registro vincula cada arma ao CAC no sistema da Polícia Federal (SINARM-CAC), com validade própria e renovação periódica.<br><br>Hoje os serviços estão em migração para o <strong>Portal de Serviços da PF</strong> — a renovação de CRAF de CAC já opera lá, e os demais serviços estão sendo incorporados gradualmente. Vale sempre confirmar no sistema vigente qual canal está ativo para o serviço específico do seu caso.",
    steps: [
      "Confirmar situação atual do registro no sistema da PF",
      "Identificar o serviço correto (novo registro, renovação, transferência)",
      "Conferir se o serviço já migrou para o Portal PF"
    ],
    source: { label: "Polícia Federal · Portal de Serviços", verified: "29/07/2026" }
  },
  {
    id: "AQUISICAO_COTA",
    label: "Aquisição e cotas",
    patterns: [
      ["comprar", 3],
      ["aquisi(ç|c)(ã|a)o", 4],
      ["cota", 4],
      ["quantas armas", 3],
      ["adquirir", 4],
      ["guia de tr(â|a)nsito", 2]
    ],
    clarify:
      "Você quer entender quanto pode adquirir conforme seu perfil, ou já está em meio a um requerimento de aquisição?",
    answer:
      "<em>Aquisição de armas/munição</em>. As quantidades dependem do perfil e nível de habitualidade do CAC (atirador, caçador, colecionador — níveis I, II, III), definidas em regulamento.<br><br>O procedimento é requerido junto à Polícia Federal, com autorização prévia <strong>antes</strong> da compra — adquirir sem autorização configura irregularidade grave mesmo para CAC regular.",
    steps: [
      "Confirmar perfil/nível e cota correspondente",
      "Requerer autorização de aquisição antes da compra",
      "Registrar a arma imediatamente após a aquisição"
    ],
    source: {
      label: "Decreto nº 11.615/2023 · Regulamento do SINARM",
      verified: "08/2026"
    }
  },
  {
    id: "TRANSFERENCIA",
    label: "Transferência e mudança",
    patterns: [
      ["transfer(ê|e)ncia", 5],
      ["transferir", 4],
      ["mudei de cidade", 4],
      ["mudan(ç|c)a de estado", 4],
      ["vender arma", 4],
      ["doa(ç|c)(ã|a)o", 3],
      ["heran(ç|c)a", 3]
    ],
    clarify:
      "A transferência é entre CACs, por mudança de endereço, ou envolve venda/doação/herança?",
    answer:
      "<em>Transferências</em>. Existem frentes distintas: transferência de <strong>propriedade</strong> (venda, doação, sucessão) e transferência de <strong>vínculo regional</strong> (mudança de endereço/estado com atualização cadastral na PF).<br><br>Nenhuma delas pode ser feita informalmente: a alteração precisa ser homologada/registrada para que o novo titular conste regularmente no sistema.",
    steps: [
      "Classificar o tipo de transferência (propriedade × endereço)",
      "Reunir documentos das partes envolvidas",
      "Protocolizar o procedimento correspondente na PF"
    ],
    source: {
      label: "Regulamento do SINARM · Decreto nº 11.615/2023",
      verified: "08/2026"
    }
  },
  {
    id: "ACERVO",
    label: "Acervo e coleção",
    patterns: [
      ["acervo", 5],
      ["cole(ç|c)(ã|a)o", 4],
      ["colecionador", 4],
      ["quantidade de armas", 3],
      ["obsoleto", 2]
    ],
    clarify:
      "Sua dúvida envolve limites do acervo, armas obsoletas/antigas ou organização documental do colecionador?",
    answer:
      "<em>Gestão de acervo</em>. O colecionador responde formalmente por todo o acervo listado, com obrigações próprias de catalogação, conservação e comunicação de alterações. Armas obsoletas e peças antigas têm tratamento específico na regulamentação — vale confirmar caso a caso a classificação correta antes de qualquer movimentação.",
    steps: [
      "Manter catálogo do acervo atualizado e conferível",
      "Comunicar à PF qualquer entrada/saída ou alteração relevante",
      "Verificar classificação de itens antigos/obsoletos"
    ],
    source: {
      label: "Regulamento do SINARM · Decreto nº 11.615/2023",
      verified: "08/2026"
    }
  },
  {
    id: "DOCUMENTACAO",
    label: "Documentação exigida",
    patterns: [
      ["documento", 4],
      ["quais papeis", 4],
      ["quais documentos", 5],
      ["psicol(ó|o)gico", 3],
      ["certid(ã|a)o", 3],
      ["comprovante de resid(ê|e)ncia", 3],
      ["capacidade t(é|e)cnica", 3]
    ],
    clarify:
      "Para qual procedimento: renovação, aquisição, recurso ou atualização cadastral?",
    answer:
      "<em>Documentação</em>. Os conjuntos variam por procedimento, mas giram em torno de quatro blocos:<br><br>· identificação e estado civil<br>· residência<br>· capacidade técnica (avaliação no clube)<br>· psicológica (laudo emitido por psicólogo credenciado, quando exigido)<br><br>Erro mais comum: apresentar documento em formato que a PF não aceita — o que gera exigência e atraso. Vale validar a lista exata do seu procedimento antes de protocolar.",
    steps: [
      "Listar os documentos do procedimento específico",
      "Conferir validade e formato aceito de cada um",
      "Digitalizar com boa legibilidade para upload"
    ],
    source: {
      label: "Prática assistencial Advocac · normativos PF",
      verified: "08/2026"
    }
  },
  {
    id: "PORTAL_PF_STATUS",
    label: "Novo Portal PF",
    patterns: [
      ["portal", 4],
      ["novo sistema", 4],
      ["site da pf", 3],
      ["gov\\.?br", 3],
      ["migra(ç|c)(ã|a)o", 3],
      ["como acessar", 2]
    ],
    clarify:
      "Quer saber quais serviços já funcionam no novo portal ou está com dificuldade para concluir algo nele?",
    answer:
      "<em>Status do Portal PF</em>. Conforme comunicação oficial da Polícia Federal, o novo Portal de Serviços começou a operar em <strong>julho de 2026</strong> pela <strong>renovação do CRAF de CACs</strong>. Os demais serviços (aquisição, transferência, registros etc.) estão sendo incorporados em fases.<br><br>Na prática: alguns requerimentos ainda seguem pelos canais anteriores até completarem a migração. Esse cenário muda rápido — é justamente o tipo de status que acompanhamos continuamente.",
    steps: [
      "Confirmar no portal se o serviço desejado já está disponível",
      "Usar conta gov.br com nível adequado de verificação",
      "Diante de erro/falha no sistema, registrar e buscar orientação antes de perder prazo"
    ],
    source: {
      label: "Polícia Federal · comunicado oficial de lançamento",
      verified: "29/07/2026"
    }
  },
  {
    id: "IAT_CREDENCIAMENTO",
    label: "Credenciamento IAT",
    patterns: [
      ["iat", 5],
      ["instrutor", 4],
      ["credenciamento de instrutor", 5],
      ["dar aula de tiro", 3],
      ["curso de tiro", 2]
    ],
    clarify:
      "Você busca entender como funciona o credenciamento de IAT ou quer verificar um instrutor credenciado?",
    answer:
      "<em>Instrutor de Armamento e Tiro (IAT)</em>. O credenciamento de IAT é formalizado pela <strong>Polícia Federal</strong>, que mantém lista pública de profissionais credenciados. A condição de IAT implica responsabilidades específicas na formação de atiradores e nos comprovantes de treinamento usados na habitualidade.",
    steps: [
      "Consultar a lista oficial de IATs credenciados da PF",
      "Conferir requisitos e documentação para o credenciamento",
      "Manter dados cadastrais sempre atualizados"
    ],
    source: { label: "Polícia Federal · credenciamento de IAT", verified: "08/2026" }
  },
  {
    id: "TAXAS_CUSTOS",
    label: "Taxas e custos",
    patterns: [
      ["taxa", 4],
      ["custo", 3],
      ["quanto custa", 5],
      ["valor", 3],
      ["boleto", 3],
      ["pagamento", 2],
      ["gratuito", 2]
    ],
    clarify: "Taxa de qual procedimento: renovação, registro, aquisição ou outro?",
    answer:
      "<em>Taxas</em>. Referência oficial atual para renovação de CRAF de CAC no novo Portal PF: <strong>R$ 88,00 por arma</strong>.<br><br>Outros procedimentos possuem tabelas próprias, e valores podem ser ajustados por norma — por isso cada orçamento do seu processo deve ser confirmado no sistema vigente no momento do requerimento.",
    steps: [
      "Confirmar a taxa vigente no sistema oficial antes de pagar",
      "Guardar o comprovante junto ao processo"
    ],
    source: { label: "Polícia Federal · Portal de Serviços", verified: "29/07/2026" }
  },
  {
    id: "AGENDAMENTO_CONTATO",
    label: "Falar com advogado / agendar",
    patterns: [
      ["advogado", 3],
      ["consultar", 3],
      ["consulta", 3],
      ["agendar", 4],
      ["or(ç|c)amento", 3],
      ["contratar", 4],
      ["falar com algu(é|e)m", 4],
      ["whatsapp", 3],
      ["atendimento humano", 3],
      ["presencial", 2]
    ],
    directHandoff: true,
    clarify: "",
    answer:
      "Perfeito. Vou abrir o WhatsApp da Advocac com um resumo do que você me contou. Envie a mensagem que aparecer — a equipe já recebe o contexto."
  }
];
