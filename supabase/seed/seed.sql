-- ============================================================
-- ADVOCAC — SEED INICIAL (conhecimento verificado 08/2026)
-- Idempotente: usa upsert por id/chave natural.
-- ============================================================

-- ---------- ASSISTANT_RULES (regras críticas) ----------
insert into assistant_rules (name, category, instruction, priority, severity) values
('Não inventar legislação', 'hallucination_prevention', 'Quando não existir fonte confiável na base para sustentar uma afirmação jurídica, não apresentar a informação como fato.', 100, 'critical'),
('Não prometer resultado', 'legal_safety', 'Nunca garantir vitória, indenização, absolvição, prazo ou resultado processual.', 100, 'critical'),
('Identificar urgência', 'triage', 'Quando a situação envolver prazo, intimação, apreensão ou risco de dano imediato, priorizar encaminhamento humano.', 100, 'critical'),
('Manter escopo', 'scope', 'Operar estritamente no escopo jurídico, documental e administrativo do universo CAC. Recusar orientação tática/operacional.', 90, 'high'),
('Informar fonte', 'behavior', 'Indicar fonte e data de verificação em toda informação factual.', 80, 'medium')
on conflict do nothing;

-- ---------- REGULATED_SERVICES (status dos sistemas) ----------
insert into regulated_services (name, description, category, current_system, current_status, official_source, last_verified_at) values
('Renovação de CRAF (CAC)', 'Renovação do registro de CAC', 'CRAF', 'Portal PF', 'active', 'Polícia Federal', '2026-07-29'),
('Aquisição de arma/munição', 'Autorização prévia e aquisição', 'AQUISICAO', 'SINARM-CAC', 'migration', 'Polícia Federal', '2026-07-29'),
('Transferência de arma', 'Transferência de propriedade/vínculo', 'TRANSFERENCIA', 'REGULA CAC / SINARM-CAC', 'migration', 'Polícia Federal · Ofício 9/2026 DELEARM', '2026-06-02'),
('Novo registro (CR)', 'Primeiro registro de arma', 'REGISTRO', 'SINARM-CAC', 'migration', 'Polícia Federal', '2026-07-29')
on conflict do nothing;

-- ---------- KNOWLEDGE_SOURCES ----------
insert into knowledge_sources (name, source_type, authority_level) values
('Polícia Federal', 'GOVERNMENT', 'OFFICIAL'),
('Diário Oficial da União', 'GOVERNMENT', 'OFFICIAL'),
('Advocac (conteúdo editorial)', 'OFFICE', 'FAQ')
on conflict do nothing;

-- ---------- KNOWLEDGE_DOCUMENTS (fatos verificados do feed) ----------
insert into knowledge_documents (title, content, source_label, authority_level, status, valid_from, last_verified_at, verified_by) values
('Novo Portal de Serviços da PF', 'O novo Portal de Serviços da Polícia Federal foi lançado em julho de 2026. A renovação do CRAF de CACs foi o primeiro serviço disponibilizado; os demais estão sendo incorporados em fases. Taxa de referência: R$ 88,00 por arma; processamento estimado de até 60 dias corridos.', 'Polícia Federal · comunicado oficial', 'OFFICIAL', 'active', '2026-07-01', '2026-07-29', 'Advocac'),
('Prazo legal de análise (Lei 9.784/99)', 'Lei nº 9.784/1999, arts. 48-49: decisão em até 30 dias após a instrução, prorrogável por igual período apenas com motivação expressa. Prática da PF: estimativa de 60 dias para renovação de CRAF. Superado o prazo: representação administrativa ou medida judicial (liminares têm fixado 15 dias).', 'Lei nº 9.784/1999', 'OFFICIAL', 'active', '1999-02-01', '2026-08-01', 'Advocac'),
('Progressão de nível (IN 311/25-DG/PF)', 'Art. 7º, II, IN nº 311/25-DG/PF: para progressão de nível, doze treinamentos em clube de tiro e quatro competições (duas de âmbito estadual, distrital, regional ou nacional) a cada doze meses.', 'IN nº 311/25-DG/PF', 'OFFICIAL', 'active', '2025-01-01', '2026-05-08', 'Advocac'),
('CRAF manual (Ofício Circular 9/2026)', 'DELEARM/DREX/SR/PF/RJ: com CRAF manual (transferência entre CACs ou falha de homologação), não ingressar com pedido de CRAF eletrônico. Atualização do SINARM CAC pode levar até 1 mês (REGULA CAC). CRAF no SINARM CAC somente para migração SINARM Defesa Pessoal/SIGMA → acervo CAC.', 'Ofício Circular nº 9/2026/DELEARM/DREX/SR/PF/RJ', 'OFFICIAL', 'active', '2026-06-02', '2026-06-02', 'Advocac'),
('Renda não é requisito para o CR', 'O Decreto nº 11.615/2023 exige comprovação de ocupação lícita — não de renda ou rendimentos mínimos. Indeferimento fundado em "rendimentos insuficientes" merece revisão: o fundamento legal é a ocupação lícita. Matrícula em universidade, isoladamente, não comprova ocupação lícita.', 'Decreto nº 11.615/2023 · conteúdo editorial Advocac', 'OFFICIAL', 'active', '2023-07-01', '2026-10-02', 'Advocac')
on conflict do nothing;

-- ---------- LEGAL_TOPICS (base do atendimento) ----------
insert into legal_topics (id, label, patterns, clarify, answer, steps, docs, source_label, source_verified, direct_handoff, escalate_hint, urgent_if_expired, active, valid_from, last_verified_at) values
(
  'CRAF_RENOVACAO',
  'Renovação de CRAF',
  '[["renovar",3],["renova(ç|c)(ã|a)o",3],["craf",4],["vencendo",2],["venceu",2],["vencendo o craf",4],["portal pf",2]]',
  'Para eu te orientar corretamente: seu registro está vinculado à atividade de <strong>CAC</strong> (caçador, atirador desportivo ou colecionador)?',
  'Entendi: <em>renovação de CRAF</em>. O quadro atual, conforme informação oficial da Polícia Federal:<br><br>A renovação do registro para CACs passou a ser realizada pelo <strong>novo Portal de Serviços da PF</strong>, lançado em julho de 2026 — a renovação do CRAF foi o primeiro serviço disponibilizado, com demais serviços em migração gradual.<br><br>Taxa informada pela PF: <strong>R$ 88,00 por arma</strong>, com processamento estimado de até <strong>60 dias corridos</strong>.',
  '["Acessar o Portal de Serviços da PF com sua conta gov.br","Conferir validade do CRAF e dados do acervo antes de iniciar","Separar documentos pessoais e comprovações da atividade CAC","Se houver exigência ou pendência anterior, resolver antes de protocolar"]',
  '["Documento de identificação","CRAF atual","Comprovantes vinculados à atividade (clube/entidade)"]',
  'Polícia Federal · Portal de Serviços', '29/07/2026',
  false, false, false, true, '2026-07-01', '2026-07-29'
),
(
  'CRAF_VALIDADE_PRAZO',
  'Validade e prazos do CRAF',
  '[["validade",3],["válido",3],["valido",3],["expirou",3],["quantos anos",2],["quanto tempo dura",2],["prazo do craf",3]]',
  'Você quer saber sobre a validade do seu documento atual ou sobre o prazo de processamento de uma renovação já protocolada?',
  'Sobre prazos e validade, dois pontos centrais:<br><br>O <strong>CRAF tem validade limitada</strong> e está vinculado ao mês do seu aniversário — renovar com antecedência evita irregularidade no porte do acervo.<br><br>Já o <strong>processamento</strong> da renovação pelo novo Portal PF tem estimativa oficial de até <strong>60 dias corridos</strong>, com taxa de R$ 88,00 por arma. O prazo legal de decisão (Lei 9.784/99) é de 30 dias, prorrogável apenas com motivação expressa.<br><br>Como seu caso está próximo do vencimento ou já venceu? A conduta recomendada muda conforme a situação.',
  '["Identificar a data exata de validade no documento","Se ainda válido: renovar com antecedência pelo Portal PF","Se vencido: tratar como prioridade para regularizar o acervo"]',
  null,
  'Polícia Federal · Portal de Serviços', '29/07/2026',
  false, false, true, true, '2026-07-01', '2026-07-29'
),
(
  'EXIGENCIA_PF',
  'Exigência no processo',
  '[["exig(ê|e)ncia",5],["exigencia",5],["pend(ê|e)ncia",3],["pediu documenta",3],["faltou documento",3],["em exame",2],["an(á|a)lise",1]]',
  'A exigência chegou pelo Portal PF/SINARM-CAC? Você consegue me dizer qual documento ou informação eles estão pedindo?',
  '<em>Exigência em processo administrativo</em>. Situação comum e normalmente solucionável — o processo fica <strong>suspenso até o cumprimento</strong>, e o ponto crítico é o prazo de atendimento.<br><br>O caminho seguro é: identificar exatamente o que foi pedido, verificar se o documento precisa de versão específica (por exemplo, avaliação psicológica em formato aceito pela PF) e protocolar a resposta corretamente pelo sistema onde o requerimento corre.',
  '["Ler a exigência e listar item por item o que foi solicitado","Conferir se cada documento atende ao formato/exigência da PF","Protocolar resposta dentro do prazo indicado no sistema","Guardar o recibo do protocolo"]',
  '["Inteiro teor da exigência","Documentos solicitados"]',
  'Prática processual · SINARM-CAC / Portal PF', '08/2026',
  false, true, false, true, '2026-01-01', '2026-08-01'
),
(
  'RENDA_CR',
  'Renda e requisitos do CR',
  '[["renda",5],["rendimento",5],["sal(á|a)rio",4],["capacidade financeira",4],["ocupa(ç|c)(ã|a)o l(í|i)cita",5],["requisito.*\\bcr\\b",3]]',
  'Sua dúvida é sobre a exigência de renda no requerimento do CR?',
  '<em>Renda não é requisito para o CR</em>. O Decreto nº 11.615/2023 exige comprovação de <strong>ocupação lícita</strong> — não de renda ou de rendimentos mínimos. Indeferimento fundado em "rendimentos insuficientes" merece revisão: o fundamento legal é a ocupação lícita. Matrícula em universidade, isoladamente, não comprova ocupação lícita.<br><br>Se o seu processo foi negado por esse motivo, vale analisar a decisão e as provas apresentadas.',
  '["Ler o fundamento do indeferimento e verificar se ele trata de renda","Reunir provas da ocupação lícita exercida","Avaliar recurso ou novo requerimento com fundamentação adequada"]',
  null,
  'Decreto nº 11.615/2023 · conteúdo Advocac', '10/2026',
  false, true, false, true, '2026-10-02', '2026-10-02'
),
(
  'INDEFERIMENTO_RECURSO',
  'Indeferimento e recurso',
  '[["indenferido",5],["indeferido",5],["negado",4],["negaram",3],["recorrer",4],["recurso",3],["cancelaram",3]]',
  'O indeferimento saiu para renovação, aquisição ou outro tipo de requerimento? E você já sabe se consta prazo para apresentar recurso?',
  '<em>Processo indeferido.</em> Importante: indeferimento <strong>não é sentença definitiva</strong> — em regra cabe apresentar recurso ou novo requerimento, conforme o fundamento da decisão e os prazos do procedimento.<br><br>O que define a estratégia é o <strong>motivo</strong> apontado na decisão (documentação insuficiente, restrição cadastral, questão técnica). Renda <strong>não é requisito</strong> para o CR: o Decreto 11.615/23 exige ocupação lícita, não rendimentos.',
  '["Obter a íntegra da decisão com os fundamentos","Mapear o prazo recursal a partir da ciência","Levantar provas/documentos que afastam o motivo apontado","Protocolar recurso fundamentado dentro do prazo"]',
  '["Decisão (inteiro teor)","Documentos que contrariam o fundamento"]',
  'Prática processual · Lei nº 10.826/2003 e normativos SFPC', '08/2026',
  false, true, false, true, '2026-01-01', '2026-08-01'
),
(
  'HABITUALIDADE',
  'Comprovação de habitualidade',
  '[["habitualidade",5],["atualiza(ç|c)(ã|a)o de cadastro",3],["treinamento",2],["clube de tiro",3],["comprovante de treino",3],["n(í|i)vel i",2]]',
  'Sua dúvida é sobre quantos comprovantes precisam, o nível de habitualidade exigido ou como atualizar o cadastro?',
  '<em>Habitualidade</em>. A atividade de atirador desportivo exige comprovação periódica de prática de tiro para manutenção do registro — os níveis (I, II e III) determinam frequência e quantidade de comprovantes, além de afetar limites de aquisição. Para progressão de nível, a IN 311/25-DG/PF exige 12 treinamentos e 4 competições (2 de âmbito estadual ou superior) a cada 12 meses.<br><br>Falhas nesse controle são uma das causas mais frequentes de exigências e problemas na renovação.',
  '["Confirmar seu nível de atuação atual (I, II ou III)","Organizar os comprovantes de treinamento do período exigido","Manter vínculo com clube/entidade ativo e documentado"]',
  null,
  'IN nº 311/25-DG/PF · regulamento do SINARM', '08/2026',
  false, false, false, true, '2026-01-01', '2026-08-01'
),
(
  'CR_REGISTRO',
  'Registro (CR)',
  '[["\\bcr\\b",4],["registro de arma",4],["registrar arma",4],["sinarm",4],["sinarm-cac",4],["registro vencido",4]]',
  'É registro novo (primeiro CR), renovação ou transferência de arma já registrada?',
  '<em>Registro de arma de fogo (CR)</em>. O registro vincula cada arma ao CAC no sistema da Polícia Federal (SINARM-CAC), com validade própria e renovação periódica.<br><br>Hoje os serviços estão em migração para o <strong>Portal de Serviços da PF</strong> — a renovação de CRAF de CAC já opera lá, e os demais serviços estão sendo incorporados gradualmente. Vale sempre confirmar no sistema vigente qual canal está ativo para o serviço específico do seu caso.',
  '["Confirmar situação atual do registro no sistema da PF","Identificar o serviço correto (novo registro, renovação, transferência)","Conferir se o serviço já migrou para o Portal PF"]',
  null,
  'Polícia Federal · Portal de Serviços', '29/07/2026',
  false, false, false, true, '2026-07-01', '2026-07-29'
),
(
  'AQUISICAO_COTA',
  'Aquisição e cotas',
  '[["comprar",3],["aquisi(ç|c)(ã|a)o",4],["cota",4],["quantas armas",3],["adquirir",4],["guia de tr(â|a)nsito",2]]',
  'Você quer entender quanto pode adquirir conforme seu perfil, ou já está em meio a um requerimento de aquisição?',
  '<em>Aquisição de armas/munição</em>. As quantidades dependem do perfil e nível de habitualidade do CAC (atirador, caçador, colecionador — níveis I, II, III), definidas em regulamento.<br><br>O procedimento é requerido junto à Polícia Federal, com autorização prévia <strong>antes</strong> da compra — adquirir sem autorização configura irregularidade grave mesmo para CAC regular. A <strong>efetiva necessidade</strong> bem fundamentada é pré-requisito e aumenta as chances de deferimento.',
  '["Confirmar perfil/nível e cota correspondente","Requerer autorização de aquisição antes da compra","Registrar a arma imediatamente após a aquisição"]',
  null,
  'Decreto nº 11.615/2023 · Regulamento do SINARM', '08/2026',
  false, false, false, true, '2026-01-01', '2026-08-01'
),
(
  'TRANSFERENCIA',
  'Transferência e mudança',
  '[["transfer(ê|e)ncia",5],["transferir",4],["mudei de cidade",4],["mudan(ç|c)a de estado",4],["vender arma",4],["doa(ç|c)(ã|a)o",3],["heran(ç|c)a",3],["craf manual",4]]',
  'A transferência é entre CACs, por mudança de endereço, ou envolve venda/doação/herança?',
  '<em>Transferências</em>. Existem frentes distintas: transferência de <strong>propriedade</strong> (venda, doação, sucessão) e transferência de <strong>vínculo regional</strong> (mudança de endereço/estado).<br><br>Atenção ao CRAF manual (Ofício Circular 9/2026/DELEARM): com CRAF manual em mãos <strong>não se protocola pedido de CRAF eletrônico</strong>. A arma consta transferida no REGULA CAC e a sincronização do SINARM pode levar até 1 mês — sem sincronização, abrir chamado corretivo junto ao órgão central.',
  '["Classificar o tipo de transferência (propriedade × endereço)","Reunir documentos das partes envolvidas","Verificar se há CRAF manual envolvido e seguir o Ofício 9/2026","Protocolizar o procedimento correspondente na PF"]',
  null,
  'Ofício Circular nº 9/2026/DELEARM · regulamento do SINARM', '02/06/2026',
  false, false, false, true, '2026-06-02', '2026-06-02'
),
(
  'ACERVO',
  'Acervo e coleção',
  '[["acervo",5],["cole(ç|c)(ã|a)o",4],["colecionador",4],["quantidade de armas",3],["obsoleto",2]]',
  'Sua dúvida envolve limites do acervo, armas obsoletas/antigas ou organização documental do colecionador?',
  '<em>Gestão de acervo</em>. O colecionador responde formalmente por todo o acervo listado, com obrigações próprias de catalogação, conservação e comunicação de alterações. Armas obsoletas e peças antigas têm tratamento específico na regulamentação — vale confirmar caso a caso a classificação correta antes de qualquer movimentação.',
  '["Manter catálogo do acervo atualizado e conferível","Comunicar à PF qualquer entrada/saída ou alteração relevante","Verificar classificação de itens antigos/obsoletos"]',
  null,
  'Regulamento do SINARM · Decreto nº 11.615/2023', '08/2026',
  false, false, false, true, '2026-01-01', '2026-08-01'
),
(
  'DOCUMENTACAO',
  'Documentação exigida',
  '[["documento",4],["quais papeis",4],["quais documentos",5],["psicol(ó|o)gico",3],["certid(ã|a)o",3],["comprovante de resid(ê|e)ncia",3],["capacidade t(é|e)cnica",3]]',
  'Para qual procedimento: renovação, aquisição, recurso ou atualização cadastral?',
  '<em>Documentação</em>. Os conjuntos variam por procedimento, mas giram em torno de quatro blocos:<br><br>· identificação e estado civil<br>· residência<br>· capacidade técnica (avaliação no clube)<br>· psicológica (laudo emitido por psicólogo credenciado, quando exigido)<br><br>Erro mais comum: apresentar documento em formato que a PF não aceita — o que gera exigência e atraso. Para CAC, a PF exige comprovação de <strong>ocupação lícita</strong> — renda não é requisito legal.',
  '["Listar os documentos do procedimento específico","Conferir validade e formato aceito de cada um","Digitalizar com boa legibilidade para upload"]',
  null,
  'Prática assistencial Advocac · normativos PF', '08/2026',
  false, false, false, true, '2026-01-01', '2026-08-01'
),
(
  'PORTAL_PF_STATUS',
  'Novo Portal PF',
  '[["portal",4],["novo sistema",4],["site da pf",3],["gov\\.?br",3],["migra(ç|c)(ã|a)o",3],["como acessar",2]]',
  'Quer saber quais serviços já funcionam no novo portal ou está com dificuldade para concluir algo nele?',
  '<em>Status do Portal PF</em>. Conforme comunicação oficial da Polícia Federal, o novo Portal de Serviços começou a operar em <strong>julho de 2026</strong> pela <strong>renovação do CRAF de CACs</strong>. Os demais serviços (aquisição, transferência, registros etc.) estão sendo incorporados em fases. No lançamento houve lentidão por milhões de acessos simultâneos.<br><br>Na prática: alguns requerimentos ainda seguem pelos canais anteriores até completarem a migração.',
  '["Confirmar no portal se o serviço desejado já está disponível","Usar conta gov.br com nível adequado de verificação","Diante de erro/falha no sistema, registrar e buscar orientação antes de perder prazo"]',
  null,
  'Polícia Federal · comunicado oficial de lançamento', '29/07/2026',
  false, false, false, true, '2026-07-01', '2026-07-29'
),
(
  'IAT_CREDENCIAMENTO',
  'Credenciamento IAT',
  '[["iat",5],["instrutor",4],["credenciamento de instrutor",5],["dar aula de tiro",3],["curso de tiro",2]]',
  'Você busca entender como funciona o credenciamento de IAT ou quer verificar um instrutor credenciado?',
  '<em>Instrutor de Armamento e Tiro (IAT)</em>. O credenciamento de IAT é formalizado pela <strong>Polícia Federal</strong>, que mantém lista pública de profissionais credenciados. A condição de IAT implica responsabilidades específicas na formação de atiradores e nos comprovantes de treinamento usados na habitualidade.',
  '["Consultar a lista oficial de IATs credenciados da PF","Conferir requisitos e documentação para o credenciamento","Manter dados cadastrais sempre atualizados"]',
  null,
  'Polícia Federal · credenciamento de IAT', '08/2026',
  false, false, false, true, '2026-01-01', '2026-08-01'
),
(
  'TAXAS_CUSTOS',
  'Taxas e custos',
  '[["taxa",4],["custo",3],["quanto custa",5],["valor",3],["boleto",3],["pagamento",2],["gratuito",2]]',
  'Taxa de qual procedimento: renovação, registro, aquisição ou outro?',
  '<em>Taxas</em>. Referência oficial atual para renovação de CRAF de CAC no novo Portal PF: <strong>R$ 88,00 por arma</strong>.<br><br>Outros procedimentos possuem tabelas próprias, e valores podem ser ajustados por norma — por isso cada orçamento do seu processo deve ser confirmado no sistema vigente no momento do requerimento.',
  '["Confirmar a taxa vigente no sistema oficial antes de pagar","Guardar o comprovante junto ao processo"]',
  null,
  'Polícia Federal · Portal de Serviços', '29/07/2026',
  false, false, false, true, '2026-07-01', '2026-07-29'
),
(
  'AGENDAMENTO_CONTATO',
  'Falar com advogado / agendar',
  '[["advogado",3],["consultar",3],["consulta",3],["agendar",4],["or(ç|c)amento",3],["contratar",4],["falar com algu(é|e)m",4],["whatsapp",3],["atendimento humano",3],["presencial",2]]',
  '',
  'Perfeito. O caminho direto é o WhatsApp comercial da Advocac — a partir dele a equipe avalia seu caso e orienta os próximos passos. Posso montar um resumo do que você me contou para agilizar o primeiro contato?',
  null, null,
  null, null,
  true, false, false, true, '2026-01-01', null
)
on conflict (id) do update set
  label = excluded.label,
  patterns = excluded.patterns,
  clarify = excluded.clarify,
  answer = excluded.answer,
  steps = excluded.steps,
  docs = excluded.docs,
  source_label = excluded.source_label,
  source_verified = excluded.source_verified,
  direct_handoff = excluded.direct_handoff,
  escalate_hint = excluded.escalate_hint,
  urgent_if_expired = excluded.urgent_if_expired,
  active = excluded.active,
  last_verified_at = excluded.last_verified_at,
  updated_at = now();
