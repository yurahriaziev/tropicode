import firebase_admin
from firebase_admin import credentials, firestore, auth

import random
import string
import os
from dotenv import load_dotenv

YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"
RED = "\033[31m"
GREEN = "\033[92m"

load_dotenv()
FIREBASE_PATH = os.getenv('FIREBASE_KEY_PATH')

cred = credentials.Certificate(FIREBASE_PATH)
firebase_admin.initialize_app(cred)

db = firestore.client()

def generate_user_code():
    chars = string.ascii_uppercase + string.digits
    code = ''.join(random.choice(chars) for _ in range(4))
    return code

def add_tutor(first, last, email, age, teaches, students=[]):
    tutor_ref = db.collection("tutors").document()
    tutor_ref.set({
        'first':first,
        'last':last,
        'email':email,
        'age':age,
        'teaches':teaches,
        'students':students,
    })
    print(f'{YELLOW}Tutor {first, last} added to "tutors" collection with ID: {tutor_ref.id}{RESET}')

    user_ref = db.collection('users').document(tutor_ref.id)
    code = generate_user_code()
    user_ref.set({
        'role':'tutor',
        'profileId':tutor_ref.id,
        'userCode':code
    })
    print(f'{BLUE}User {first, last} added to "users" collection with ID: {user_ref.id}{RESET}')
    return code

def add_student(first, last, age, tutor_id):
    student_ref = db.collection("students").document()
    student_ref.set({
        'first':first,
        'last':last,
        'age':age,
    })
    print(f'Student {first, last} added to "students" collection with ID: {student_ref.id}')

    user_ref = db.collection('users').document(student_ref.id)
    user_ref.set({
        'role':'student',
        'profileId':student_ref.id,
        'userCode':generate_user_code()
    })
    print(f'User {first, last} added to "users" collection with ID: {user_ref.id}')

    tutor_ref = db.collection('tutors').document(tutor_id)
    tutor_ref.update({
        'students':firestore.ArrayUnion([student_ref.id])
    })

def remove_user(collection, uid):
    try:
        role_ref = db.collection(collection).document(uid)
        if role_ref.get().exists:
            role_ref.delete()
            # print(f'{GREEN}Tutor deleted from "tutors" collection')
        else:
            print(f'{RED} User with id {uid} in {collection} not found{RESET}')

        user_ref = db.collection('users').document(uid)
        if user_ref.get().exists:
            user_ref.delete()
            print(f'{GREEN}User deleted from "users" collection')
        else:
            print(f'{RED}User with id {uid} not found{RESET}')
    except Exception as e:
        print(f'{RED}SERVER - Error removing user {str(e)}{RESET}')

def add_new_class(tutor_id, class_id):
    try:
        tutor_ref = db.collection('tutors').document(tutor_id)
        tutor_ref.update({
            'upcoming_classes':firestore.ArrayUnion([class_id])
        })
    except Exception as e:
        print(f'{RED}SERVER - Error adding new class {str(e)}{RESET}')

def remove_class_db(tutor_id, student_id, class_id):
    try:
        tutor_ref = db.collection('tutors').document(tutor_id)
        student_ref = db.collection('students').document(student_id)
        classes_ref = db.collection('classes').document(class_id)

        tutor_doc = tutor_ref.get()
        student_doc = student_ref.get()
        if not tutor_doc.exists or not student_doc.exists:
            return "Tutor or Student not found"
        
        tutor_data = tutor_doc.to_dict()
        tutor_classes = tutor_data.get('upcoming_classes', [])
        t_updated_classes = [id for id in tutor_classes if id != class_id]
        tutor_ref.update({'upcoming_classes':t_updated_classes})

        stud_data = student_doc.to_dict()
        stud_classes = stud_data.get('upcoming_classes', [])

        s_updated_classes = [id for id in stud_classes if id != class_id]
        student_ref.update({'upcoming_classes':s_updated_classes})

        if not classes_ref.get().exists:
            return 'Class does not exist in classes collection'
        
        classes_ref.delete()

        return 'Class succeessfully removed'
    except Exception as e:
        return f'Error in remove_class_db - {str(e)}'

# def remove_class_db(tutor_id, student_id, class_id):
#     try:
#         tutor_ref = db.collection('tutors').document(tutor_id)
#         student_ref = db.collection('students').document(student_id)
#         classes_ref = db.collection('classes').document(class_id)
#         if not classes_ref.get().exists:
#             return 'Class does not exist in classes'
        
#         classes_ref.delete()

#         tutor_doc = tutor_ref.get()
#         student_doc = student_ref.get()
#         if not tutor_doc.exists or not student_doc.exists:
#             return "Tutor or Student not found"
        
#         tutor_data = tutor_doc.to_dict()
#         tutor_classes = tutor_data.get('upcoming_classes', [])

#         t_updated_classes = [cls for cls in tutor_classes if cls.get('id') != class_id]
#         tutor_ref.update({'upcoming_classes':t_updated_classes})

#         stud_data = student_doc.to_dict()
#         stud_classes = stud_data.get('upcoming_classes', [])

#         s_updated_classes = [cls for cls in stud_classes if cls.get('id') != class_id]
#         student_ref.update({'upcoming_classes':s_updated_classes})

#         return {'message':'Class removed successfullly', 'classes':}

    except Exception as e:
        return f'{RED}SERVER - Error adding new class {str(e)}{RESET}'
