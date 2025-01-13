from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

production_url = "https://www.tropicode.tech"

CORS(app, resources={r"/*": {"origins": {"http://localhost:3000", "https://yurahriaziev.github.io", "https://www.tropicode.tech"}}})
