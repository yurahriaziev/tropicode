from flask import Flask
from flask_cors import CORS
import os
import boto3
from boto3.s3.transfer import TransferConfig
from dotenv import load_dotenv
import redis

app = Flask(__name__, static_folder="static")
app.secret_key = os.urandom(24)
load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SESSION_TYPE'] = 'redis'
# app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_KEY_PREFIX'] = 'oauth_'
app.config['SESSION_REDIS'] = redis.StrictRedis(host='localhost', port=6379, db=1, decode_responses=True)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

# production_url = "https://www.tropicode.tech"
production_url = "http://localhost:3000"

CORS(app, resources={r"/*": {"origins": {"http://localhost:3000", "https://yurahriaziev.github.io", "https://www.tropicode.tech"}}})

S3_BUCKET = 'tropicode-homework-files'
S3_REGION = 'us-east-1'

# FIXME
transfer_config = TransferConfig(multipart_threshold=10 * 1024 * 1024, max_concurrency=10, multipart_chunksize=10 * 1024 * 1024)
s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=S3_REGION
)
