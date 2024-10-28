from config import app, jsonify

@app.route("/server-test", methods=['GET'])
def server_test():
    return jsonify({
        'message':'Server OK'
    })

if __name__ == '__main__':
    app.run(debug=True)