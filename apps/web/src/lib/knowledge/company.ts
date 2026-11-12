export const companyProfile = {
  name: "Advocac",
  instagram: "@advocac_",
  whatsapp: "+55 11 93229-0927",
  positioning: "Assessoria de atirador para atirador",
  category: "Advogado · CAC · Instrutor de Armamento e Tiro (IAT)",
  pitch:
    "Assessoria jurídica e documental especializada no universo dos CACs — Caçadores, Atiradores Desportivos e Colecionadores — com atuação em processos administrativos junto à Polícia Federal.",
  differential:
    "Quem atende o CAC entende o ecossistema por dentro: CRAF, CR, habitualidade, SINARM-CAC, Portal PF, processos administrativos. De atirador para atirador.",
  scope: [
    "CRAF: renovação, validade, prazos, exigências e indeferimentos",
    "CR (Certificado de Registro): novo registro, renovação, cancelamento",
    "Habitualidade: níveis I, II e III, comprovantes e atualização de cadastro",
    "Aquisição de armas e munição: cotas, autorizações e guias de trânsito",
    "Transferências: propriedade, mudança de estado, sucessão",
    "Acervo e coleção: catalogação, obrigações e itens obsoletos",
    "Processos administrativos na Polícia Federal (SINARM-CAC e Portal PF)",
    "Recursos administrativos e ações judiciais (liminares contra demora e indeferimento)",
    "Documentação: certidões, residência, capacidade técnica e avaliação psicológica",
    "Credenciamento e obrigações de IAT (Instrutor de Armamento e Tiro)"
  ],
  states: "Atuação em múltiplos estados (SP, RJ, MG e demais SFPCs, conforme o caso)",
  ethics:
    "O escritório não promete resultado: o requerimento é analisado por Delegado da Polícia Federal. Cabe ao escritório o esforço de um bom trabalho, bem fundamentado.",
  toneOfVoice: [
    "Direto e assertivo, sem juridiquês desnecessário",
    "Técnico mas acessível — o público CAC conhece os termos",
    "Educativo: explica procedimento, prazo e documento",
    "Alerta preventivo: 'não espere o indeferimento'",
    "Sem emojis, sem promessa de resultado, sem número inventado"
  ]
};

export const companyFacts: Array<{
  id: string;
  title: string;
  content: string;
  source: string;
  verified: string;
}> = [
  {
    id: "FATO_PORTAL_PF",
    title: "Novo Portal de Serviços da PF",
    content:
      "O novo Portal de Serviços da Polícia Federal foi lançado em julho de 2026 (data prevista: 12/07/2026). A renovação do CRAF de CACs foi o primeiro serviço disponibilizado; os demais (aquisição, transferência, registro) estão sendo incorporados em fases. No lançamento houve lentidão decorrente de milhões de acessos simultâneos, mas o sistema foi bem avaliado. Taxa de referência da renovação: R$ 88,00 por arma, com processamento estimado de até 60 dias corridos.",
    source: "Polícia Federal · comunicado oficial + acompanhamento Advocac",
    verified: "07/2026"
  },
  {
    id: "FATO_PRAZO_LEGAL",
    title: "Prazo legal de análise: 30 dias (Lei 9.784/99)",
    content:
      "No plano infraconstitucional, a Lei nº 9.784/1999 (processo administrativo federal) estabelece no art. 48 o dever da autoridade de decidir, e no art. 49 o prazo de até 30 (trinta) dias para a decisão após a instrução, admitida prorrogação por igual período apenas com motivação expressa. Na prática, a PF costuma divulgar estimativa de até 60 dias para renovação de CRAF no Portal PF. Superados os prazos sem decisão, existem caminhos: representação administrativa e/ou medida judicial — os tribunais têm concedido liminares fixando prazo de 15 dias para a PF decidir.",
    source: "Lei nº 9.784/1999, arts. 48-49 · prática processual Advocac",
    verified: "08/2026"
  },
  {
    id: "FATO_LIMINARES",
    title: "Liminares: resultados reais do escritório",
    content:
      "A Advocac atua com medidas judiciais contra a demora da PF e contra indeferimentos. Resultados divulgados no perfil: liminar da Justiça Federal de Minas Gerais obrigando a PF a analisar processo de CAC em 15 dias; liminares na JF de São Paulo (incluindo Campinas/SP) destravando CRAF; atraso na PF/BH/MG resolvido em menos de 20 dias (liminar concedida em 23/04/2026, aquisição liberada em 08/05/2026); CRAF emitido após 8 meses de espera destravado em ação judicial; duas liminares concedidas em um único dia (08/06/2026).",
    source: "Conteúdo editorial Advocac · decisões judiciais",
    verified: "06/2026"
  },
  {
    id: "FATO_PROGRESSAO_NIVEL",
    title: "Progressão de nível do atirador (IN 311/25-DG/PF)",
    content:
      "A progressão de nível do atirador desportivo (ex.: nível 1 para nível 2) exige, conforme o art. 7º, II, da IN nº 311/25-DG/PF: doze treinamentos em clube de tiro e quatro competições — das quais duas de âmbito estadual, distrital, regional ou nacional — a cada doze meses. Cumpridos os requisitos com documentação correta, a PF defere a alteração de nível. Os níveis estão diretamente ligados às habitualidades e sua progressão exige atenção; subir de nível traz vantagens além do aumento de acervo.",
    source: "IN nº 311/25-DG/PF, art. 7º, II · decisão administrativa divulgada",
    verified: "05/2026"
  },
  {
    id: "FATO_CRAF_ANIVERSARIO",
    title: "CRAF vence no mês do aniversário",
    content:
      "A validade do CRAF está vinculada ao mês de aniversário do titular. Quem faz aniversário em agosto, por exemplo, pode ter o CRAF vencendo nesse mês — e deve renovar o quanto antes pelo Portal PF para não ficar irregular.",
    source: "Conteúdo editorial Advocac · regulamento vigente",
    verified: "08/2026"
  },
  {
    id: "FATO_HABITUALIDADE",
    title: "Habitualidade: manutenção do CR e renovação do CRAF",
    content:
      "As habitualidades (comprovantes de prática de tiro) representam um dos requisitos para a manutenção do CR e para a renovação do CRAF. Os níveis de atirador (I, II e III) determinam frequência e quantidade de comprovantes. Falhas nesse controle geram exigências, podem levar ao cancelamento do registro e travam a progressão de nível.",
    source: "Conteúdo editorial Advocac · regulamento vigente",
    verified: "08/2026"
  },
  {
    id: "FATO_CR_CANCELAMENTO",
    title: "O CR pode ser cancelado",
    content:
      "O Certificado de Registro pode ser cancelado — e a maioria dos CACs não sabe o porquê. Motivos típicos: falta de comprovação de habitualidade, descumprimento de exigências, irregularidades cadastrais e erros de interpretação da legislação — que, em casos extremos, podem custar não só o CR mas a liberdade do titular. A prevenção é organização documental e resposta a exigências dentro do prazo.",
    source: "Conteúdo editorial Advocac",
    verified: "08/2026"
  },
  {
    id: "FATO_CRAF_MANUAL",
    title: "CRAF manual: como a PF orienta (Ofício Circular 9/2026)",
    content:
      "Segundo o Ofício Circular nº 9/2026/DELEARM/DREX/SR/PF/RJ: em caso de CRAF manual (transferência entre CACs ou falha de homologação), o proprietário NÃO deve ingressar com pedido de CRAF eletrônico usando o CRAF manual. Em transferência, a arma já consta transferida no CRAF dentro do sistema REGULA CAC, e a atualização do SINARM CAC pode levar até 1 mês para sincronizar. A geração de CRAF diretamente no SINARM CAC só deve ocorrer para casos de transferência na migração de arma do SINARM Defesa Pessoal ou SIGMA para o acervo CAC. Existe ainda protocolo 'manual' por e-mail para casos específicos.",
    source: "Ofício Circular nº 9/2026/DELEARM/DREX/SR/PF/RJ",
    verified: "02/06/2026"
  },
  {
    id: "FATO_INDEFERIMENTO_COMUM",
    title: "Renda não é requisito para o CR",
    content:
      "O Decreto nº 11.615/2023 exige comprovação de ocupação lícita — não de renda ou de rendimentos mínimos. Indeferimento fundado em 'rendimentos insuficientes' merece revisão: o fundamento legal é a ocupação lícita. Exemplo real de despacho no SINARM CAC: 'Não comprovou atividade lícita com rendimentos suficientes... Se limitou a apresentar matrícula em Universidade.' Matrícula em universidade, isoladamente, não comprova ocupação lícita; o requerimento deve demonstrar ocupação lícita e idoneidade com provas robustas, sem transformar renda em requisito que a norma não prevê.",
    source: "Decreto nº 11.615/2023 · conteúdo editorial Advocac",
    verified: "10/2026"
  },
  {
    id: "FATO_EFETIVA_NECESSIDADE",
    title: "Efetiva necessidade",
    content:
      "A efetiva necessidade é pré-requisito para as modalidades de aquisição/posse defendidas. Um requerimento bem fundamentado — com prova concreta da necessidade — aumenta as chances de deferimento na análise do Delegado.",
    source: "Conteúdo editorial Advocac",
    verified: "08/2026"
  },
  {
    id: "FATO_ETICA_RESULTADO",
    title: "Posicionamento ético sobre resultado",
    content:
      "O requerimento de posse/registro é sujeito à análise de um Delegado de Polícia Federal — só ele dita o resultado. Ao escritório cabe o esforço de um bom trabalho: fundamentação técnica, documentação completa e acompanhamento processual. 'Não há garantia de sucesso, mas há consistência de resultados, fruto de um trabalho bem desenvolvido em favor dos CACs.' Nenhuma garantia de resultado é oferecida.",
    source: "Conteúdo editorial Advocac",
    verified: "08/2026"
  },
  {
    id: "FATO_IAT",
    title: "IAT — Instrutor de Armamento e Tiro",
    content:
      "O titular da Advocac é Instrutor de Armamento e Tiro (IAT) credenciado pela Polícia Federal. O credenciamento de IAT é formalizado pela PF, que mantém lista pública de profissionais. A condição de IAT implica responsabilidades na formação de atiradores e nos comprovantes de treinamento usados na habitualidade.",
    source: "Perfil @advocac_ · Polícia Federal (credenciamento IAT)",
    verified: "08/2026"
  },
  {
    id: "FATO_MITOS",
    title: "Mitos e datas do universo CAC",
    content:
      "'Tirar o CAC' não existe: o que existe é registro (CR/CRAF) junto à Polícia Federal — desconfie de quem promete 'tirar CAC'. 15 de maio é o dia do armamentista no Brasil. Regras de segurança existem para serem seguidas — seu descumprimento pode gerar responsabilização civil e criminal.",
    source: "Conteúdo editorial Advocac",
    verified: "08/2026"
  }
];

export function buildKnowledgeContext(): string {
  const facts = companyFacts
    .map((f) => `[${f.title}] (Fonte: ${f.source} · verificado em ${f.verified})\n${f.content}`)
    .join("\n\n");

  return `PERFIL DA EMPRESA
${companyProfile.name} — ${companyProfile.positioning}
${companyProfile.category}
${companyProfile.pitch}
Diferencial: ${companyProfile.differential}
Escopo de atuação:
${companyProfile.scope.map((s) => `- ${s}`).join("\n")}

BASE DE FATOS VERIFICADOS
${facts}`;
}
