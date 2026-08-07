# FPC Pratas

Site institucional e catálogo da FPC Pratas.

## Estrutura

- `project/index.html`: página completa do site.
- `project/catalogo.js`: nomes, categorias, medidas, valores e caminhos das fotos.
- `project/assets/`: pasta destinada às fotos dos produtos.

## Como adicionar as fotos

1. Coloque a foto dentro de `project/assets/`.
2. Abra `project/catalogo.js`.
3. Localize a peça pelo nome.
4. Preencha o campo `image` com o caminho do arquivo.

Exemplo:

```js
image: 'assets/corrente-elo-duplo.jpg'
```

Enquanto o campo estiver vazio, o site mostra o placeholder “Foto em breve”.

## Publicação

O arquivo `vercel.json` publica a pasta `project` na Vercel.
