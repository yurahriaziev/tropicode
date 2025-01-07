from flask import Flask
from flask_cors import CORS
# from flask_session import Session
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

# app.config['SESSION_TYPE'] = 'filesystem'
# Session(app)
CORS(app, resources={r"/*": {"origins": {"http://localhost:3000", "https://yurahriaziev.github.io"}}})
