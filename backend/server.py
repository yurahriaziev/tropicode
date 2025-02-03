from config import app, production_url, s3, S3_BUCKET, S3_REGION
from flask import jsonify, request, session, redirect, url_for
from firebase_setup import firestore, db, auth, add_tutor, remove_user, add_student, add_new_class, remove_class_db, add_new_homework, remove_homework_db
from functools import wraps
import requests

import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone as dt_timezone
import json
import uuid
from urllib.parse import urlencode
import string
import secrets
from pytz import timezone as pytz_timezone
from dateutil.parser import parse

import redis

from authlib.integrations.flask_client import OAuth

from apscheduler.schedulers.background import BackgroundScheduler

import logging
logging.basicConfig(level=logging.INFO)

''' Helper funcs '''
def parse_iso_time(iso_time):
    return datetime.fromisoformat(iso_time.replace("Z", "+00:00")).astimezone(dt_timezone.utc)


def generate_class_id(length):
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

def format_time_to_est(iso_time):
    mil_time = parse(iso_time)
    return mil_time.strftime('%I:%M %p')

def extract_est_date_only(iso_time):
    utc_time = parse(iso_time)
    est = pytz_timezone('America/New_York')
    est_time = utc_time.astimezone(est)
    return est_time.strftime('%Y-%m-%d')

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

def update_class_status():
    try:
        classes_ref = db.collection('classes').where('status', '!=', 'finished')
        classes = classes_ref.get()
        current_time = datetime.now(dt_timezone.utc)

        for class_doc in classes:
            class_data = class_doc.to_dict()
            start_time = class_data.get('start')
            end_time = class_data.get('end')

            if not end_time or not start_time:
                continue

            start = datetime.fromisoformat(start_time)
            end = datetime.fromisoformat(end_time)

            if current_time < start and class_data.get('status') != 'UPCOMING':
                class_doc.reference.update({'status': 'UPCOMING'})
                print(f"Class {class_doc.id} status updated to UPCOMING")
            elif start <= current_time <= end and class_data.get('status') != 'LIVE':
                class_doc.reference.update({'status': 'LIVE'})
                print(f"Class {class_doc.id} status updated to LIVE")
            elif current_time > end and class_data.get('status') != 'FINISHED':
                class_doc.reference.update({'status': 'FINISHED'})
                print(f"Class {class_doc.id} status updated to FINISHED")
    except Exception as e:
        print(f"Error updating class status: {e}")

def get_class_status(start_time, end_time):
    current_utc_time = datetime.now(dt_timezone.utc)
    start_utc_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
    end_utc_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))

    if start_utc_time <= current_utc_time <= end_utc_time:
        return 'LIVE'
    elif current_utc_time < start_utc_time:
        return 'UPCOMING'
    else:
        return 'FINISHED'

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
CLIENTS_SECRETS = os.getenv('CLIENTS_SECRETS_PATH')
GREEN = "\033[92m"
RED = "\033[31m"
RESET = "\033[0m"

'''
Google meets create class logic START
'''
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
        'scope': 'openid email profile https://www.googleapis.com/auth/calendar.events',
        'access_token': 'offline',
        'prompt': 'consent'
    },
    server_metadata_url= 'https://accounts.google.com/.well-known/openid-configuration'
)

def refresh_access_token(refresh_token):
    url = 'https://oauth2.googleapis.com/token'
    payload = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token',
    }

    response = requests.post(url, data=payload)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception("Failed to refresh access token: " + response.text)
    
def is_token_expired(token_expiry):
    if not token_expiry:
        return True
    now = datetime.utcnow().replace(tzinfo=dt_timezone.utc)
    return token_expiry < now

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
@app.route('/google/login', methods=['GET'])
def google_login():
    tutor_id = request.args.get('tutorId')
    if not tutor_id:
        return jsonify({'error': 'Tutor ID is required'}), 400
    
    tutor_ref = db.collection('tutors').document(tutor_id)
    tutor_doc = tutor_ref.get()
    if not tutor_doc.exists:
        return jsonify({'error': f'Tutor with ID {tutor_id} not found'}), 404
    
    state = json.dumps({'tutorId':tutor_id}) # FOR LOCAL

    # FOR PROD
    # state = str(uuid.uuid4())   
    # redis_client.setex(state, 300, tutor_id)

    redirect_uri = url_for('google_callback', _external=True)
    return google.authorize_redirect(redirect_uri, state=state)
    
@app.route('/oauth2callback')
def google_callback():
    try:
        print("OAuth2 Callback: Received request")
        logging.debug("OAuth2 Callback: Received request")

        state = request.args.get('state')
        if not state:
            print("State parameter is missing!")
            logging.error("Error: Missing state parameter")
            return jsonify({'error': 'State parameter is missing'}), 400
    
        # tutor_id = redis_client.get(state)
        state_data = json.loads(state)
        tutor_id = state_data.get('tutorId')
        if not tutor_id:
            print(f"Error: State {state} not found in Redis (expired or incorrect)")
            logging.error(f"Error: State {state} not found in Redis (expired or incorrect)")
            return jsonify({'error': 'Invalid or expired state parameter'}), 400

        # redis_client.delete(state)

        token = google.authorize_access_token()
        logging.debug(f"Token received: {token}")
    
        user_info = google.get('userinfo').json()
        logging.debug(f"User info received: {user_info}")

        email = user_info.get('email')
        google_id = user_info.get('id')

        tutor_ref = db.collection('tutors').document(tutor_id)
        update_data = {
            'google_email': email,
            'google_id': google_id,
            'google_access_token': token['access_token'],
        }

        if 'refresh_token' in token:
            update_data['google_refresh_token'] = token['refresh_token']
        else:
            print_red("Warning: No refresh_token received. Reauthorization may be needed.")

        if 'expires_in' in token:
            update_data['token_expiry'] = datetime.utcnow() + timedelta(seconds=token['expires_in'])

        tutor_ref.update(update_data)
        logging.debug(f"Successfully updated tutor {tutor_id} in Firestore")

        tutor_dash_url = f"{production_url}/#/tutor-dash/{tutor_id}/true"
        logging.info(f"Redirecting to {tutor_dash_url}")
        return redirect(tutor_dash_url)
    except Exception as e:
        logging.error(f"ERROR in OAuth2 Callback: {str(e)}", exc_info=True)
        return jsonify({'error': f'Internal Server Error: {str(e)}'}), 500
    
@app.route('/check-token', methods=['POST', 'GET'])
@require_role('tutor')
def check_token_expiry():
    try:
        tutor_id = request.json.get('tutorId')
        tutor_ref = db.collection('tutors').document(tutor_id)
        tutor_data = tutor_ref.get().to_dict()
        if not tutor_data:
            return jsonify({'error': 'Tutor not found'}), 404
        
        token_expiry = tutor_data.get('token_expiry')
        if is_token_expired(token_expiry):
            print_red('Token expired before creating new class')
            return jsonify({'message': 'Refresh required'}), 401
        else:
            return jsonify({'message': 'Token is valid'}), 200
    except Exception as e:
        print_red(f'Error in /check-token: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
        
@app.route('/create-meeting', methods=['POST'])
def create_meeting():
    try:
        data = request.json
        tutor_id = data.get('tutorId')
        tutor_ref = db.collection('tutors').document(tutor_id)
        tutor_data = tutor_ref.get().to_dict()
        access_token = tutor_data.get('google_access_token')
        
        tutor_ref = db.collection('tutors').document(tutor_id)
        tutor_data = tutor_ref.get().to_dict()
        refresh_token = tutor_data.get('google_refresh_token')
        token_expiry = tutor_data.get('token_expiry')
        if is_token_expired(token_expiry):
            print_red('Token expired')
            if refresh_token:
                print_red('Need to refresh token')
                refreshed_token_data = refresh_access_token(refresh_token)
                access_token = refreshed_token_data['access_token']
                new_expiry = datetime.utcnow() + timedelta(seconds=refreshed_token_data['expires_in'])
                tutor_ref.update({
                    'google_access_token': access_token,
                    'token_expiry': new_expiry
                })
            else:
                return jsonify({'error': 'Google account is not connected.'}), 403

        headers = {
            'Authorization':f'Bearer {access_token}',
            'Content-Type':'application/json'
        }

        summary = data.get('summary')
        
        startTime = data.get('startTime')
        endTime = data.get('endTime')

        student_id = data.get('assignedStudentId')

        print(student_id)
        event = {
            'summary':summary,
            'start': {
                'dateTime': startTime,
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': endTime,
                'timeZone': 'UTC',
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
        print_red('got here')
        if response.status_code == 200:
            event_data = response.json()
            meet_link = event_data.get('hangoutLink')
            class_id = generate_class_id(20)

            student_ref = db.collection('students').document(student_id)
            student_ref.update({
                'upcoming_classes':firestore.ArrayUnion([class_id])
            })
            
            add_new_class(tutor_id, class_id)

            new_class_status = get_class_status(startTime,  endTime)
            print_red(new_class_status)

            new_class = {'link':meet_link, 'student_id':student_id, 'tutor_id':tutor_id, 'class_id':class_id, 'start':startTime, 'end':endTime, 'title':summary, 'status':new_class_status}

            classes_ref = db.collection('classes')
            classes_ref.document(class_id).set(new_class)

            return jsonify({'message': 'Meeting created successfully', 'class':new_class})
        else:
            return jsonify({'error': 'Failed to create meeting', 'details': response.json()}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
'''
Google meets create class logic END
'''

def print_err(err, err_code=None):
    print(f'{err_code} | SERVER ERROR--- {err}')

def print_red(msg):
    print(f'{RED}{msg}{RESET}')

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

        payload = {
            "user_id": user_doc.id,
            "user_email": user_data.get('email'),
            "role": role,
            "exp": datetime.now(dt_timezone.utc) + timedelta(hours = 3)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        print(token)
        return jsonify({
            "message":f"Login successful for {role}",
            "role":role,
            "token":token,
            "userId":user_doc.id,
            'googleConnected':google_connected
        }), 200

    except Exception as e:
        print_err(f"Error occurred: {e}")
        return jsonify({'message': f'Error occurred: {str(e)}'}), 500 
    
@app.route('/tutor-dash', methods=['GET', 'POST'])
@require_role('tutor')
def tutor_dash():    
    students = []
    classes = []
    homeworks = []
    data = request.json
    print(data)
    try:
        tutor_id = data.get('tutorId')
        if not tutor_id:
            return jsonify({'error': 'Tutor ID is missing'}), 400
        
        tutor_ref = db.collection('tutors').document(tutor_id)
        tutor_doc = tutor_ref.get()
        if not tutor_doc:
            return jsonify({'error':f"User with ID: {data['tutorId']} does not exist"})
        
        tutor_data = tutor_doc.to_dict()
        student_ids = tutor_data.get('students', [])
        
        for id in student_ids:
            student_ref = db.collection('students').document(id)
            student_doc = student_ref.get()

            if student_doc.exists:
                student_data = student_doc.to_dict()
                student_data['id'] = student_doc.id
                students.append(student_data)

        tutor_classes = tutor_data.get('upcoming_classes', [])
        for c_id in tutor_classes:
            class_ref = db.collection('classes').document(c_id)
            class_data = class_ref.get().to_dict()
            class_data['status'] = get_class_status(class_data.get('start'), class_data.get('end'))
            
            print(class_data)

            classes.append(class_data)

        homework_ids= tutor_data.get('assigned_homework', [])
        for h_id in homework_ids:
            h_ref = db.collection('homework').document(h_id)
            h_data = h_ref.get().to_dict()
            homeworks.append(h_data)

    except Exception as e:
        return jsonify({'message':f'SERVER - /tutor-dash - Error occured when fetching tutor data: {str(e)}'}), 403
        
    return jsonify({"message": "Welcome to the tutor dashboard!", "students":students, 'tutorData':tutor_data, 'upcomingClasses':classes, 'assignedHomework':homeworks})

@app.route('/remove-class', methods=['POST'])
@require_role('tutor')
def remove_class():
    try:
        data = request.json
        message = remove_class_db(data.get('tutorId'), data.get('studentId'), data.get('classId'))
        return jsonify({'message':message}), 200
    except Exception as e:
        return jsonify({'error':f'SERVER - Error occured when fetching tutors: {str(e)}'}), 403

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

        tutor_code = add_tutor(data['first'], data['last'], data['email'], data['age'], data['teaches'])
        
        tutors = []
        tutors_ref = db.collection('tutors')
        docs = tutors_ref.get()
        for doc in docs:
            tutor_data = doc.to_dict()
            tutor_data['id'] = doc.id
            tutor_data['join_code'] = tutor_code
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
            tutor = db.collection('users').document(doc.id)
            join_code = tutor.get().to_dict().get('userCode')
            tutor_data['id'] = doc.id
            tutor_data['join_code'] = join_code
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

@app.route('/student-dash', methods=['GET', 'POST'])
@require_role('student')
def student_dash():
    classes = []
    homeworks = []
    try:
        data = request.json
        if not data['studentId']:
            return jsonify({'error':'Missing student ID'}), 400
        
        student_ref = db.collection('students').document(data.get('studentId'))
        stud_data = student_ref.get().to_dict()
        # getting student classes and their data
        for id in stud_data.get('upcoming_classes', []):
            class_ref = db.collection('classes').document(id)
            class_data = class_ref.get().to_dict()
            class_data['status'] = get_class_status(class_data.get('start'), class_data.get('end'))
            classes.append(class_data)

        for id in stud_data.get('homework', []):
            homework_data = db.collection('homework').document(id).get().to_dict()
            # add how much time is left to complete or some form of reminder
            homeworks.append(homework_data)

    except Exception as e:
        return jsonify({'message':f'SERVER - Error occured when fetching student dashboard: {str(e)}'}), 403
    
    return jsonify({"message": "Welcome to the student dashboard!", 'studentData':stud_data, 'classes':classes, 'homeworks':homeworks})

@app.route('/add-homework', methods=['POST'])
@require_role('tutor')
def add_homework():
    try:
        data = request.json
        if data and data.get('homework'):
            homework = data.get('homework')
            homework['tutorId'] = data.get('tutorId')
            print()
            print(data.get('homework'))
            print()
            message = add_new_homework(homework)
            return jsonify({'message':message, 'newHomework':data.get('homework')}), 200
        else:
            return jsonify({'error':'Missing data or incorrect data'}), 400
    except Exception as e:
        return jsonify({'error':f'SERVER - Error occurerd when adding new homework: {str(e)}'}), 500
    
@app.route('/remove-homework', methods=['POST'])
@require_role('tutor')
def remove_homework():
    try:
        data = request.json
        message = remove_homework_db(data.get('hid'))
        return jsonify({'message':message}), 200
    except Exception as e:
        return jsonify({'error':f'SERVER - Error occurerd when removing homework: {str(e)}'}), 500

@app.route('/upload-screenshot', methods=['POST'])
@require_role('student')
def upload_screenshot():
    try:
        if 'file' not in request.files:
            return jsonify({'error':'Missing file'}), 400
        
        file = request.files['file']
        if file.filename == "":
            return jsonify({'error':'Missing file name'}), 400
        
        try:
            s3.upload_fileobj(file, S3_BUCKET, f'homework/{file.filename}', ExtraArgs={'ContentType': file.content_type})
            file_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/homework/{file.filename}"
            
            homework_ref = db.collection('homework').document(request.form.get('id'))
            homework_ref.update({
                'submission_url':file_url
            })

            homework_ref.update({
                'status':'SUBMITTED'
            })

            return jsonify({'message':'Homework successfully uploaded!', 'downloadUrl':file_url})
        except Exception as e:
            return jsonify({'error':f'SERVER - Error while uploading file to S3 Bucket {str(e)}'}), 403
        
    except Exception as e:
        return jsonify({'error':f'SERVER - Error occured when uploading a screenshot: {str(e)}'}), 403
    

@app.route("/server-test", methods=['POST', 'GET', 'OPTIONS'])
def server_test():
    return jsonify({'message': 'Server OK'})

scheduler = BackgroundScheduler()
scheduler.add_job(update_class_status, 'interval', minutes=1)
scheduler.start()

if __name__ == '__main__':
    try:
        # app.run(host='0.0.0.0', port=5000, debug=True)
        app.run(host='0.0.0.0', port=5001, debug=True) # for local
    finally:
        scheduler.shutdown()
