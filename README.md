# FPC Pratas — E-commerce + Painel Admin

Loja de joalheria em prata 925 com painel administrativo. **Site estático funcional** — roda em qualquer hospedagem estática (GitHub Pages, Vercel, Netlify), sem backend. Pedidos e atendimento chegam pelo **WhatsApp da loja** com mensagem pré-preenchida.

## Como rodar / publicar

**Local:** qualquer servidor estático na raiz do repositório, por exemplo:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

(Não abra o `index.html` direto com dois cliques — precisa ser servido via HTTP.)

**GitHub Pages:** o workflow em `.github/workflows/pages.yml` publica automaticamente a cada push na `main`. Se for a primeira vez: em *Settings → Pages*, defina **Source: GitHub Actions**.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Loja completa (home, catálogo, produto, sacola, checkout, confirmação, atendimento). |
| `admin.html` | Painel admin (dashboard, peças, banners, pedidos, personalizações, clientes, configurações) — por enquanto com dados de demonstração. |
| `support.js` | Runtime do protótipo (mini-framework React-like). Numa migração futura para Next.js/React, substituir. |
| `vendor/` | React 18 servido localmente (sem dependência de CDN — importante para celular com rede instável). |
| `assets/logo-fpc.png` | Logo oficial com fundo transparente (usar sobre fundos escuros). |
| `assets/*.png` | Fotos reais de produtos já usadas no catálogo. |
| `uploads/` | Material bruto enviado pelo dono (não referenciado pelo site). |

## O que já funciona de verdade

- **Catálogo**: busca por texto (ignora acentos) + filtros combináveis de categoria, acabamento e peso; estado vazio com "Limpar filtros".
- **Produto**: especificações em tabela; personalização com preço somado em tempo real — gravação +R$25 (texto até 20 caracteres), polimento especial +R$18, ajuste de medida +R$15. Barra fixa "Adicionar" no mobile.
- **Sacola**: quantidade, remoção, **persiste no aparelho** (localStorage) — não se perde ao recarregar. Frete R$24, grátis ≥ R$300.
- **Checkout**: dados do cliente + entrega + pagamento (Pix pré-selecionado, cartão até 3×, boleto); exige aceite dos termos; ao confirmar, **abre o WhatsApp da loja com o pedido completo** (itens, personalizações, total, pagamento, endereço) e mostra a tela de confirmação com nº do pedido.
- **Atendimento**: formulário abre o WhatsApp com a mensagem preenchida; FAQ; horário e redes.
- **WhatsApp**: número `553184937038`. Todos os CTAs usam `https://wa.me/...` com mensagem contextual (produto, personalização, solda, pós-pedido). Botão flutuante some no checkout e na página de produto.
- **Mobile**: menu drawer, chips de filtro com scroll horizontal, grid 2 colunas, hit targets ≥ 44px, sem scroll horizontal (testado em 390×844).

## Design tokens (NÃO alterar sem pedido do dono)

```
Fundo claro:    #f4f2ee (gradiente radial p/ #fbf9f5 no topo)
Escuro (hero/footer): #101216 / #0b0c0e
Texto:          #17181a   · secundário #514d45 · mudo #6d685e
Acento (marrom): #a47864  — CSS var --gold; hover/escuro #8b6350
Prata (logo/detalhes): gradiente #fafbfc→#c8cdd4→#9aa3ac
Bordas claras:  #e5e1d8 / #e2ddd1 · chips #ddd8cc
Status: sucesso #10B981 · aviso #F59E0B · erro #EF4444 · info #3B82F6
Fontes: Playfair Display (títulos) · Inter (corpo/botões) · IBM Plex Mono (SKU, preços técnicos, labels)
Botões/inputs: radius 2px · cards: sem radius · espaçamento base 8px
```

**Assinatura visual**: linha fina + losango (◆) em marrom antes dos títulos de seção (`.sig`/`.sigline`/`.sigdia`). Nada de dourado/amarelo: a paleta é preto + prata + marrom.

## Conteúdo real do negócio

- Marca: **FPC Pratas** · Nova Contagem, Contagem — MG
- Instagram: [@fpc_pratas](https://www.instagram.com/fpc_pratas/) · Facebook: [FPC Pratas](https://www.facebook.com/299398896598348) · WhatsApp: +55 31 8493-7038
- Horário: Seg–Sex 9h–18h · Sáb 9h–13h
- Produtos com foto real: Colar Borboleta Cravejada, Pingente Crucifixo, Conjunto Ponto de Luz, Conjunto 3x1 70cm/10mm (em `assets/`). Os demais itens do catálogo são exemplos — confirmar preços/pesos com o dono e editar o array `P` dentro de `index.html`.

## Próximos passos sugeridos (em ordem)

1. Conferir/ajustar preços, pesos e fotos das peças reais no array `P` em `index.html`.
2. Pagamento integrado com Pix automático (Mercado Pago ou Pagar.me) + webhook de confirmação.
3. Frete por CEP (Correios/Melhor Envio) no carrinho.
4. Backend + banco para o admin gerenciar peças/pedidos de verdade (hoje o admin é demonstração).
5. Auth do admin + upload de imagens.
6. SEO por produto (meta/OG, sitemap) e e-mails transacionais.

## Regras de ouro

- Todo texto do site em **pt-BR**, tom direto ("Adicionar peça", "Ver pedido", "Falar com consultor").
- Terminologia técnica de joalheria: "Prata 925", peso em gramas, "Polido espelhado / Acetinado / Oxidado".
- Não inventar seções novas sem pedido do dono.
