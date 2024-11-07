import firebase_admin
from firebase_admin import credentials, firestore, auth

import random
import string

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
    print(f'Tutor {first, last} added to "tutors" collection with ID: {tutor_ref.id}')

    user_ref = db.collection('users').document(tutor_ref.id)
    user_ref.set({
        'role':'tutor',
        'profileId':tutor_ref.id,
        'userCode':generate_user_code()
    })
    print(f'User {first, last} added to "users" collection with ID: {user_ref.id}')

def add_student(first, last, age):
    student_ref = db.collection("tutors").document()
    student_ref.set({
        'first':first,
        'last':last,
        'age':age,
    })
    print(f'Student {first, last} added to "students" collection with ID: {student_ref.id}')

    user_ref = db.collection('users').document(student_ref.id)
    user_ref.set({
        'role':'tutor',
        'profileId':student_ref.id,
        'userCode':generate_user_code()
    })
    print(f'User {first, last} added to "users" collection with ID: {user_ref.id}')