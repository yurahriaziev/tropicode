import firebase_admin
from firebase_admin import credentials, firestore, auth

import random
import string

YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"
RED = "\033[31m"
GREEN = "\033[92m"

cred = credentials.Certificate('../backend/firebase-key.json')
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

def add_new_class(tutor_id, new_class):
    try:
        tutor_ref = db.collection('tutors').document(tutor_id)
        tutor_ref.update({
            'upcoming_classes':firestore.ArrayUnion([new_class])
        })
    except Exception as e:
        print(f'{RED}SERVER - Error adding new class {str(e)}{RESET}')