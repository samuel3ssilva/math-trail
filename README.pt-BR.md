# Math Trail 🦕

**Um planejador calmo e adaptativo de prática de matemática para pais de crianças pequenas.**
JavaScript puro, zero dependências, offline-first — um app pequeno que planeja, orienta e acompanha momentos de matemática de cinco minutos em casa.

**[▶ Demo ao vivo](https://samuel3ssilva.github.io/math-trail/?demo=1)** (com três semanas de dados de exemplo) · **[App vazio](https://samuel3ssilva.github.io/math-trail/)** · [Read in English](README.md)

---

## Por que existe

A maioria dos "apps educativos" coloca uma tela na frente da criança. O Math Trail faz o oposto: **a criança nunca toca nele**. É uma ferramenta para o adulto, construída sobre a pedagogia do livro *Preschool Math at Home* (Kate Snow) e uma caixa de materiais reais — cubos de encaixe, dinossauros de brinquedo, dados, papel e caneta.

O app responde às três perguntas de um pai ou mãe sem tempo:

1. **O que brincar agora?** Três janelas diárias (manhã / tarde / noite), cada uma com uma atividade pré-escolhida pelo motor adaptativo — com roteiro do adulto, diagrama de montagem estilo lousa e explicação do porquê da escolha.
2. **Como está indo?** Registro em um toque: participação, humor, dificuldade, o que sustentou a atividade, nota opcional. Um timer embutido captura a duração.
3. **Está funcionando?** Uma trilha de habilidades (contagem 1–5 → subitização → um a mais/a menos → … → histórias numéricas), progresso em células de cubo de encaixe, humor ao longo do tempo e cartões de estado adaptativo em linguagem simples.

## O motor adaptativo

A parte interessante mora em [`js/engine.mjs`](js/engine.mjs) — funções puras, todas testadas: ajuste automático de nível, domínio de atividade, Modo História (roteiros viram aventuras quando há resistência), pausa de 48h para habilidades difíceis, desbloqueio por pré-requisito, alerta de correlação com docinhos e replay determinístico do histórico. Detalhes na [versão em inglês](README.md#the-adaptive-engine).

## Privacidade em uma linha

Sem contas, sem servidor, sem analytics, sem chamadas externas: os dados ficam no
dispositivo. O repositório público contém apenas dados sintéticos, e um guarda
automatizado de privacidade quebra o CI se identificadores pessoais aparecerem.
Detalhes em [docs/privacy.md](docs/privacy.md).

## Rodar

```bash
npm run serve   # http://localhost:8123  (ou abra index.html direto)
npm test        # suíte de testes do motor
npm run build   # bundle de arquivo único em dist/
```

## Licença

[MIT](LICENSE) — feito por [Samuel dos Santos Silva](https://github.com/samuel3ssilva) com IA como par de engenharia e julgamento humano como rede de segurança.
