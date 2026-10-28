"""Resume um CSV oficial do TSE (votacao_candidato_munzona_2026_UF.csv) em JSON.

Uso:
  python python/agregar_tse.py dados_brutos/tse/votacao_candidato_munzona_2026_SP.csv
  python python/agregar_tse.py ARQUIVO.csv --cargo "Governador" --top 10

O arquivo vem de https://dadosabertos.tse.jus.br (separador ';', Latin-1).
Lê em blocos para caber em computadores simples e soma os votos nominais por
turno, cargo, UF, município, candidato e partido. A saída vai para
docs/data/tse/<nome>.json e pode ser publicada junto com o site.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pandas as pd

from config import TSE_SAIDA

COLUNAS = {
    "NR_TURNO": "turno",
    "DS_CARGO": "cargo",
    "SG_UF": "uf",
    "NM_MUNICIPIO": "municipio",
    "NM_URNA_CANDIDATO": "candidato",
    "SG_PARTIDO": "partido",
    "QT_VOTOS_NOMINAIS": "votos",
}
CHAVES = ["turno", "cargo", "uf", "municipio", "candidato", "partido"]


def ler(caminho: Path, encoding: str, bloco: int = 200_000) -> pd.DataFrame:
    partes = []
    leitor = pd.read_csv(caminho, sep=";", encoding=encoding, dtype=str,
                         usecols=lambda c: c in COLUNAS, chunksize=bloco)
    for parte in leitor:
        parte = parte.rename(columns=COLUNAS)
        parte["votos"] = pd.to_numeric(parte["votos"], errors="coerce").fillna(0).astype("int64")
        partes.append(parte.groupby(CHAVES, as_index=False)["votos"].sum())
    if not partes:
        raise ValueError("Arquivo vazio")
    df = pd.concat(partes).groupby(CHAVES, as_index=False)["votos"].sum()
    faltando = set(COLUNAS.values()) - set(df.columns)
    if faltando:
        raise ValueError(f"Colunas ausentes: {', '.join(sorted(faltando))}")
    return df


def ranking(df: pd.DataFrame, por: list[str]) -> pd.DataFrame:
    r = df.groupby(por + ["candidato", "partido"], as_index=False)["votos"].sum()
    r["pct"] = (r["votos"] / r.groupby(por)["votos"].transform("sum") * 100).round(2)
    return r.sort_values(por + ["votos"], ascending=[True] * len(por) + [False])


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("csv", type=Path)
    ap.add_argument("--encoding", default="latin-1")
    ap.add_argument("--cargo", help="Filtra um cargo, por exemplo 'Presidente'")
    ap.add_argument("--top", type=int, default=5, help="Quantos candidatos mostrar no terminal")
    a = ap.parse_args()

    df = ler(a.csv, a.encoding)
    if a.cargo:
        df = df[df["cargo"].str.casefold() == a.cargo.casefold()]
    estado = ranking(df, ["turno", "cargo", "uf"])
    municipio = ranking(df, ["turno", "cargo", "uf", "municipio"])

    TSE_SAIDA.mkdir(parents=True, exist_ok=True)
    saida = TSE_SAIDA / f"{a.csv.stem}.json"
    saida.write_text(json.dumps({
        "fonte": a.csv.name,
        "por_estado": estado.to_dict("records"),
        "por_municipio": municipio.to_dict("records"),
    }, ensure_ascii=False), encoding="utf-8")

    for (turno, cargo, uf), g in estado.groupby(["turno", "cargo", "uf"]):
        print(f"\n{cargo} · {uf} · {turno}º turno")
        for _, l in g.head(a.top).iterrows():
            print(f"  {l['candidato']:<28} {l['partido']:<14} {l['votos']:>12,}  {l['pct']:>6.2f}%".replace(",", "."))
    print(f"\nOK: {len(df):,} linhas agregadas -> {saida}".replace(",", "."))
    return 0


if __name__ == "__main__":
    sys.exit(main())
