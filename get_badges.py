import requests

def catch_badges(client_id, client_secret):
    url = "https://id.twitch.tv/oauth2/token"

    token_params = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "client_credentials"
    }

    token_response = requests.post(url, params=token_params)

    if token_response.status_code != 200:
        raise Exception(f"Erro ao obter token: {token_response.text}")

    access_token = token_response.json()["access_token"]

    badges_url = "https://api.twitch.tv/helix/chat/badges/global"
    
    headers = {
        "Client-ID": client_id,
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(badges_url, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Erro na requisição: {response.text}")

    data = response.json()
    if not data:
        return None

    return data