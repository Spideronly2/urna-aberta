"""Valida os dados oficiais e gera docs/assets/js/dados.js para o site.

Uso:  python python/build_dados.py

Fonte única: docs/data/eleicoes_2026.json. Qualquer número do painel muda ali,
e este script confere as somas antes de publicar (nada é estimado).
"""
from __future__ import annotations

import json
import sys

from config import DADOS_JS, DADOS_JSON, SITE

REGIOES = {"N", "NE", "CO", "SE", "S"}


def validar(d: dict) -> list[str]:
    erros: list[str] = []

    def checa(cond: bool, msg: str) -> None:
        if not cond:
            erros.append(msg)

    soma_p1 = sum(c["v"] for c in d["P1"])
    t1 = d["T1"]
    checa(soma_p1 == t1["validos"], f"1º turno: soma dos candidatos ({soma_p1}) ≠ válidos ({t1['validos']})")
    checa(t1["validos"] + t1["brancos"] + t1["nulos"] == t1["comp"], "1º turno: válidos + brancos + nulos ≠ comparecimento")
    checa(sum(c["v"] for c in d["P2"]) <= d["T2"]["comp"], "2º turno: votos válidos maiores que o comparecimento")
    checa(d["T1"]["comp"] <= d["ELEIT"] and d["T2"]["comp"] <= d["ELEIT"], "Comparecimento maior que o eleitorado")
    checa(sum(d["CAM26"].values()) == 513, f"Câmara 2026 soma {sum(d['CAM26'].values())}, esperado 513")
    checa(sum(d["SEN26"].values()) == 54, f"Senado 2026 soma {sum(d['SEN26'].values())}, esperado 54")
    checa(len(d["UFS"]) == 27, f"{len(d['UFS'])} UFs, esperado 27")
    for uf, u in d["UFS"].items():
        checa(u[1] in REGIOES, f"{uf}: região inválida {u[1]}")
        checa(u[2] in ("f", "l"), f"{uf}: líder inválido {u[2]}")
        checa(0 < u[3] <= 100, f"{uf}: percentual fora de 0–100")
        checa(len(u[8]) == 2, f"{uf}: esperado 2 senadores")
    nomes = {c["n"] for c in d["P1"]}
    for nome, caminho in d.get("FOTOS", {}).items():
        checa(nome in nomes, f"Foto de '{nome}' não corresponde a candidato")
        checa((SITE / caminho).exists(), f"Arquivo de foto ausente: {caminho}")
    return erros


def main() -> int:
    dados = json.loads(DADOS_JSON.read_text(encoding="utf-8"))
    erros = validar(dados)
    if erros:
        print("Dados inválidos, nada foi gerado:")
        for e in erros:
            print("  -", e)
        return 1

    publico = {k: v for k, v in dados.items() if not k.startswith("_")}
    nomes = ",".join(publico)
    js = (
        "/* Gerado por python/build_dados.py a partir de data/eleicoes_2026.json. Não edite à mão. */\n"
        f"const DADOS={json.dumps(publico, ensure_ascii=False, separators=(',', ':'))};\n"
        f"const {{{nomes}}}=DADOS;\n"
        "const PHOTO=FOTOS;\n"
    )
    DADOS_JS.write_text(js, encoding="utf-8")
    p1 = dados["P1"]
    print(f"OK: {len(p1)} candidatos, {len(dados['UFS'])} UFs, {len(dados.get('FOTOS', {}))} fotos -> {DADOS_JS.relative_to(SITE.parent)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
