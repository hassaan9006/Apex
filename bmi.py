from flask import Blueprint, render_template, request

bmi_bp = Blueprint('bmi_bp', __name__)

@bmi_bp.route('/bmi', methods=['GET', 'POST'])
def bmi():
    bmi_val = None
    status = None
    color = None
    
    if request.method == 'POST':
        try:
            weight = float(request.form.get('weight', 0))
            height_cm = float(request.form.get('height', 0))
            
            if weight > 0 and height_cm > 0:
                height_m = height_cm / 100
                bmi_calc = round(weight / (height_m * height_m), 1)
                bmi_val = str(bmi_calc)
                
                if bmi_calc < 18.5:
                    status = 'Underweight'
                    color = '#3498db'
                elif 18.5 <= bmi_calc <= 24.9:
                    status = 'Normal weight'
                    color = '#2ecc71'
                elif 25 <= bmi_calc <= 29.9:
                    status = 'Overweight'
                    color = '#f39c12'
                else:
                    status = 'Obese'
                    color = '#e74c3c'
            else:
                status = 'Invalid input'
                color = '#e74c3c'
        except ValueError:
            status = 'Invalid input'
            color = '#e74c3c'
            
    return render_template('bmi.html', bmi=bmi_val, status=status, color=color)
