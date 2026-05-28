from flask import Blueprint, render_template

programs_bp = Blueprint('programs_bp', __name__)

@programs_bp.route('/programs')
def programs():
    cardio_machines = [
        {"name": "Treadmill", "desc": "Perfect for warm-ups and endurance.", "icon": "🏃"},
        {"name": "Elliptical", "desc": "Low impact cardiovascular workout.", "icon": "⛷️"},
        {"name": "Rowing Machine", "desc": "Full body cardio and strength.", "icon": "🚣"}
    ]
    strength_machines = [
        {"name": "Bench Press", "desc": "Build upper body strength.", "icon": "🏋️"},
        {"name": "Squat Rack", "desc": "Essential for leg development.", "icon": "🦵"},
        {"name": "Dumbbells", "desc": "Versatile free weight training.", "icon": "💪"}
    ]
    yoga_machines = [
        {"name": "Yoga Mats", "desc": "Comfortable mats for floor exercises.", "icon": "🧘"},
        {"name": "Resistance Bands", "desc": "Improve flexibility and tone.", "icon": "➰"},
        {"name": "Stability Balls", "desc": "Core strengthening and balance.", "icon": "🟣"}
    ]
    quotes = [
        "The only bad workout is the one that didn't happen. - Unknown",
        "What seems impossible today will one day become your warm-up. - Unknown",
        "It never gets easier, you just get stronger. - Unknown"
    ]
    return render_template('programs.html', cardio=cardio_machines, strength=strength_machines, yoga=yoga_machines, quotes=quotes)
