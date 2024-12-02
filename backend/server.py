from config import app
from flask import jsonify, request
from firebase_setup import db, auth, add_tutor, remove_tutor_db, add_student
from functools import wraps

import jwt
import datetime

import logging
logging.basicConfig(level=logging.INFO)

SECRET_KEY = "543959eebc61e0d8b79a7bd76028e4afe24d2cbc783a195583f789a70d4f7902"
GREEN = "\033[92m"
RESET = "\033[0m"

def print_err(err, err_code=None):
    print(f'{err_code} | SERVER ERROR--- {err}')

def require_role(required_role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                print("Authorization header missing")
                return jsonify({'message': 'Authorization header missing'}), 403
            try:
                if 'Bearer ' not in auth_header:
                    print("Malformed Authorization header:", auth_header)
                    return jsonify({'message': 'Malformed Authorization header'}), 403

                token = auth_header.split('Bearer ')[1]
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                user_role = payload.get('role')
                print("Decoded role from token:", user_role)

                if user_role == required_role:
                    return f(*args, **kwargs)
                else:
                    print("User does not have required role:", user_role)
                    return jsonify({"error": "Unauthorized access"}), 403
            except jwt.ExpiredSignatureError:
                print("Token has expired")
                return jsonify({"message": "Token has expired"}), 403
            except jwt.InvalidTokenError as err:
                print("Invalid token:", str(err))
                return jsonify({"message": "Invalid token"}), 403

        return decorated_function
    return decorator


@app.route("/server-test", methods=['POST', 'GET', 'OPTIONS'])
def server_test():
    return jsonify({'message': 'Server OK'})

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

        if role not in ["admin", "tutor", "student"]:
            return jsonify({"message": "Unauthorized role"}), 403

        payload = {
            "user_id": user_doc.id,
            "role": role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours = 1)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        print(token)
        return jsonify({
            "message": f"Login successful for {role}",
            "role": role,
            "token": token,
            "tutorId":user_doc.id
        }), 200

    except Exception as e:
        print_err(f"Error occurred: {e}")
        return jsonify({'message': f'Error occurred: {str(e)}'}), 500 

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
        remove_tutor_db(uid)
        return jsonify({'message':'Tutor successfully removed!'}), 200
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

@app.route('/tutor-dash', methods=['GET', 'POST'])
@require_role('tutor')
def tutor_dash():
    students = []
    data = request.json
    try:
        tutor_ref = db.collection('tutors').document(data['tutorId'])
        tutor_doc = tutor_ref.get()
        if not tutor_doc:
            return jsonify({'error':f'User with ID: {data['tutorId']} does not exist'})
        
        tutor_data = tutor_doc.to_dict()
        student_ids = tutor_data.get('students', [])
        if not student_ids:
            return jsonify({'message':'No students yet'})
        
        for id in student_ids:
            student_ref = db.collection('students').document(id)
            student_doc = student_ref.get()

            if student_doc.exists:
                students.append(student_doc.to_dict())
    except Exception as e:
        return jsonify({'error':f'SERVER - Error occured when fetching tutors: {str(e)}'}), 403
        
    return jsonify({"message": "Welcome to the tutor dashboard!", "students":students})

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

if __name__ == '__main__':
    app.run(debug=True)