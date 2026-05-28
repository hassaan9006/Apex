from flask import Blueprint, render_template, request, redirect, url_for

booking_bp = Blueprint('booking_bp', __name__)

@booking_bp.route('/booking', methods=['GET', 'POST'])
def booking():
    if request.method == 'POST':
        # Get data from the consolidated booking form
        plan = request.form.get('plan')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        payment_method = request.form.get('payment_method')
        
        # Here you would typically save the booking to a database
        
        # Redirect to the main thankyou page
        return redirect(url_for('thankyou'))
        
    return render_template('booking.html')
