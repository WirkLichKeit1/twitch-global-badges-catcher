from get_badges import catch_badges
from flask import Flask, jsonify, render_template
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.get("/badges")
def get_all_badges():
    client_id = os.getenv("CLIENT_ID")
    client_secret = os.getenv("CLIENT_SECRET")
    
    badges = catch_badges(client_id, client_secret)
    return jsonify(badges)

if __name__ == "__main__":
    app.run()