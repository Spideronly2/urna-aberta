# Urna Aberta · Eleições 2026

Painel público, gratuito e sem login com os resultados oficiais das Eleições Gerais de 2026 (TSE).
Ele traz gráficos de pizza, linha, combo e barras, filtros por estado e região, um comparador de candidatos e um leitor dos CSVs do TSE.

## Estrutura

```
urna-aberta/
├── docs/                      ← site publicado (GitHub Pages lê esta pasta)
│   ├── index.html             ← HTML (estrutura das telas)
│   ├── assets/css/styles.css  ← CSS (cores, tema claro/escuro, layout)
│   ├── assets/js/
│   │   ├── dados.js           ← GERADO pelo Python, não editar
│   │   ├── utils.js           ← formatação e barras
│   │   ├── graficos.js        ← pizza, linha, combo, avatares (SVG)
│   │   ├── leitor-csv.js      ← lê CSV do TSE no navegador
│   │   └── app.js             ← abas, filtros e telas
│   ├── assets/img/candidatos/ ← fotos processadas (WebP, 128 px)
│   └── data/eleicoes_2026.json← FONTE ÚNICA dos números
├── python/
│   ├── config.py              ← caminhos
│   ├── build_dados.py         ← valida somas e gera dados.js
│   ├── processar_fotos.py     ← recorta/reduz fotos
│   └── agregar_tse.py         ← resume CSV do TSE (pandas)
├── dados_brutos/
│   ├── fotos/                 ← originais + recortes.json
│   └── tse/                   ← CSVs baixados do TSE (ignorados pelo git)
├── requirements.txt
└── README.md
```

O Python roda só no seu computador, para preparar os dados. O site publicado contém apenas HTML, CSS e JavaScript, por isso funciona no GitHub Pages sem servidor.

## Como usar

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows  (Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt

python python/processar_fotos.py   # após adicionar/trocar fotos
python python/build_dados.py       # após editar docs/data/eleicoes_2026.json
```

Para ver o site, abra `docs/index.html` no navegador.

### Atualizar um número
1. Edite o valor em `docs/data/eleicoes_2026.json`.
2. Rode `python python/build_dados.py`. Se alguma soma não fechar (12 candidatos = votos válidos, Câmara = 513, Senado = 54, 27 UFs, fotos existentes), o script mostra o erro e não gera o arquivo.

### Adicionar uma foto
1. Coloque o arquivo em `dados_brutos/fotos/`.
2. Acrescente uma entrada em `recortes.json` com o nome do candidato, o arquivo e o recorte (`cx`, `cy` e `lado`, em fração da largura da imagem).
3. Rode `processar_fotos.py` e depois `build_dados.py`.

Quem não tiver foto aparece com as iniciais do nome.

### Dados por município (TSE)
1. Baixe `votacao_candidato_munzona_2026_<UF>.zip` em https://dadosabertos.tse.jus.br e extraia o CSV em `dados_brutos/tse/`.
2. Rode:

```bash
python python/agregar_tse.py dados_brutos/tse/votacao_candidato_munzona_2026_SP.csv --cargo Governador --top 10
```

O script gera `docs/data/tse/<arquivo>.json`, com o ranking por estado e por município.

## Publicar no GitHub Pages
1. Crie o repositório `urna-aberta` e envie todos os arquivos.
2. Vá em **Settings → Pages → Deploy from a branch → main / docs → Save**.
3. O site fica em `https://SEU_USUARIO.github.io/urna-aberta/`.

## Fontes e neutralidade
Os números vêm do TSE e de apurações publicadas com base no TSE. A lista completa e as divergências entre fontes estão na aba **Fontes** do site.
As cores dos candidatos não seguem as dos partidos, e as listas são sempre ordenadas por votos.
