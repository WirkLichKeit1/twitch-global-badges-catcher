import requests
from bs4 import BeautifulSoup
import json
import os

URL = "https://www.pe.senai.br/editais/"
ARQUIVO = "editais_salvos.json"

def pegar_editais():
    r = requests.get(URL)
    soup = BeautifulSoup(r.text, "html.parser")

    links = soup.find_all("a")

    editals = []
    for link in links:
        texto = link.get_text(strip=True)
        href = link.get("href")

        if texto.lower().startswith('edital'):
            editals.append({"titulo": texto, "link": href})
    
    return editals

def main():
    novos = pegar_editais()
    
    if os.path.exists(ARQUIVO):
        antigos = json.load(open(ARQUIVO))
    else:
        antigos = []
    
    antigos_links = {e["link"] for e in antigos}
    editais_novos = [e for e in novos if e["link"] not in antigos_links]

    if editais_novos:
        print("Novo edital encontrado")
        for e in editais_novos:
            print("-", e["titulo"], e["link"])
    else:
        print("Nenhum edital novo.")

    json.dump(novos, open(ARQUIVO, "w"), indent=4)

if __name__ == "__main__":
    main()