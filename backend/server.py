from config import app
from flask import jsonify, request

import logging
logging.basicConfig(level=logging.INFO)

def print_err(err, err_code=None):
    print(f'{err_code} | SERVER ERROR--- {err}')

@app.route("/server-test", methods=['POST', 'GET', 'OPTIONS'])
def server_test():
    return jsonify({
        'message':'Server OK'
    })

# TODO: add login process route
@app.route("/process-login", methods=['POST'])
def process_login():
    logging.info("Request received at /process-login")
    try:
        data = request.json
        print(data)
        if not data or 'data' not in data:
            print_err('Missing user code from client', 400)
            return jsonify({
                'message':'User code not received'
            }), 400
        
        if len(data['data']) < 4:
            print_err('User code does not meet 4 characters')
            return jsonify({
                'message':'User code does not meet 4 characters'
            }), 400
        
        print(data['data'])

        return jsonify({
            'message': 'Login processed successfully',
            'userCode': data['data']
        }), 200
    except Exception as e:
        return jsonify({
            'message':f'Error occured {str(e)}'
        })

if __name__ == '__main__':
    app.run(debug=True)