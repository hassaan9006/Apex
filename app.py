from flask import Flask, render_template, redirect, url_for
from bmi import bmi_bp
from booking import booking_bp
from programs import programs_bp

app = Flask(__name__)
app.secret_key = 'apex_secret_key_123'

# Register blueprints to make the app modular
app.register_blueprint(bmi_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(programs_bp)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    # Redirect to index since about module is removed
    return redirect(url_for('index'))

@app.route('/comparison')
def comparison():
    return render_template('comparison.html')

@app.route('/thankyou')
def thankyou():
    return render_template('thankyou.html')

if __name__ == '__main__':
    app.run(debug=True, port=8000)
