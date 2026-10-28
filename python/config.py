"""Caminhos usados pelos scripts. Todos relativos à raiz do projeto."""
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SITE = RAIZ / "docs"                      # pasta publicada no GitHub Pages
DADOS_JSON = SITE / "data" / "eleicoes_2026.json"
DADOS_JS = SITE / "assets" / "js" / "dados.js"
FOTOS_SAIDA = SITE / "assets" / "img" / "candidatos"
FOTOS_BRUTAS = RAIZ / "dados_brutos" / "fotos"
FOTOS_RECORTES = RAIZ / "dados_brutos" / "fotos" / "recortes.json"
TSE_BRUTO = RAIZ / "dados_brutos" / "tse"
TSE_SAIDA = SITE / "data" / "tse"
