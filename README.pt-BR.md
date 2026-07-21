# Math Trail 🦕

**Um planejador calmo e adaptativo de matemática inicial para o RESPONSÁVEL de uma criança pequena — a criança nunca toca na tela.**
JavaScript puro, zero dependências de runtime, offline-first. Um app pequeno e local-first que planeja, conduz e registra momentos curtos de matemática fora da tela, em casa.

[![CI](https://github.com/samuel3ssilva/math-trail/actions/workflows/ci.yml/badge.svg)](https://github.com/samuel3ssilva/math-trail/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[▶ Demo ao vivo (dados sintéticos)](https://samuel3ssilva.github.io/math-trail/?demo=1)** · **[App vazio](https://samuel3ssilva.github.io/math-trail/)** · **[Última release](https://github.com/samuel3ssilva/math-trail/releases/latest)** · **[Case study](docs/case-study.md)** · **[Guia de uso](docs/usage-guide.pt-BR.md)** · **[Documentação técnica](docs/architecture.md)** · [Read in English](README.md)

![Arquitetura do Math Trail](docs/assets/math-trail-architecture.svg)

**Telas interativas:** a [demo sintética ao vivo](https://samuel3ssilva.github.io/math-trail/?demo=1) é o screenshot sempre atual — abra no celular ou desktop.

---

## O problema

A maioria dos "apps educativos" resolve matemática inicial colocando uma tela na frente da criança. Para uma criança de 2,5 anos isso é o oposto do que a pedagogia (o livro *Preschool Math at Home*, de Kate Snow) pede: momentos curtos, lúdicos e concretos com objetos reais — cubos de encaixe, dinossauros de brinquedo, dados, papel e caneta.

O difícil não é a matemática. É que o responsável ocupado, na hora, não sabe *o que fazer agora*, *como conduzir* nem *se está adiantando*. O Math Trail responde essas três perguntas — para o **adulto**.

## Quem usa e o fluxo principal

O **responsável** é o único usuário. A criança brinca fora da tela, com materiais reais.

1. **Plano** — três janelas opcionais no dia (manhã / tarde / noite). Escolha uma atividade ou toque em ✦ para uma sugestão; o app mostra um diagrama de montagem, um roteiro de falas e *por que* aquilo foi sugerido.
2. **Fazer** — inicie uma sessão cronometrada, conduza a atividade com a criança e encerre.
3. **Registrar** — três escolhas rápidas (como foi, humor da criança, como estava o desafio) e uma nota opcional. Uma sessão encerrada fica guardada com segurança até você salvar.
4. **Refletir** — um histórico por dia e a aba Progresso: trilha de habilidades, marcos em construção, humor ao longo do tempo — sempre como contagens simples, nunca notas.

### Por que a criança fica fora da tela

Essa é a decisão central de produto, não uma omissão. Tempo de tela é justamente o que este app *substitui*. Toda a interface fala com o adulto: roteiros, linguagem de registro não avaliativa, humor tratado como observação e não como nota. A experiência da criança são cubos e dinossauros na mesa da cozinha.

## Destaques técnicos

- **Zero dependências, sem framework** — em runtime *e* em build. Até o lint é sem dependências ([ADR-0003](docs/adr/0003-no-tooling-deps.md)). O app publica como arquivos estáticos e foi feito para sobreviver à rotatividade de frameworks.
- **Motor determinístico e explicável** — regras puras com relógio e RNG injetados; `replayState(logs)` é puro/sem relógio e as regras temporais são avaliadas na leitura ([ADR-0002](docs/adr/0002-clock-injection.md)). Documentado honestamente como um **sistema baseado em regras, não machine learning** ([docs/model-card.md](docs/model-card.md)).
- **Segurança de dados como feature** — backups versionados por schema, importação validada por allowlist com snapshot + rollback automáticos, e política de migração "cópia verbatim ou nada" — nascida de um quase-incidente real ([case study](docs/case-study.md)).
- **Privacidade infantil primeiro** — sem contas, sem servidor, sem analytics, sem chamadas a terceiros; os dados ficam só no localStorage do aparelho. O repositório público contém apenas dados sintéticos.
- **PWA offline-first** — shell de service worker versionado; instala na tela inicial e funciona com a rede desligada.
- **PT-BR / EN completos** — interface *e* todo o catálogo de 28 atividades.
- **153 testes automatizados, 0 skipped**, atrás de um pipeline de CI com gates.

## Arquitetura

App vanilla-JS monolítico e modular. Sem bundler; módulos ES carregados direto, com um passo de build que também emite um bundle de arquivo único.

```
index.html ──┬── js/app.mjs         camada de UI: render, plano, fluxo de sessão, i18n
             ├── js/engine.mjs      regras adaptativas puras (nível, domínio, modo história, pausa…)
             ├── js/activities.mjs  catálogo: campos do motor + exibição EN (fonte única dos ids)
             ├── js/activities-pt.mjs  overlay de exibição PT-BR (mesmos ids)
             ├── js/storage.mjs     persistência, versão de schema, validação, snapshot + rollback
             ├── js/session.mjs     decisões puras de sessão pendente + migração do demo
             ├── js/time.mjs        calendário local (localDateKey), correto por timezone
             ├── js/i18n.mjs        textos de interface (PT-BR / EN)
             └── js/demo.mjs        gerador de dados de demo sintéticos e com seed
sw.js  ·  manifest.webmanifest      shell PWA + instalação
```

A separação de responsabilidades é estrita: o motor é puro e sem relógio, o storage detém todos os contratos de persistência, e o `app.mjs` só liga tudo ao DOM. O estado do domínio é sempre função pura do log, então editar ou apagar uma sessão passada recompõe todo o histórico.

## O motor adaptativo (baseado em regras, explicável)

A parte interessante vive em [`js/engine.mjs`](js/engine.mjs) — funções puras, totalmente testadas:

| Regra | Comportamento |
|---|---|
| **Ajuste de nível** | Duas sessões "muito fácil" seguidas → sobe de nível (1→3); uma "muito difícil" → desce. |
| **Domínio** | "Muito fácil" duas vezes no nível 3 → atividade marcada como bem explorada, peso reduzido nas sugestões. |
| **Modo história** | 2 sessões "resistiu" nas últimas 3 → roteiros viram aventura por 3 sessões. |
| **Pausa (cooldown)** | "Muito difícil" no nível mínimo em atividades de composição → aquela habilidade descansa 48h. |
| **Desbloqueio** | Contar-a-partir-de com dois dados só entra no pool depois de Flash de Dado bem explorado ([ADR-0001](docs/adr/0001-two-dice-unlock-rule.md)). |
| **Observação de recompensa** | Se docinhos se correlacionam com bem mais resistência que a brincadeira intrínseca (amostra mínima exigida), o app sugere gentilmente conexão como recompensa. |
| **Replay determinístico** | O estado é recomputado do log; uma edição passada nunca deixa estado e histórico dessincronizados. |
| **Plano diário estável** | As sugestões usam a data local como semente, então o plano não se embaralha a cada reload. |

**Não** é machine learning: sem treino, sem pesos aprendidos de dados, sem inferência. Toda sugestão é rastreável a uma regra e mostrada ao responsável. O roadmap de ML abaixo é trabalho futuro, de propósito.

## Privacidade infantil

- Sem contas, sem backend, sem analytics, sem requisições a terceiros — verificado: o app publicado faz **zero requisições externas**.
- Todos os dados são locais (localStorage); nada sai do aparelho a menos que o responsável exporte um backup.
- O repositório público contém **apenas dados sintéticos**. Um guarda automatizado de privacidade quebra o CI se identificadores pessoais aparecerem em qualquer arquivo rastreado *ou* no artefato `dist/`.
- O histórico Git foi limpo de dados sensíveis anteriores ([ADR-0004](docs/adr/0004-git-history-cleanup.md)).
- Veja [privacy.md](docs/privacy.md), [threat-model.md](docs/threat-model.md), [data-inventory.md](docs/data-inventory.md).

## Segurança e integridade dos dados

- **Sem XSS de conteúdo armazenado** — o histórico monta nós do DOM com `textContent` e listeners reais; nenhum campo de log chega a `innerHTML` ou atributo. Importações são validadas e normalizadas por allowlist (campos extras e `__proto__` descartados). Threat model **T3 mitigado** com testes.
- **Sem perda silenciosa de dados** — importações fazem snapshot antes e rollback em qualquer falha; migração é cópia-verbatim-ou-nada.
- **Correto por timezone** — "hoje" e o agrupamento por dia seguem o calendário do aparelho, com testes de virada para America/Sao_Paulo.

## Testes e CI/CD

```bash
npm run lint    # gate de lint + formato, sem dependências
npm test        # 153 testes: motor, timezone, storage/migração, guarda de privacidade,
                # localização do catálogo, XSS, sessão pendente, migração do demo, build
npm run build   # dist/ publicável + bundle de arquivo único em dist/standalone/
```

O CI roda **lint → testes → build → checks do artefato (arquivos PWA, sem dados pessoais em `dist/`) → deploy**. O GitHub Pages publica só o artefato `dist/`, nunca a raiz do repo. A `main` é protegida: PRs obrigatórios, o status check `quality` precisa passar (strict), sem force-push. Deploys têm gate na `main`.

## PWA e offline

Um service worker cache-first pré-cacheia o shell do app; o nome do cache versionado é incrementado a cada mudança de shell, então visitantes que retornam recebem as atualizações sem limpar nada. Os dados já vivem no localStorage, então o app funciona totalmente com a rede desligada e instala na tela inicial.

## Engenharia assistida por IA

Este projeto foi desenvolvido por meio de **engenharia assistida por IA**: modelos foram usados em papéis separados — implementação, product review e auditoria independente — enquanto requisitos, critérios de aceite, decisões de produto e autorização de merge permaneceram sob **governança humana**. Uma instância implementava; outra auditava; divergências eram resolvidas verificando o código, não confiando no relatório; achados não eram aceitos sem testes e evidências; CI e branch protection atuavam como gates; e **nenhuma IA teve autorização autônoma para merge**. O fluxo completo, incluindo falsos positivos retirados e correções só aceitas depois que um teste as provou, está em [docs/ai-assisted-engineering.md](docs/ai-assisted-engineering.md).

## Rodar localmente

```bash
git clone https://github.com/samuel3ssilva/math-trail.git
cd math-trail
npm run serve   # http://localhost:8123  (ou só abra index.html — não há nada a instalar)
```

Adicione `?demo=1` para três semanas de dados sintéticos de exemplo.

## Estrutura do repositório

```
index.html, styles.css, sw.js, manifest.webmanifest   o app
js/                os módulos (veja Arquitetura)
tests/             153 testes em 16 arquivos; fixtures/ são só sintéticas
docs/              arquitetura, model-card, privacidade, threat model, ADRs, case study
docs/assets/       diagrama de arquitetura (SVG) usado neste README
scripts/           lint sem dependências + o gerador de dados de demo com seed
demo/generated/    o dataset de demo de referência commitado
```

## Limitações atuais

- Isto **não** é ferramenta de diagnóstico ou avaliação, e não faz nenhuma afirmação sobre o aprendizado da criança.
- O conjunto de dados de uma família é pequeno; recomendações e catálogo são propositalmente simples.
- O motor é baseado em regras, não ML — nenhuma conclusão causal é feita.
- Validação pedagógica profissional é trabalho futuro.
- Parte do detalhe é verificada só à mão; veja [docs/manual-verification.md](docs/manual-verification.md).

## Roadmap de IA / ML (trabalho futuro — não iniciado)

Um caminho conservador e centrado em avaliação, mantido separado do motor de regras já publicado:

`baseline_rule_v1` → dataset sintético → um challenger leve → avaliação champion/challenger → model card → uma decisão explícita de integrar ou rejeitar o modelo.

## Licença

[MIT](LICENSE) — feito por [Samuel dos Santos Silva](https://github.com/samuel3ssilva) com IA como par de engenharia e o julgamento humano como rede de segurança.
