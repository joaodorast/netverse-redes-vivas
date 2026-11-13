# Contribuição

Use Node 24, TypeScript estrito, textos em português e componentes focados. O motor deve continuar independente da interface. Evite temporizadores de protocolo na UI: use a fila e o relógio virtual. Toda ação visível deve ter efeito real e uma explicação adequada.

Antes de compartilhar alterações, rode typecheck, lint, testes e build. Para mudanças de interface, repita os testes de navegador pertinentes e inspecione telas em notebook e celular. Testes devem verificar comportamento, não apenas repetir a implementação.

## Regra de histórico

**Exatamente um arquivo alterado por commit, inclusive o inicial.** Faça staging explícito do caminho, confira `git diff --cached --name-only` e só faça commit se houver um único arquivo. Não use `git add .`, `git add -A` ou `git commit -a`.

Use Conventional Commits com prefixo em inglês e descrição técnica em PT-BR:

```text
feat(simulacao): implementa o encaminhamento entre enlaces
fix(tcp): preserva a sequência ao retransmitir dados
test(web): verifica a montagem após recuperar uma perda
docs(apresentacao): organiza o roteiro de demonstração
```

Não adicione coautoria automática, assinaturas promocionais ou trailers de IA. Use a identidade Git real já autorizada. Isso não elimina a obrigação de declarar o apoio de IA na documentação acadêmica. Valide o conjunto antes de publicar a sequência e não reescreva histórico compartilhado.
