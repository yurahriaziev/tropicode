from flask import Flask
from flask_cors import CORS
import os
import boto3
from dotenv import load_dotenv

app = Flask(__name__)
app.secret_key = os.urandom(24)
load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
app.config['SECRET_KEY'] = SECRET_KEY

production_url = "https://www.tropicode.tech"
# production_url = "http://localhost:3000"

CORS(app, resources={r"/*": {"origins": {"http://localhost:3000", "https://yurahriaziev.github.io", "https://www.tropicode.tech"}}})

S3_BUCKET = 'tropicode-homework-files'
S3_REGION = 'us-east-1'

s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=S3_REGION
)