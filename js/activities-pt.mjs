// Math Trail — Brazilian-Portuguese overlay for the activity catalog.
// Same ids as ACTIVITIES; only display fields (no engine fields).
export const ACTIVITIES_PT = {

// ════════ SUBITIZAÇÃO ════════
dice_flash:{ name:'Flash de Dado', teaches:['Subitização'],
  materials:'🎲 1 dado',
  levels:{1:'Role de novo até sair só faces 1–3',2:'Aceite faces 1–4 (role de novo os 5 e 6)',3:'Todas as faces 1–6 — desafio completo'},
  layout:
`  Role o dado deitado na mesa.
  ┌───────┐
  │ • • • │  ← exemplo: 3 pontos
  │   •   │
  │ • • • │
  └───────┘
  Veja todo o padrão de pontos de uma vez!`,
  script:[
    "Role UM dado na mesa.",
    "Diga: 'Olha! O que você vê?' — espere 2 segundos.",
    "Sem dicas — deixe os olhinhos dela reconhecerem o padrão.",
    "Se ela responder: 'Isso! [X]! Você viu tão rápido!'",
    "Role de novo. Nova face — novo flash. 4–5 rolagens no total."],
  camo_script:[
    "Role o dado: 'Um monstrinho dorminhoco acordou com pintinhas!'",
    "'Quantas pintinhas antes de ele voltar a dormir?'",
    "Comemore com um rugido. Role de novo.",
    "'Novo monstro! Quantas pintinhas desta vez?'"]},

dino_flash:{ name:'Flash de Grupo de Dinos', teaches:['Subitização'],
  materials:'🦕 3–6 dinos (uma cor) + 1 tigela',
  levels:{1:'Grupos de 2–3 dinos',2:'Grupos de 4 (formato quadrado)',3:'Grupos de 5–6 (formato X · duas fileiras de 3)'},
  layout:
`  Junte os dinos num grupo bem juntinho:
  🦕 🦕       🦕 🦕 🦕
  🦕 🦕   ou     🦕
  (4 = quadrado) (5 = formato X)
  Cubra com a tigela → levante rápido!`,
  script:[
    "Escolha dinos da MESMA cor (veja o nível de hoje).",
    "Junte num grupo bem juntinho: quadrado (4) ou X (5).",
    "Cubra com uma tigela virada para baixo. Diga: 'Preparada?'",
    "Levante a tigela rápido. Espere 2 segundos em silêncio.",
    "Sem contar em voz alta — ela vê a forma inteira!",
    "Diga: 'Isso! [X] dinos — que nem um [quadrado/estrela]!'"],
  camo_script:[
    "Diga: 'A turma dos dinos está escondida na caverna!'",
    "Cubra: 'Shhh — todos lá dentro!'",
    "Levante rápido: 'A turma saiu!'",
    "'Quantos na turma?' — espere, sem dicas.",
    "Comemore: 'A turma inteira está aqui!'"]},

build_match:{ name:'Monte e Combine', teaches:['Subitização','Um a mais / Um a menos'],
  materials:'🔵 Cubos de encaixe (10 por cor × 7 cores)',
  levels:{1:'Bastões de 2–4 cubos',2:'Bastões de 4–6 cubos',3:'Bastões de 6–8 + "monte um A MAIS que o meu"'},
  layout:
`  Você monta:  🟦🟦🟦🟦  (4 cubos)
  Ela copia:   🟩🟩🟩🟩  (qualquer cor, mesma quantidade)
  Alinhe lado a lado para comparar:
  ══════════ mesmo tamanho? ══════════`,
  script:[
    "Monte um bastão de cubos de uma cor (nível de hoje).",
    "Diga: 'Você consegue montar um igualzinho ao meu?'",
    "Ela monta o dela — com as cores que quiser.",
    "Alinhe os dois lado a lado.",
    "Diga: 'Eles combinam? Mesmo tamanho?'",
    "Se não bater: 'O meu tem [X], o seu tem [Y] — some ou tire!'"],
  camo_script:[
    "Diga: 'Dois trens precisam combinar para a corrida!'",
    "Monte: 'Meu trem está pronto — monte o seu!'",
    "Alinhe: 'Estão parelhos na linha de largada?'",
    "Ajuste: 'Combinação perfeita! A corrida começa agora!'"]},

five_frame:{ name:'Grade do Cinco', teaches:['Subitização','Quadro do cinco'],
  materials:'📄 Papel + caneta + 🦕 dinos ou cubos',
  levels:{1:'Preencha e conte 1–5 juntos',2:'Pergunte: quantos PREENCHIDOS? quantos VAZIOS?',3:'Mostre rápido — ela diz o número sem contar'},
  layout:
`  Desenhe no papel (30 seg):
  ┌──┬──┬──┬──┬──┐
  │🦕│🦕│🦕│  │  │  ← 3 preenchidos
  └──┴──┴──┴──┴──┘
  "Quantos dinos? Quantas
   salas vazias sobraram?"`,
  script:[
    "Desenhe uma fileira de 5 caixinhas — o quadro do cinco.",
    "Coloque alguns dinos, um por caixinha, da esquerda para a direita.",
    "Pergunte: 'Quantos dinos tem no quadro?'",
    "Depois: 'Quantas caixinhas vazias sobraram?'",
    "Mude a quantidade. Repita 4–5 rodadas.",
    "No Nível 3: cubra, levante rápido — sem contar!"],
  camo_script:[
    "Diga: 'Este é o hotel dos dinos — 5 quartos!'",
    "'Alguns hóspedes chegaram — quantos?'",
    "'Quantos quartos ainda estão vazios?'",
    "'Chegaram novos hóspedes!' — mude e repita."]},

// ════════ CONTAGEM 6–10 (foco atual) ════════
long_row_count:{ name:'Contar 6–10: Fila · Círculo · Espalhado', teaches:['Contagem um a um','Contagem 6–10'],
  materials:'🔵 6–10 cubos de encaixe (uma cor)',
  levels:{1:'FILA reta de 6–10 — toque em cada cubo (ela manda nessa!)',2:'CÍRCULO de 6–10 — marque onde começou!',3:'Monte ESPALHADO — ela afasta cada cubo conforme conta'},
  layout:
`  N1 Fila:   🟦🟦🟦🟦🟦🟦🟦🟦
  N2 Círculo:   🟦 🟦
             🟦      🟦
                🟦 🟦
  N3 Espalhado: 🟦  🟦    🟦
                🟦   🟦  🟦
  Mesmos cubos — formas mais difíceis!`,
  script:[
    "Arrume os cubos para o nível de hoje: fila, círculo ou espalhados.",
    "FILA: toque em cada cubo da esquerda para a direita ao contar.",
    "CÍRCULO: escolha um cubo para começar e LEMBRE dele — pare quando voltar!",
    "ESPALHADO: afaste cada cubo conforme conta — nenhum cubo contado duas vezes.",
    "Se ela pular ou repetir: 'Hmm, vamos tentar mais devagar.'",
    "Pergunta principal no fim: 'Como a gente SABE que contou todos?'"],
  camo_script:[
    "Diga: 'A tempestade espalhou os vagões do trem dos dinos!'",
    "'Coloque cada vagão de volta no trilho conforme conta!'",
    "Círculo: 'Os vagões fizeram um trilho redondo — onde o trem começou?'",
    "'O trem está completo — [X] vagões! Piui piui!'"]},

number_line:{ name:'Reta Numérica 0–10', teaches:['Numerais escritos','Ordem dos números'],
  materials:'📄 Quadradinhos de papel com os números 0–10 escritos',
  levels:{1:'Coloque as cartas 1–5 em ordem',2:'Coloque 0–10 em ordem juntos',3:'Ela ordena 0–10 sozinha — depois esconda um: qual sumiu?'},
  layout:
`  Escreva números em quadradinhos de papel:
  [0][1][2][3][4][5][6][7][8][9][10]
  Embaralhe → ela coloca em ordem.
  Depois: esconda um — "qual sumiu?"`,
  script:[
    "Escreva 0–10 em quadradinhos de papel (nível de hoje).",
    "Embaralhe eles na mesa.",
    "Diga: 'Vamos montar a estrada dos números — em ordem!'",
    "Comece do ZERO — 'zero quer dizer nenhum!'",
    "Contem juntos ao longo da linha pronta, tocando em cada um.",
    "Nível 3: ela fecha os olhos, você esconde um — 'qual sumiu?'"],
  camo_script:[
    "Diga: 'A estrada dos números quebrou em pedaços!'",
    "'Ajude os dinos a reconstruir — em ordem!'",
    "'Agora leve o dino andando pela estrada: 0, 1, 2...'",
    "'Ah não, roubaram um pedaço! Qual?'"]},

thinking_questions:{ name:'Detetive dos Números', teaches:['Ordinais','Inclusão de classe'],
  materials:'🦕 8–10 dinos (mistura de 2 cores, ex.: 6 azuis + 2 amarelos)',
  levels:{1:'"Me mostra o 3º / o 5º dino"',2:'"Me mostra o 8º" numa fila de 8–10',3:'"Mais dinos AZUIS... ou mais DINOS?"'},
  layout:
`  Fila de 8 dinos:
  🦕🦕🦕🦕🦕🦕🦕🦕
  "Me mostra o 8º dino!"  (ordinal)
  Mistura: 6 azuis + 2 amarelos:
  "Mais dinos AZUIS... ou mais DINOS?"`,
  script:[
    "Enfileire 8–10 dinos numa fila.",
    "Pergunte: 'Me mostra o PRIMEIRO dino... o TERCEIRO...'",
    "Nível 2: 'Me mostra o 8º dino!' — deixe ela contar até ele.",
    "Nível 3: use 6 azuis + 2 amarelos juntos.",
    "Pergunte: 'Tem mais dinos AZUIS ou mais DINOS?'",
    "Seja qual for a resposta: 'Como você sabe?' — sem pressa para corrigir."],
  camo_script:[
    "Diga: 'Você é a detetive dos dinos!'",
    "'Encontre o suspeito número 3 na fila!'",
    "'Agora encontre o suspeito número 8!'",
    "'Mistério final: mais dinos azuis ou mais dinos?'"]},

// ════════ UM A MAIS / UM A MENOS ════════
one_more_tower:{ name:'Torre do Um a Mais', teaches:['Um a mais / Um a menos','Subitização'],
  materials:'🔵 Cubos de encaixe (qualquer cor)',
  levels:{1:'Torres de 2–4',2:'Torres de 4–6',3:'Ela ADIVINHA antes de tocar — misture mais e menos'},
  layout:
`  Início:    🟦🟦🟦     (3 cubos)
  Um a mais: 🟦🟦🟦🟦   (4 — um a MAIS!)
  Um a menos:🟦🟦🟦     (3 — um a MENOS!)
  ↑ A torre cresce e diminui!`,
  script:[
    "Montem uma torre juntos (tamanho do nível de hoje).",
    "Conte: 'Quantos? [X].'",
    "Dê UM cubo para ela: 'Coloca este!'",
    "'E agora, quantos? [X+1]! Isso é UM A MAIS que [X]!'",
    "Tire um: 'Um caiu! UM A MENOS — [X-1]!'",
    "Repita 4–5 vezes. Deixe ela adivinhar antes de somar/tirar."],
  camo_script:[
    "Diga: 'A torre precisa de mais um andar!'",
    "Some: 'Agora [X+1] andares! Um a MAIS!'",
    "Tire: 'Ah não! Um andar caiu! Agora [X-1]! Um a MENOS!'"]},

one_less_sneak:{ name:'Um a Menos Sorrateiro', teaches:['Um a mais / Um a menos','Subitização'],
  materials:'🦕 4–6 dinos (uma cor)',
  levels:{1:'Comece com 3–4 dinos',2:'Comece com 5–6 dinos',3:'Às vezes tire DOIS sorrateiro!'},
  layout:
`  Enfileire 5 dinos:
  🦕 🦕 🦕 🦕 🦕
  Olhos fechados → tire UM sorrateiro:
  🦕 🦕 🦕 🦕
  'Um fugiu! Quantos sobraram?'`,
  script:[
    "Enfileire os dinos (nível de hoje). Contem juntos.",
    "Diga: 'Fecha os olhos! Sem espiar!'",
    "Tire UM dino. Esconda na sua mão.",
    "'Abra! Um fugiu! Quantos agora?'",
    "Espere — deixe ela descobrir. Sem dicas.",
    "Revele: 'Aqui está! Ele voltou! De volta a [X]!'"],
  camo_script:[
    "Diga: 'Os dinos estão brincando de esconde-esconde!'",
    "Olhos fechados. Tire um: 'Um dino se escondeu!'",
    "'Abra! Quantos dinos ainda estão de fora?'",
    "Revele: 'Achei você! A turma inteira voltou!'"]},

roll_one_more:{ name:'Role e Um a Mais', teaches:['Um a mais / Um a menos','Subitização'],
  materials:'🎲 1 dado + cubos de encaixe (qualquer cor)',
  levels:{1:'Só UM A MAIS',2:'Misture um a mais e um a menos',3:'Desafio: "DOIS a mais que [X]?"'},
  layout:
`  Role o dado → veja [4]
  ┌───────┐
  │ • •   │
  │       │  → 4 pontos
  │ • •   │
  └───────┘
  Monte 4 cubos → some UM A MAIS → [5]!`,
  script:[
    "Role o dado. Olhem o número juntos.",
    "Monte exatamente esse número de cubos lado a lado.",
    "Diga: 'Você tem [X]. Quanto é UM A MAIS que [X]?'",
    "Espere — deixe ela pensar antes de tocar em nada.",
    "Some 1 cubo: 'Um a mais! [X+1]! Foi isso que você imaginou?'",
    "Role de novo. Repita. Depois tente: 'UM A MENOS que [X]?'"],
  camo_script:[
    "Role: 'O dado mostra [X] propulsores de foguete!'",
    "Monte [X] cubos: 'Precisamos de MAIS um propulsor para decolar!'",
    "Some 1: 'Agora [X+1] propulsores — decolar!'"]},

changing_numbers:{ name:'Números que Mudam', teaches:['Um a mais / Um a menos','Flexibilidade numérica'],
  materials:'🔵 5–6 cubos de encaixe',
  levels:{1:'Faça o 5 virar 4 (tire um)',2:'Qualquer número ± 1 — "o que você FEZ?"',3:'Mude de 2 em 2: faça o 5 virar 3'},
  layout:
`  Fila de 5 cubos: 🟦🟦🟦🟦🟦
  Pergunte: "Faz virar 4!"
  (tire um... ou some para aumentar!)
  "O que você FEZ para mudar?"`,
  script:[
    "Faça uma fila de 5 cubos. Contem juntos.",
    "Pergunte: 'Você consegue fazer virar 4?'",
    "Deixe ela agir — sem dicas sobre somar/tirar.",
    "Aí a pergunta-chave: 'O que você FEZ?'",
    "'Você tirou UM — o 5 virou 4!'",
    "Agora para cima: 'Faz o 4 virar 6!' — ela explica de novo."],
  camo_script:[
    "Diga: 'Esta é uma máquina mágica de números!'",
    "'A máquina quer QUATRO — faça acontecer!'",
    "'Que mágica você fez?'",
    "'Agora a máquina quer SEIS! Mais mágica!'"]},

// ════════ PARTE-PARTE-TODO / COMPOSIÇÃO ════════
break_cubes:{ name:'Cubos que Separam', teaches:['Parte-Parte-Todo','Composição numérica'],
  materials:'🔵🟡 Cubos de encaixe (2 cores diferentes, 10 de cada)',
  levels:{1:'Todo de 4–5',2:'Todo de 6',3:'Ela diz as DUAS partes antes de separar'},
  layout:
`  Monte UM bastão — duas cores:
  🟡🟡🟡 + 🔵🔵🔵 = 6 no total
  ━━━━━━━━━━━━━━━━━━━━━━━━
  Separe → "3 amarelos E 3 azuis"
  Junte  → "juntos = 6!"`,
  script:[
    "Monte um bastão (nível de hoje) — use 2 cores.",
    "Levante: 'UM bastão inteiro — [X] cubos no total!'",
    "Separe devagar: 'Oh! Quebrou em duas partes!'",
    "Segure cada parte: '[A] amarelos... [B] azuis.'",
    "Diga: '[A] E [B] juntos fazem [X]!'",
    "Ela junta de novo: 'Consertado! O todo é [X] de novo!'"],
  camo_script:[
    "Diga: 'O motor da nave quebrou em dois pedaços!'",
    "Separe: '[A] pedaços aqui, [B] ali!'",
    "Diga: 'Conserte o motor — junte os dois!'",
    "Juntou: 'Consertado! [X] no total — pronto para voar!'"]},

hidden_dinos:{ name:'Mistério do Dino Escondido', teaches:['Parte-Parte-Todo','Composição numérica'],
  materials:'🦕 5–6 dinos (uma cor) + 1 tigela',
  levels:{1:'Total de 3–4 dinos',2:'Total de 5',3:'Total de 6'},
  layout:
`  Início: 5 dinos todos fora
  🦕 🦕 🦕  ← 3 visíveis fora
  🥣 tigela ← 2 escondidos dentro
  "3 fora + ? dentro = 5 no total"`,
  script:[
    "Contem os dinos juntos (total de hoje). Enfileire.",
    "'Olha — [Z] dinos vão para a caverna!' Deslize para baixo da tigela.",
    "Aponte para os de fora: 'Estes [Y] estão do lado de fora.'",
    "Diga: 'Quantos estão escondidos dentro da caverna?'",
    "Espere em silêncio — sem dicas.",
    "Espiem juntos: '[Z]! [Y] E [Z] fazem [total]!'"],
  camo_script:[
    "Diga: 'Alguns dinos correram para a caverna para dormir!'",
    "Deslize alguns sob a tigela: 'Shhh — estão dormindo!'",
    "Aponte: '[Y] dinos ainda estão acordados do lado de fora.'",
    "'Quantos estão cochilando lá dentro?'",
    "Levante: 'Você achou eles! [Z] estavam dormindo!'"]},

dino_bowl_parts:{ name:'Partes nas Tigelas de Dino', teaches:['Parte-Parte-Todo','Composição numérica'],
  materials:'🦕 5–6 dinos (2 cores) + 2 tigelas das cores correspondentes',
  levels:{1:'Total de 4 (2+2 · 3+1)',2:'Total de 5',3:'Total de 6'},
  layout:
`  Pegue 5 dinos: 3 VERMELHOS + 2 VERDES
  🥣 Tigela verm. 🥣 Tigela verde
  🦕🦕🦕         🦕🦕
     3       +      2      = 5
  "Três E dois fazem CINCO!"`,
  script:[
    "Pegue dinos de 2 cores diferentes (total de hoje).",
    "Coloque cada cor na tigela da cor correspondente.",
    "Aponte: 'A tigela vermelha tem [A]. A verde tem [B].'",
    "'[A] E [B] juntos — quantos dinos no total?'",
    "Junte as duas tigelas e conte: '[total]!'",
    "Diga: '[A] e [B] FAZEM [total]!' — batam palma no ritmo."],
  camo_script:[
    "Diga: 'Duas famílias de dinos estão numa festa!'",
    "[A] vermelhos na tigela: 'Família vermelha — [A] dinos!'",
    "[B] verdes na tigela: 'Família verde — [B] dinos!'",
    "Junte: 'Todos se encontraram! Quantos na festa?'",
    "'[total] dinos na festa! Eba!'"]},

ppw_mat:{ name:'Diagrama Parte-Parte-Todo', teaches:['Parte-Parte-Todo','Composição numérica'],
  materials:'🦕 5–6 dinos + papel (desenhe o diagrama abaixo)',
  levels:{1:'Todo de 4',2:'Todo de 5 — tente todas as divisões',3:'Todo de 6'},
  layout:
`  Desenhe no papel (30 seg):
  ┌──────────────────┐
  │   TODO:   [ 5 ]  │ ← todos os dinos começam aqui
  └────────┬─────────┘
     ┌─────┴──────┐
  ┌──┴────┐  ┌────┴──┐
  │ PARTE1│  │ PARTE2│
  │  [3]  │  │  [2]  │
  └───────┘  └───────┘`,
  script:[
    "Desenhe o diagrama: 1 caixa grande em cima, 2 menores embaixo.",
    "Coloque os dinos na caixa do TODO (nível de hoje).",
    "Deslize alguns para a Parte 1: 'Estes vão aqui.'",
    "Os que sobram vão para a Parte 2: 'E estes aqui.'",
    "Diga: '[A] E [B] juntos fazem o todo!'",
    "Tente todas as divisões: 4+1, 3+2, 1+4, 2+3 — mesmo todo!"],
  camo_script:[
    "Diga: 'A ilha dos dinos tem dois acampamentos secretos!'",
    "Caixa de cima: 'Todos os dinos moram na ilha.'",
    "Divida: 'Alguns dormem na floresta, outros na praia!'",
    "Conte: '[A] na floresta, [B] na praia — ainda são todos!'"]},

two_bowl_split:{ name:'Divisão em Duas Tigelas', teaches:['Parte-Parte-Todo','Composição numérica'],
  materials:'🦕 5–6 dinos + 2 tigelas + pinça',
  levels:{1:'4–5 dinos',2:'6 dinos',3:'Ela adivinha o TOTAL antes de contar'},
  layout:
`  🥣 Tigela 1 (esq.)  🥣 Tigela 2 (dir.)
  ←─── ela divide livremente ───→
  Pinça para pegar cada dino.
  Ela decide — sem dar direção!`,
  script:[
    "Coloque 2 tigelas. Ponha os dinos entre elas (nível de hoje).",
    "Dê a pinça a ela: 'Mova os dinos para as tigelas!'",
    "Não dirija — deixe ela escolher as quantidades livremente.",
    "Conte cada tigela quando terminar.",
    "Diga: '[A] na tigela 1, [B] na tigela 2!'",
    "Diga: '[A] E [B] juntos fazem [total]!'"],
  camo_script:[
    "Diga: 'Os dinos precisam de dois acampamentos para a noite!'",
    "Pinça: 'Leve cada dino para um acampamento!'",
    "Conte: '[A] no acampamento 1, [B] no acampamento 2!'",
    "'Todos os dinos estão seguros! [total] no total!'"]},

// ════════ HISTÓRIAS DE NÚMEROS (Kate Snow cap. 7) ════════
addition_stories:{ name:'Histórias de Adição', teaches:['Histórias de adição','Contar a partir de'],
  materials:'🔵🟨 Cubos de encaixe (2 cores)',
  levels:{1:'Totais até 4',2:'Totais de 5–6',3:'Ela responde SEM recontar do 1'},
  layout:
`  Conte com os cubos:
  "Eu tinha 3 cubos..."  🟦🟦🟦
  "aí ganhei 2 A MAIS!"  🟨🟨
  (deixe um espacinho entre os grupos)
  "Quantos eu tenho agora?"`,
  script:[
    "Conte uma historinha: 'Eu tinha [A] cubos...' — coloque eles.",
    "'...aí ganhei [B] A MAIS!' — coloque o segundo grupo separado.",
    "Pergunte: 'Quantos cubos eu tenho AGORA?'",
    "Deixe ela contar — ou reconhecer sem contar!",
    "Repita com números novos (nível de hoje).",
    "Troquem de papel: ELA conta uma história, você resolve!"],
  camo_script:[
    "Diga: 'O dino achou [A] frutinhas...' — coloque cubos.",
    "'...aí achou [B] frutinhas A MAIS! Que delícia!'",
    "'Quantas frutinhas o dino tem agora?'",
    "'Agora VOCÊ me conta uma história de frutinhas!'"]},

penny_subtraction:{ name:'Histórias de Tirar', teaches:['Histórias de subtração'],
  materials:'🔵 Cubos de encaixe (uma cor)',
  levels:{1:'De 3–4, tire 1',2:'De 5, tire 1–2',3:'De 6 — e ela reconta a história'},
  layout:
`  "Eu tinha 5 cubos..." 🟦🟦🟦🟦🟦
  "aí PERDI 2!"        🟦🟦🟦 ✋(tira 2)
  "Quantos sobraram?"
  Encene — ELA que tira os cubos!`,
  script:[
    "Conte assim: 'Eu tinha [A] cubos...' — coloque numa fila.",
    "'...aí PERDI [B]!' — ELA que tira.",
    "Pergunte: 'Quantos sobraram para mim?'",
    "Espere — deixe ela contar ou simplesmente ver.",
    "Repita com números novos (nível de hoje).",
    "Nível 3: 'Me conta a história de volta — o que aconteceu?'"],
  camo_script:[
    "Diga: 'O dino tinha [A] biscoitos...'",
    "'...mas um passarinho esperto levou [B]!' — ela pega eles.",
    "'Quantos biscoitos sobraram para o dino?'",
    "'Coitado do dino! Vamos contar outra história de biscoitos!'"]},

// ════════ CONTAR A PARTIR / QUADRO DO DEZ ════════
two_dice_counton:{ name:'Contar a Partir com Dois Dados', teaches:['Contar a partir de','Subitização'],
  materials:'🎲🎲 2 dados + cubos de encaixe',
  levels:{1:'Role de novo até um dado mostrar 1–2',2:'Qualquer rolagem — sempre comece pelo maior',3:'Ela acha o dado maior sozinha, sem ajuda'},
  layout:
`  Role os dois dados:
  ┌─────┐    ┌─────┐
  │ • • │    │ •   │
  │ •   │  + │     │  → 3+1=4
  │ • • │    │ •   │
  └─────┘    └─────┘
  Comece pelo maior e conte a partir dele!`,
  script:[
    "Role os dois dados. Identifiquem o MAIOR número.",
    "Diga: 'Este tem [X]. Guarde isso na cabeça!'",
    "Aponte para o dado menor: 'Conte a partir de [X]!'",
    "Toque em cada ponto do dado menor enquanto conta.",
    "'[X]... [X+1]... [X+2]...' — chegue no total.",
    "Monte uma torre de cubos com o total para ver!"],
  camo_script:[
    "Diga: 'Dois motores — o grande já está ligado!'",
    "'O motor 1 está em [X]. Conte a força extra!'",
    "Toque nos pontos do dado menor: '[X+1]... [X+2]...'",
    "'[total] de força — decolar!'"]},

finger_peek:{ name:'Dedos Achou-Achou (6–10)', teaches:['Subitização com dedos','Contar a partir de'],
  materials:'🖐️ Só as mãos — não precisa de material',
  levels:{1:'Só 5+1 e 5+2',2:'5+3 e 5+4 também',3:'"Quantos LEVANTADOS? Quantos ABAIXADOS?"'},
  layout:
`  Âncora sempre no 5 (mão inteira):
  5 + 1 = 6  → 🖐️ + 1 dedo
  5 + 2 = 7  → 🖐️ + 2 dedos
  5 + 3 = 8  → 🖐️ + 3 dedos
  5 + 4 = 9  → 🖐️ + 4 dedos
  Sem contar dedo por dedo!`,
  script:[
    "Levante 5 dedos (mão inteira). Diga: 'Cinco!'",
    "Some 1 na outra mão: 'E mais UM!'",
    "'Cinco e mais um — SEIS!'",
    "Balance o dedinho extra.",
    "Percorra o nível de hoje do mesmo jeito.",
    "Nível 3: 'Quantos dedos LEVANTADOS? Quantos ABAIXADOS?'"],
  camo_script:[
    "Diga: 'Minha mão inteira é uma turma completa — cinco!'",
    "Some 1 dedo: 'Um amiguinho novo entrou na turma!'",
    "'Cinco da turma mais um amiguinho novo — SEIS!'",
    "Ela copia com as mãos."]},

ten_frame_hidden:{ name:'Peças Escondidas (Quadro do Dez)', teaches:['Contar a partir de','Quadro do dez'],
  materials:'📄 Quadro do dez em papel + 🦕 dinos ou cubos',
  levels:{1:'Preencha a fileira de cima de 5 + extras — conte tudo',2:'CUBRA o 5: "cinco e mais 2 — quantos?"',3:'"Quantas caixinhas VAZIAS para completar 10?"'},
  layout:
`  Quadro do dez — linha de cima sempre 5:
  ┌─┬─┬─┬─┬─┐
  │●│●│●│●│●│ ← cubra esta linha!
  ├─┼─┼─┼─┼─┤
  │●│●│ │ │ │ ← 2 aparecendo
  └─┴─┴─┴─┴─┘
  "CINCO escondidos e mais 2 — quantos?"`,
  script:[
    "Desenhe um quadro do dez: 2 fileiras de 5 caixinhas.",
    "Preencha a fileira de CIMA toda: 'Um cinco cheio!'",
    "Coloque alguns na fileira de baixo (nível de hoje).",
    "Cubra a fileira de cima com a mão ou um papel.",
    "'CINCO estão escondidos... e mais [B]. Quantos no total?'",
    "Incentive a contar A PARTIR do cinco: '5... 6, 7!'"],
  camo_script:[
    "Diga: 'Cinco dinos foram dormir debaixo do cobertor!'",
    "'[B] dinos ainda estão acordados embaixo!'",
    "'Quantos dinos no quarto inteiro?'",
    "'Conte a partir dos cinco que dormem: 5... 6, 7!'"]},

race_to_ten:{ name:'Corrida até o Dez', teaches:['Quadro do dez','Contar a partir de'],
  materials:'📄 Um quadro do dez em papel para cada + 🎲 1 dado + cubos',
  levels:{1:'Corrida até CINCO (quadro do cinco)',2:'Corrida até DEZ',3:'A cada vez pergunte: "quantos A MAIS você precisa?"'},
  layout:
`  Desenhe um quadro do dez para cada:
  ┌─┬─┬─┬─┬─┐
  │●│●│●│ │ │
  ├─┼─┼─┼─┼─┤
  │ │ │ │ │ │
  └─┴─┴─┴─┴─┘
  Role o dado → some essa quantidade de cubos.
  Quem PREENCHER o quadro primeiro vence!`,
  script:[
    "Desenhe um quadro para cada (nível de hoje: 5 ou 10 caixinhas).",
    "Revezem: role o dado, some essa quantidade de cubos.",
    "Um cubo por caixinha — preencha da esquerda para a direita.",
    "Diga seu progresso: 'Eu tenho 6 — quase lá!'",
    "Nível 3: 'Quantos A MAIS você precisa para ganhar?'",
    "Quem preencher o quadro primeiro vence — revanche na hora!"],
  camo_script:[
    "Diga: 'Os hotéis dos dinos estão enchendo para a noite!'",
    "'Role para ver quantos hóspedes chegam!'",
    "'Meu hotel tem 6 hóspedes — 4 quartos vazios!'",
    "'Hotel cheio! Todo mundo dorme! Você venceu!'"]},

// ════════ COMPARAÇÃO (Kate Snow cap. 6) ════════
dice_war:{ name:'Batalha de Dados: Mais · Menos · Igual', teaches:['Mais vs. Menos','Igual','Subitização'],
  materials:'🎲🎲 2 dados',
  levels:{1:'Pergunte só "quem tem MAIS?"',2:'Inclua rodadas de MENOS e IGUAL',3:'"Quantos a mais você tem que eu?"'},
  layout:
`  Cada um rola UM dado (você vs. criança):
        ┌─────┐        ┌─────┐
        │ • • │        │ •   │
        │ •   │        │     │
        │ • • │        │ •   │
        └─────┘        └─────┘
           5               2
  MAIS? MENOS? ou IGUAL?!`,
  script:[
    "Cada um rola um dado.",
    "Os dois olham os dados lado a lado.",
    "Diga: 'Eu tenho [X]. Você tem [Y].'",
    "Pergunte (nível de hoje): 'Quem tem MAIS? MENOS?'",
    "Mesma rolagem?! 'IGUAL! Temos a MESMA quantidade!' — comemore.",
    "Quem vence pega os dois dados. Joguem 5 rodadas!"],
  camo_script:[
    "Diga: 'Os dados são criaturas de poder!'",
    "'Minha criatura tem [X] pintinhas de poder, a sua [Y]!'",
    "'Mais pintinhas = mais forte! Ou... poder IGUAL?!'",
    "Rujam juntos pelo vencedor — ou um rugido duplo no empate."]},

// ════════ PADRÕES ════════
pattern_train:{ name:'Trem dos Padrões', teaches:['Padrões ABAB / ABB / AAB'],
  materials:'🔵🟡 Cubos de encaixe (2–3 cores)',
  levels:{1:'Só ABAB',2:'ABB e AAB',3:'ELA cria um padrão — você copia'},
  layout:
`  ABAB: 🔵🟡🔵🟡🔵🟡
  ABB:  🔵🟡🟡🔵🟡🟡
  AAB:  🔵🔵🟡🔵🔵🟡
  Monte → ela encaixa o PRÓXIMO cubo!`,
  script:[
    "Comece um trem de padrão (nível de hoje).",
    "'Vermelho, azul, vermelho, azul — o que vem depois?'",
    "Deixe ela escolher e encaixar o cubo.",
    "Quando ABAB ficar fácil: passe para ABB ou AAB.",
    "Nível 3: deixe ela COMEÇAR um padrão — você copia!"],
  camo_script:[
    "Diga: 'Os vagões do trem têm uma ordem secreta!'",
    "Monte: 'Vagão vermelho, vagão azul, vagão vermelho, vagão azul...'",
    "'Qual vagão vem depois no segredo?'",
    "Ela encaixa: 'Você sabe o segredo!'"]},

pattern_dinos:{ name:'Desfile Colorido de Dinos', teaches:['Padrões ABAB / ABB'],
  materials:'🦕 Dinos (2 cores, 7 de cada) + pinça',
  levels:{1:'Desfile ABAB',2:'Desfile AAB',3:'Ela inventa a regra do desfile'},
  layout:
`  Use 2 cores de dino num desfile:
  🟥🟩🟥🟩🟥🟩  ← desfile ABAB
  🟥🟥🟩🟥🟥🟩  ← desfile AAB
  Pinça para colocar cada dino!`,
  script:[
    "Escolha 2 cores de dino (ex.: vermelho e verde).",
    "Comece um desfile (padrão do nível de hoje).",
    "'Vermelho, verde, vermelho, verde — quem desfila depois?'",
    "Dê a pinça: 'Coloque o próximo a desfilar!'",
    "Deixe ela continuar — depois inventar a própria regra."],
  camo_script:[
    "Diga: 'Os dinos estão num desfile!'",
    "'Dino vermelho, dino verde, dino vermelho...'",
    "'Quem desfila depois?'",
    "Ela escolhe e coloca com a pinça."]},

// ════════ FORMAS E CLASSIFICAÇÃO ════════
shape_sort:{ name:'Detetive das Formas', teaches:['Reconhecimento de formas','Classificação por atributo'],
  materials:'🧱 Blocos de Lego (pequeno / médio / grande)',
  levels:{1:'Separe por TAMANHO',2:'Separe por FORMA',3:'Dois atributos: "só quadrados grandes!"'},
  layout:
`  Formas-alvo nos blocos de Lego:
  ■ Quadrado ▬ Retângulo
  Também separe por TAMANHO:
  🔹 pequeno 🔷 médio   🔵 grande
  Separe por FORMA ou TAMANHO — não por cor!`,
  script:[
    "Espalhe uma mistura de blocos de Lego na mesa.",
    "Levante um: 'Que forma é esta?'",
    "Nomeie: 'Retângulo! Dois lados longos, dois curtos!'",
    "Separe em grupos (atributo do nível de hoje).",
    "Desafio: 'Ache todos os quadrados para mim!'",
    "Nível 3: 'Ache só os quadrados GRANDES!'"],
  camo_script:[
    "Diga: 'As formas estão perdidas e precisam das suas casas!'",
    "Desenhe 2–3 zonas de casa no papel.",
    "Ela coloca cada bloco: 'Quadrado vai para a casa dos quadrados!'",
    "'Todas as formas acharam suas casas!'"]},

lego_build:{ name:'Construir e Contar com Lego', teaches:['Subitização','Um a mais / Um a menos'],
  materials:'🧱 Blocos de Lego (~300 peças, peq/méd/grande)',
  levels:{1:'Monte com exatamente 4–5 blocos',2:'Exatamente 6–8 blocos',3:'"Some mais 2 cômodos — agora quantos?"'},
  layout:
`  Monte usando exatamente [5] blocos:
  Conte cada bloco enquanto coloca.
  "1, 2, 3, 4, 5 — pronto!"
  Depois: some UM a mais → [6]
  Depois: tire UM → [5] de novo`,
  script:[
    "Diga: 'Vamos construir algo usando exatamente [X] blocos!'",
    "Contem cada bloco em voz alta enquanto colocam juntos.",
    "Quando terminar: 'Quantos blocos tem na nossa construção?'",
    "Some 1: 'Mais um cômodo! Agora quantos?'",
    "Tire 1: 'Um cômodo caiu! Agora quantos?'"],
  camo_script:[
    "Diga: 'Vamos construir uma casa de dino — só [X] blocos!'",
    "Conte: '1, 2, 3... — a casa está pronta!'",
    "Some 1: 'O dino precisa de mais um cômodo!'",
    "Tire 1: 'Um cômodo quebrou! Agora quantos?'"]},

// ════════ LIVRO DE ATIVIDADES ════════
workbook_page:{ name:'Página do Livro de Atividades', teaches:['Reconhecimento de números','Numerais escritos'],
  materials:'📖 Livro de atividades de matemática pré-escolar (Modern Kid Press) + cubos/dinos para combinar com as figuras',
  levels:{1:'Só apontar e conversar — sem escrever',2:'Monte a página com cubos/dinos de verdade',3:'Ela explica a página para você'},
  layout:
`  Método Kate Snow — sempre ligar a objetos:
  • Aponte e converse primeiro — nada de escrever
  • Pegue cubos ou dinos iguais às figuras
  • Peça "mostra com os cubos", não "me diz"
  • No máx. 1 página — pare quando o interesse cair`,
  script:[
    "Abra o livro de atividades na página do capítulo atual.",
    "'Vamos olhar esta página juntos.'",
    "Aponte para as imagens: 'O que você vê aqui?'",
    "Pegue cubos ou dinos de verdade iguais às figuras.",
    "'Monte isto com os cubos — igualzinho à página!'",
    "Elogie o esforço, não o acerto."],
  camo_script:[
    "Diga: 'Este livro tem uma mensagem secreta!'",
    "'Você consegue achar todos os [X] nesta página?'",
    "Pegue cubos iguais: 'Monte a figura!'",
    "'Você desvendou o segredo do livro!'"]}
};
