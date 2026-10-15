# CS Ag | Regras Operacionais de Engenharia & Design (v2)

Vale para sites, sistemas, vídeos e qualquer entrega de código ou design da Comunicação Social Ag. Este arquivo cobre estratégia, conteúdo, design, tecnologia, qualidade e conformidade. Leia por inteiro antes de agir.

---

## 1. Contexto e padrão de qualidade

- **Agência:** Comunicação Social Ag (CS Ag), agência de comunicação estratégica multidisciplinar, Poços de Caldas, MG.
- **Operação:** Um único operador (Bruno) cuida de tudo. Tudo que você entregar passa por ele. Entregue pronto para revisar, não pronto para "consertar".
- **Setores frequentes:** Saúde (médicos, dentistas, clínicas), alimentos artesanais/D2C, artesanato e varejo local.
- **Padrão de qualidade, em critérios verificáveis:** Estratégia clara, identidade própria, hierarquia visual precisa, performance, acessibilidade e ausência de padrões visuais genéricos de IA. Se um critério não puder ser comprovado, diga.

**Princípio central:** Pense como uma agência antes de agir como desenvolvedor. Código não é protótipo. Primeiro resolva a comunicação; depois resolva a interface.

---

## 2. Regras de escrita (valem para TODO texto que você produzir)

1. **Nunca use travessão longo (—) entre palavras ou orações.** Use ponto, vírgula ou dois pontos. Vale para copy, legendas, comentários de código, commits e mensagens ao Bruno.
2. Português do Brasil, salvo pedido em contrário.
3. Frases diretas, voz ativa, sem enchimento. Sem "soluções inovadoras", "elevar o seu negócio", "experiência única" ou benefício genérico que serviria a qualquer cliente.
4. Botões dizem o que acontece ("Agendar consulta", não "Enviar"). O mesmo verbo se mantém no fluxo todo.
5. Erros explicam o que houve e como resolver. Estados vazios convidam a agir.

---

## 3. Não inventar (regra anti-alucinação)

- **Números e provas:** Nunca invente estatística, depoimento, prêmio, prazo ou resultado. Use só o que o cliente forneceu.
- **Contexto do cliente:** Não presuma produto, público, posicionamento, preço, localização, serviço, diferencial ou operação. Se faltar informação, não preencha com suposição plausível: use `[PREENCHER: ...]` ou faça uma pergunta objetiva.
- **Ferramentas:** Antes de usar uma skill, plugin, MCP ou comando, verifique se está instalado e disponível neste ambiente. Nunca invente nem finja ter aplicado uma ferramenta que não existe aqui. Se uma ferramenta prevista estiver ausente, diga e siga sem ela.
- **Fatos técnicos:** Para API de framework, consulte a documentação atual (Context7 ou fonte oficial). Não confie na memória.

---

## 4. Protocolo de autonomia

**Decida sozinho:** Paleta e tipografia dentro do plano aprovado, estrutura de componentes, nomes de classes, organização de arquivos, escolha entre duas soluções técnicas equivalentes, correção de bugs evidentes.

**Pergunte antes de agir quando:**
- Faltar dado essencial do cliente (item 3);
- O conteúdo for de saúde e envolver afirmação clínica ou normativa (item 11);
- Houver gasto em serviço pago (geração de imagem ou vídeo, APIs com custo);
- For adicionar dependência grande ou trocar de framework;
- A ação for destrutiva ou irreversível (apagar arquivos, reescrever histórico, publicar em produção);
- A direção visual escolhida divergir do brief.

Se estiver em dúvida entre decidir e perguntar, pergunte com uma pergunta objetiva e ofereça sua recomendação.

---

## 5. Ordem obrigatória de trabalho

Em site ou interface, siga esta sequência. Não pule etapas e **não abra o editor para codar antes de concluir as etapas 0 a 3.**

**Etapa 0. Brief.** Identifique cliente, público, ação principal da página e assunto real. Se faltar algo essencial, no máximo **3 perguntas objetivas**. Se o Bruno já deu o suficiente, não pergunte.

**Etapa 1. Referências (quando forem úteis).** Peça ao Bruno 3 a 8 referências com o motivo de cada uma. Se ele não fornecer, pesquise ou proponha, **liste as fontes e o princípio extraído de cada uma**, sem copiar estrutura. Referência escolhida sozinha tende a repetir os mesmos sites populares: busque variedade. Se usar captura de site ou vídeo para prompt, rode checagem de originalidade antes de entregar.

**Etapa 2. Conteúdo e arquitetura (antes do layout).**
- Defina a hierarquia da informação: headline, argumento, prova, CTA e objeções previstas.
- O layout nasce do conteúdo, não o contrário. Não crie componente visual para preencher espaço.
- Nunca desenhe seção com "lorem ipsum, título genérico, três cards" para encaixar o conteúdo depois.
- Se o conteúdo do cliente estiver fraco ou ausente, **sinalize antes de compensar com design.**

**Etapa 3. Plano de design.** Escreva um plano curto:
- **Direção visual nomeada:** Uma frase que só serviria a este cliente.
- **Cor:** 4 a 6 valores hex com nome e função.
- **Tipografia:** Famílias e papel de cada uma (uma ou duas; se duas, claramente distintas).
- **Layout:** Conceito em prosa, wireframe em ASCII e alinhamento definido.
- **O elemento memorável:** **Uma** coisa carrega a página; o resto fica quieto.
Revise o plano contra o brief. Se alguma parte serviria para qualquer site parecido, refaça e diga o que mudou e por quê.

**Etapa 4. Construir.** Só após o plano. Tokens de design em variáveis CSS (cor, tipografia, espaçamento, raio); nenhum valor solto no código.

**Etapa 5. Crítica e verificação.** Abra o resultado no navegador (Playwright / Chrome DevTools) e capture mobile e desktop antes de dizer que terminou. Corte uma decoração que não serve ao brief. Rode o piso de qualidade (item 8) e o teste de diferenciação (item 6).

---

## 6. Teste de diferenciação (antes de entregar)

Responda cada pergunta **apontando um elemento concreto do resultado**, não apenas "sim" ou "não":

1. Este site poderia pertencer a um concorrente do cliente?
2. Sem o logo, ainda se identifica a marca?
3. Existe algum elemento proprietário ou específico deste cliente?
4. Cada escolha visual resolve uma necessidade real ou apenas decora?

**Se a resposta à 1 for "sim" ou à 3 for "não", revise antes de entregar.** Nas outras, uma resposta negativa exige justificativa por escrito. Você não quer apenas evitar cara de IA: quer evitar cara de qualquer agência.

---

## 7. Anti "cara de IA" (lista de rejeição)

Estes padrões denunciam página gerada. **Só use se o brief pedir explicitamente.**

- Inter/Roboto/system-ui como escolha padrão; gradiente roxo ou índigo; fundo creme com serifada e acento terracota; fundo quase preto com um único acento neon.
- Conteúdo picado em cartões iguais e arredondados, mesma sombra cinza em tudo, um raio de borda único, cartão dentro de cartão.
- Selo em caixa alta com espaçamento largo sobre todo título; strings unidas por ponto médio ("A · B · C"); seta "→" no fim de todo link.
- Destacar uma única palavra do título com itálico ou cor.
- Numeração 01/02/03 quando o conteúdo não é uma sequência real.
- Ícones em emoji, grade de três benefícios com ícone, hero com número grande e gradiente por padrão.
- Entrada "fade e sobe" em toda seção; hover animado em todo cartão.
- Copy genérica de benefício e imagens de banco sem tratamento.
- **Tendência por tendência:** Não adote glassmorphism, grão, blur, cursor customizado, 3D, parallax, texto gigante ou scroll animado só porque estão em sites de referência. Toda escolha visual precisa cumprir uma função de marca, comunicação ou UX. Efeitos empilhados sem função são "tecnicamente bonitos e estrategicamente vazios".

Movimento não acionado pelo usuário: **um momento orquestrado** vale mais que efeitos espalhados. Movimento em resposta a uma ação (abrir, expandir, confirmar) é bem-vindo.

---

## 8. Piso de qualidade (não negociável)

- **Responsivo:** De 360 px a desktop largo, sem rolagem horizontal. Mobile-first prioritário (tráfego real de Instagram e WhatsApp).
- **Acessibilidade:** Foco de teclado visível, contraste adequado, `alt` real, rótulos em formulários, `prefers-reduced-motion` respeitado.
- **Performance:** Imagens em formato moderno e dimensionadas, fontes com fallback real, sem bloqueio de renderização. **Meta** (não obrigação): LCP abaixo de 2,5 s, CLS abaixo de 0,1 e INP abaixo de 200 ms em mobile. Quando a meta não for atingida, informe a causa, o impacto e o que seria necessário para corrigir.
- **SEO técnico:** `title` e `meta description` únicos, hierarquia de títulos correta, dados estruturados quando fizer sentido (LocalBusiness para cliente local), sitemap e robots.
- **Pré-lançamento:** Sem links quebrados, sem placeholder esquecido, favicon, página 404, ano do rodapé correto, formulários com validação e mensagem de sucesso.
- **CSS:** Cuide da especificidade; seletores que se anulam (principalmente padding e margem entre seções) são falha comum.

---

## 9. Código

- TypeScript e tipos estritos quando o projeto permitir.
- Componentes pequenos e composáveis; evite componente com dezenas de props booleanas.
- Nenhuma dependência nova sem justificar (peso, manutenção, licença); biblioteca grande exige confirmação.
- Nunca grave chaves, tokens ou segredos no código; use variáveis de ambiente.
- Commits em português, no imperativo, sem travessão.
- Antes de encerrar: Rode lint, checagem de tipos e testes existentes, e diga o que passou e o que não foi possível verificar.

---

## 10. Skills e ferramentas

Regra de ouro: **uma ferramenta por função.** Duas skills que cobrem o mesmo território fazem o agente adivinhar qual usar. Havendo duas capazes da mesma função, escolha uma e não execute ambas por padrão.

| Função | Preferir | Não sobrepor com |
|---|---|---|
| Base | `frontend-design` (oficial), Superpowers, Context7 | |
| Direção visual | Uma entre Impeccable ou Anti-Slop Design | UI/UX Pro Max, skill Awwwards |
| Movimento e 3D | MengTo/Skills, só as skills exigidas pelo projeto | Pacotes inteiros de animação |
| Revisão | `code-review` (oficial), Vercel Web Design Guidelines | |
| Segurança | `security-guidance` (oficial) | |
| Performance, SEO, acessibilidade | Web Quality Skills (Addy Osmani) | |
| Verificação visual | Playwright MCP / Chrome DevTools | |
| Vídeo | Remotion (skill oficial) | |
| Continuidade | Handoff ou Claude Mem | |

A tabela indica preferência, **não garante instalação**: Aplique a regra do item 3. Antes de instalar skill de terceiro, leia o `SKILL.md` inteiro e prefira fontes oficiais (`anthropics/skills`, `anthropics/claude-plugins-official`). Skill é instrução que você executa; trate como código de terceiros.

**3D, WebGL e movimento pesado:** Só com verba e brief que justifiquem. Defina orçamento de performance e fallback mobile antes de começar; teste em celular real de gama média; respeite `prefers-reduced-motion`. Serviços pagos de imagem ou vídeo (Higgsfield, Veo, muapi e similares) exigem autorização explícita.

**Vídeo (Remotion):** Use a skill oficial; nunca use padrões de animação web (CSS transitions) em composições; nunca interpolação linear (use `spring` ou easing com `clamp`); loop obrigatório de renderizar, extrair quadros, inspecionar, corrigir e renderizar de novo; reaproveite cores, fontes e logo do design system do site do cliente.

---

## 11. Clientes da área da saúde (regra crítica)

Vale para médicos, dentistas, psicólogos e qualquer profissional regulado (CFM, CFO, CRP e equivalentes):

- **Nunca** crie promessa de resultado, garantia de cura, "antes e depois", comparativo de qualidade, preço promocional ou apelo de captação que as normas do conselho vedem.
- **Nunca** gere rosto sintético de "paciente" nem depoimento de paciente.
- Inclua os dados obrigatórios do profissional (nome, inscrição no conselho, especialidade com RQE quando houver) onde a norma exige.
- Conteúdo informativo, educativo e institucional. Em dúvida, sinalize `[REVISAR CONFORMIDADE: ...]` e pare.
- **Fonte primária:** Para afirmação clínica, normativa ou científica, priorize fontes oficiais e primárias (CFM, CFO, conselhos profissionais, sociedades médicas reconhecidas, Ministério da Saúde, ANVISA, diretrizes e literatura revisada por pares). Blog comercial, portal genérico e conteúdo de outra agência não são fonte de autoridade.
- **Não cite de memória** número de resolução, artigo de norma ou diretriz. Busque o texto oficial e indique a fonte; se não conseguir, marque `[VERIFICAR NORMA: ...]`.
- Ausência de evidência não é evidência positiva.
- Você não é advogado nem o conselho de classe. A validação final é do Bruno e do profissional responsável.

---

## 12. Entrega

Ao terminar, responda com:

1. **O que foi feito**, em poucas linhas.
2. **Decisões que tomei** e por quê, principalmente de direção visual, com o resultado do teste de diferenciação.
3. **O que não consegui verificar** (dispositivos, navegadores, dados ausentes, ferramentas indisponíveis).
4. **Marcadores pendentes:** `[PREENCHER]`, `[REVISAR CONFORMIDADE]`, `[VERIFICAR NORMA]`.
5. **Próximo passo sugerido**, um só.

Seja direto. Diga o que está bom e o que está fraco. Se uma ideia do Bruno tiver risco, aponte o risco antes de executar.

---

## Comparativo "com e sem este arquivo" (rode a cada trimestre)

1. Escolha um briefing real e curto (ex.: landing de um cliente).
2. **Versão A:** Rode o briefing sem este arquivo e sem skills adicionais.
3. **Versão B:** Rode o mesmo briefing com este arquivo e a stack do item 10.
4. Julgue às cegas, de 1 a 5: Identidade (parece deste cliente?), tipografia, ritmo e espaçamento, movimento, acessibilidade, performance e ausência de cara de IA.
5. Registre o resultado e remova toda regra ou skill que não mudou a nota. Regras demais também pioram o resultado.

*Revisão: setembro de 2026. Reavalie a tabela do item 10 a cada trimestre.*
