from config import app
from flask import jsonify, request, session, redirect, url_for
from firebase_setup import firestore, db, auth, add_tutor, remove_user, add_student
from functools import wraps
import requests

import jwt
import os
import datetime
from datetime import timezone
import json
import uuid
from urllib.parse import urlencode

from authlib.integrations.flask_client import OAuth

import logging
logging.basicConfig(level=logging.INFO)

SECRET_KEY = "543959eebc61e0d8b79a7bd76028e4afe24d2cbc783a195583f789a70d4f7902"
GREEN = "\033[92m"
RED = "\033[31m"
RESET = "\033[0m"

'''
Google meets create class logic START
'''
CLIENTS_SECRETS = '../backend/client_secret.json'
with open(CLIENTS_SECRETS, "r") as file:
    client_secrets = json.load(file)

CLIENT_ID = client_secrets["web"]["client_id"]
CLIENT_SECRET = client_secrets["web"]["client_secret"]

oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    client_kwargs={
        'scope': 'openid email profile https://www.googleapis.com/auth/calendar.events'
    },
    server_metadata_url= 'https://accounts.google.com/.well-known/openid-configuration'
)

@app.route('/google/login', methods=['GET'])
def google_login():
    tutor_id = request.args.get('tutorId')
    if not tutor_id:
        return jsonify({'error': 'Tutor ID is required'}), 400
    
    tutor_ref = db.collection('tutors').document(tutor_id)
    tutor_doc = tutor_ref.get()
    if not tutor_doc.exists:
        return jsonify({'error': f'Tutor with ID {tutor_id} not found'}), 404
    
    state = json.dumps({'tutorId':tutor_id})
    redirect_uri = url_for('google_callback', _external=True)
    print(f'{RED}{redirect_uri}{RESET}')
    return google.authorize_redirect(redirect_uri, state=state)

@app.route('/oauth2callback')
def google_callback():
    try:
        token = google.authorize_access_token()
        user_info = google.get('userinfo').json()

        state = request.args.get('state')
        if not state:
            return jsonify({'error': 'State parameter is missing'}), 400
        
        try:
            state_data = json.loads(state)
            tutor_id = state_data.get('tutorId')
            if not tutor_id:
                return jsonify({'error': 'Tutor ID is missing from state'}), 400
        except json.JSONDecodeError:
            return jsonify({'error': 'Failed to decode state parameter'}), 400

        email = user_info.get('email')
        google_id = user_info.get('id')
        tutor_ref = db.collection('tutors').document(tutor_id)
        tutor_ref.update({
            'google_email':email, 
            'google_id':google_id,
            'google_access_token':token['access_token']
        })

        tutor_dash_url = f"http://localhost:3000/tutor-dash/{tutor_id}/true"
        return redirect(tutor_dash_url)
    except Exception as e:
        tutor_dash_url = f"http://localhost:3000/tutor-dash/{tutor_id}/false"
        return redirect(tutor_dash_url)
    
@app.route('/create-meeting', methods=['POST'])
def create_meeting():
    try:
        data = request.json
        tutor_id = data.get('tutorId')
        tutor_ref = db.collection('tutors').document(tutor_id)
        tutor_data = tutor_ref.get().to_dict()
        access_token = tutor_data.get('google_access_token')
        if not access_token:
            return jsonify({'error': 'Google account is not connected.'}), 403
        
        headers = {
            'Authorization':f'Bearer {access_token}',
            'Content-Type':'application/json'
        }
        event = {
            'summary':'Google Meet Meeting',
            'start': {
                'dateTime': '2024-12-21T10:00:00-07:00',  # Replace with dynamic time
                'timeZone': 'America/Los_Angeles',
            },
            'end': {
                'dateTime': '2024-12-21T11:00:00-07:00',  # Replace with dynamic time
                'timeZone': 'America/Los_Angeles',
            },
            'conferenceData': {
                'createRequest': {
                    'conferenceSolutionKey': {
                        'type': 'hangoutsMeet'
                    },
                    'requestId': str(uuid.uuid4())
                }
            }
        }

        response = requests.post(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
            headers=headers,
            json=event
        )
        if response.status_code == 200:
            event_data = response.json()
            meet_link = event_data.get('hangoutLink')
            return jsonify({'message': 'Meeting created successfully', 'meetLink': meet_link})
        else:
            return jsonify({'error': 'Failed to create meeting', 'details': response.json()}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
'''
Google meets create class logic END
'''

def print_err(err, err_code=None):
    print(f'{err_code} | SERVER ERROR--- {err}')

def require_role(required_role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'message': 'Authorization header missing or malformed'}), 403

            try:
                token = auth_header.split('Bearer ')[1]
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                user_role = payload.get('role')

                if user_role != required_role:
                    return jsonify({'error': 'Unauthorized role'}), 403

                return f(*args, **kwargs)
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token has expired'}), 403
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Invalid token'}), 403
        return decorated_function
    return decorator

@app.route("/process-login", methods=['POST'])
def process_login():
    logging.info("Request received at /process-login")
    try:
        data = request.json
        if not data or 'data' not in data:
            print_err('Missing user code from client', 400)
            return jsonify({'message': 'User code not received'}), 400
        
        if len(data['data']) < 4:
            print_err('User code does not meet 4 characters', 400)
            return jsonify({'message': 'User code does not meet 4 characters'}), 400
        
        user_code = data.get('data')
        user_ref = db.collection('users').where(field_path='userCode', op_string='==', value=user_code).get()

        if not user_ref:
            return jsonify({'message': 'User code not found'}), 404
        
        user_doc = user_ref[0]
        user_data = user_doc.to_dict()
        role = user_data.get('role')

        if role not in {"admin", "tutor", "student"}:
            return jsonify({"message": "Unauthorized role"}), 403
        
        print(user_data)
        if role == 'tutor':
            tutor_ref = db.collection('tutors').document(user_doc.id)
            tutor_data = tutor_ref.get().to_dict()
            g_email = tutor_data.get('google_email')
            google_connected = bool(g_email)
        else:
            google_connected = None
        print(g_email)
        print(google_connected)

        payload = {
            "user_id": user_doc.id,
            "user_email": user_data.get('email'),
            "role": role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours = 1)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        print(token)
        return jsonify({
            "message":f"Login successful for {role}",
            "role":role,
            "token":token,
            "tutorId":user_doc.id,
            'googleConnected':google_connected
        }), 200

    except Exception as e:
        print_err(f"Error occurred: {e}")
        return jsonify({'message': f'Error occurred: {str(e)}'}), 500 
    
@app.route('/tutor-dash', methods=['GET', 'POST'])
@require_role('tutor')
def tutor_dash():    
    students = []
    data = request.json
    try:
        tutor_id = data.get('tutorId')
        if not tutor_id:
            return jsonify({'error': 'Tutor ID is missing'}), 400
        
        tutor_ref = db.collection('tutors').document(tutor_id)
        tutor_doc = tutor_ref.get()
        if not tutor_doc:
            return jsonify({'error':f'User with ID: {data['tutorId']} does not exist'})
        
        tutor_data = tutor_doc.to_dict()
        student_ids = tutor_data.get('students', [])
        if not student_ids:
            return jsonify({'message':'No students yet', 'tutorData':tutor_data})
        
        for id in student_ids:
            student_ref = db.collection('students').document(id)
            student_doc = student_ref.get()

            if student_doc.exists:
                student_data = student_doc.to_dict()
                student_data['id'] = student_doc.id
                students.append(student_data)
    except Exception as e:
        return jsonify({'error':f'SERVER - Error occured when fetching tutors: {str(e)}'}), 403
        
    return jsonify({"message": "Welcome to the tutor dashboard!", "students":students, 'tutorData':tutor_data})

@app.route('/create-tutor', methods=['POST'])
@require_role('admin')
def create_tutor():
    try:
        data = request.json
        print(data)
        fields = ['first', 'last', 'email', 'age', 'teaches']
        for field in fields:
            if field not in data or not data[field]:
                return jsonify({'error':'Missing required fields'})

        add_tutor(data['first'], data['last'], data['email'], data['age'], data['teaches'])
        
        tutors = []
        tutors_ref = db.collection('tutors')
        docs = tutors_ref.get()
        for doc in docs:
            tutor_data = doc.to_dict()
            tutor_data['id'] = doc.id
            tutors.append(tutor_data)

        return jsonify({
            'message': 'Tutor added successfully!',
            'tutors': tutors
        }), 200
    except Exception as e:
        print("Error occurred:", str(e))
        return jsonify({
            'error': f'SERVER - Error occurred when adding new tutor: {str(e)}'
        }), 403
    
@app.route('/remove-tutor', methods=['POST'])
@require_role('admin')
def remove_tutor():
    try:
        data = request.json
        uid = data.get('uid')
        collection = data.get('collection')
        remove_user(collection, uid)
        return jsonify({'message':'Tutor successfully removed!'}), 200
    except Exception as e:
        return jsonify({'error':f'SERVER - Error from remove-tutor route {str(e)}'}), 403
    
@app.route('/remove-student', methods=['POST'])
@require_role('tutor')
def remove_student():
    try:
        data = request.json
        uid = data.get('uid')
        collection = data.get('collection')
        remove_user(collection, uid)

        tutor_id = data.get('tutorId')
        tutor_ref = db.collection('tutors').document(tutor_id)

        tutor_ref.update({
            'students':firestore.ArrayRemove([uid])
        })

        return jsonify({'message':'Student successfully removed!'}), 200
    except Exception as e:
        return jsonify({'error':f'SERVER - Error from remove-tutor route {str(e)}'}), 403
    
@app.route('/admin-dash', methods=['GET'])
@require_role('admin')
def admin_dash():
    tutors = []
    try:
        tutors_ref = db.collection('tutors')
        docs = tutors_ref.get()
        for doc in docs:
            tutor_data = doc.to_dict()
            tutor_data['id'] = doc.id
            tutors.append(tutor_data)
        print(f"{GREEN}Tutors fetched successfully: {len(tutors)}{RESET}")
    except Exception as e:
        return jsonify({'error':f'SERVER - Error occured when fetching tutors: {str(e)}'}), 403

    return jsonify({
            'message': "Welcome to the Admin dashboard!",
            'tutors': tutors
        })

@app.route('/create-student', methods=['POST'])
@require_role('tutor')
def create_student():
    try:
        data = request.json
        if data:
            add_student(data['first'], data['last'], data['age'], data['tutor'])
            tutor_doc = db.collection('tutors').document(data['tutor']).get()
            tutor_data = tutor_doc.to_dict()
            student_ids = tutor_data.get('students', [])
            students = []

            for student_id in student_ids:
                student_doc = db.collection('students').document(student_id).get()
                if student_doc.exists:
                    student_data = student_doc.to_dict()
                    student_data['id'] = student_id
                    students.append(student_data)

            return jsonify({'message':'Student added successfully', 'students':students})
    except Exception as e:
        return jsonify({'error': f'SERVER - Error occurred when adding a student: {str(e)}'}), 500

@app.route('/student-dash', methods=['GET'])
@require_role('student')
def student_dash():
    return jsonify({"message": "Welcome to the student dashboard!"})

@app.route("/server-test", methods=['POST', 'GET', 'OPTIONS'])
def server_test():
    return jsonify({'message': 'Server OK'})

if __name__ == '__main__':
    app.run(debug=True)