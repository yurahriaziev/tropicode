from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

CORS(app, resources={r"/*": {"origins": {"http://localhost:3000", "https://yurahriaziev.github.io"}}})
