"""Recorta, reduz e converte as fotos dos candidatos para WebP leve (128 px).

Uso:  python python/processar_fotos.py

Entrada: dados_brutos/fotos/ + recortes.json.  Saída: docs/assets/img/candidatos/
e o mapa FOTOS dentro de docs/data/eleicoes_2026.json. Quem não tiver foto
aparece no site com as iniciais. Depois rode build_dados.py.
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata

from PIL import Image

from config import DADOS_JSON, FOTOS_BRUTAS, FOTOS_RECORTES, FOTOS_SAIDA, SITE

TAMANHO = 128
QUALIDADE = 72


def slug(nome: str) -> str:
    s = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def recortar(caminho, cx: float, cy: float, lado: float) -> Image.Image:
    img = Image.open(caminho).convert("RGB")
    w, _ = img.size
    x, y, s = cx * w, cy * w, lado * w
    caixa = (int(x - s / 2), int(y - s / 2), int(x + s / 2), int(y + s / 2))
    return img.crop(caixa).resize((TAMANHO, TAMANHO), Image.LANCZOS)


def main() -> int:
    cfg = json.loads(FOTOS_RECORTES.read_text(encoding="utf-8"))
    FOTOS_SAIDA.mkdir(parents=True, exist_ok=True)
    mapa: dict[str, str] = {}
    for f in cfg["fotos"]:
        origem = FOTOS_BRUTAS / f["arquivo"]
        if not origem.exists():
            print(f"  aviso: {origem.name} não encontrado, {f['nome']} fica com iniciais")
            continue
        destino = FOTOS_SAIDA / f"{slug(f['nome'])}.webp"
        recortar(origem, f["cx"], f["cy"], f["lado"]).save(destino, "WEBP", quality=QUALIDADE)
        mapa[f["nome"]] = destino.relative_to(SITE).as_posix()
        print(f"  {f['nome']:<18} -> {mapa[f['nome']]} ({destino.stat().st_size / 1024:.1f} KB)")

    dados = json.loads(DADOS_JSON.read_text(encoding="utf-8"))
    dados["FOTOS"] = mapa
    DADOS_JSON.write_text(json.dumps(dados, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"OK: {len(mapa)} fotos registradas em {DADOS_JSON.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
