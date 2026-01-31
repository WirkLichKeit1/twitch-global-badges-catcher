import requests
from bs4 import BeautifulSoup
import json
import os
from pypdf import PdfReader
import re
from unidecode import unidecode
import urllib3

urllib3.disable_warnings()

URL = "https://www.pe.senai.br/editais/"
ARQUIVO = "editais_salvos.json"

# agora sem acentos
CIDADE_CHAVES = ["cabo", "cabo de santo agostinho"]

TI_CHAVES = [
    "informatica",
    "programacao",
    "desenvolvimento",
    "software",
    "redes",
    "sistemas",
    "computacao"
]

PADRAO_GENERICO = re.compile(r"edital.*\d+\s*vagas", re.IGNORECASE)


def pegar_editais():
    r = requests.get(URL, verify=False)
    soup = BeautifulSoup(r.text, "html.parser")

    editais = []
    for link in soup.find_all("a"):
        titulo = link.get_text(strip=True)
        href = link.get("href")

        if titulo.lower().startswith("edital") and href:
            if ".pdf" in href.lower():
                editais.append({"titulo": titulo, "link": href})

    return editais


def titulo_relevante(titulo):
    t = unidecode(titulo.lower())

    if any(c in t for c in CIDADE_CHAVES):
        return True

    if any(p in t for p in TI_CHAVES):
        return True

    if PADRAO_GENERICO.search(t):
        return False

    return False


def baixar_pdf(url_pdf):
    nome = url_pdf.split("/")[-1]
    r = requests.get(url_pdf, verify=False)

    with open(nome, "wb") as f:
        f.write(r.content)

    return nome


def extrair_texto_pdf(arquivo_pdf):
    reader = PdfReader(arquivo_pdf)
    texto = ""

    for pagina in reader.pages:
        texto += pagina.extract_text() or ""

    return unidecode(texto.lower())


def corresponde_pdf(texto_pdf):
    cidade_ok = any(c in texto_pdf for c in CIDADE_CHAVES)
    ti_ok = any(p in texto_pdf for p in TI_CHAVES)
    return cidade_ok and ti_ok


def main():
    editais = pegar_editais()

    if os.path.exists(ARQUIVO):
        antigos = json.load(open(ARQUIVO))
    else:
        antigos = []

    antigos_links = {e["link"] for e in antigos}
    novos = [e for e in editais if e["link"] not in antigos_links]

    print(f"📌 {len(novos)} edital(is) novo(s).")

    for edital in novos:
        titulo = edital["titulo"]
        print("\n📄", titulo)

        if not titulo_relevante(titulo):
            print("⏭ Ignorado pelo título")
            continue

        print("⬇️ Baixando PDF...")

        try:
            arquivo = baixar_pdf(edital["link"])
            texto = extrair_texto_pdf(arquivo)

            if corresponde_pdf(texto):
                print("🚨 CABO + TI encontrado!")
                print("Link:", edital["link"])
            else:
                print("❌ Não contém CABO + TI.")

            # apagar pdf depois
            os.remove(arquivo)

        except Exception as e:
            print("⚠️ Erro:", e)

    json.dump(editais, open(ARQUIVO, "w"), indent=2)


if __name__ == "__main__":
    main()