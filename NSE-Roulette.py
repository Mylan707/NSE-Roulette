from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
import random
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///roulette.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==================== DATABASE MODELS ====================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    currency = db.Column(db.Float, default=100.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    games = db.relationship('GameRound', backref='player', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def __repr__(self):
        return f'<User {self.username}>'


class GameRound(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    bet_amount = db.Column(db.Float, nullable=False)
    bet_type = db.Column(db.String(50), nullable=False)  # 'number', 'color', 'odd/even', etc.
    bet_value = db.Column(db.String(50), nullable=False)  # '17', 'red', 'odd', etc.
    winning_number = db.Column(db.Integer, nullable=False)
    result = db.Column(db.String(10), nullable=False)  # 'win' or 'lose'
    payout = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<GameRound {self.id} - {self.result}>'


# ==================== HELPER FUNCTIONS ====================

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


def get_roulette_colors():
    """Retourneert een dictionary met welke nummers rood/zwart zijn"""
    red_numbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
    return red_numbers


def calculate_payout(bet_type, bet_value, winning_number, bet_amount):
    """Berekent winst/verlies op basis van inzet en winnend getal"""
    red_numbers = get_roulette_colors()
    is_red = winning_number in red_numbers
    is_black = winning_number != 0 and not is_red
    
    payout = 0
    win = False
    
    if bet_type == 'number':
        if int(bet_value) == winning_number:
            payout = bet_amount * 36  # 36:1 voor enkel getal
            win = True
    
    elif bet_type == 'color':
        if bet_value == 'red' and is_red:
            payout = bet_amount * 2
            win = True
        elif bet_value == 'black' and is_black:
            payout = bet_amount * 2
            win = True
    
    elif bet_type == 'odd':
        if winning_number % 2 == 1:
            payout = bet_amount * 2
            win = True
    
    elif bet_type == 'even':
        if winning_number % 2 == 0 and winning_number != 0:
            payout = bet_amount * 2
            win = True
    
    elif bet_type == 'high':
        if 19 <= winning_number <= 36:
            payout = bet_amount * 2
            win = True
    
    elif bet_type == 'low':
        if 1 <= winning_number <= 18:
            payout = bet_amount * 2
            win = True
    
    return payout, win


# ==================== ROUTES ====================

@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('dashboard'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email', '').lower()
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        password_confirm = request.form.get('password_confirm', '')
        
        # Validatie
        if not email or not username or not password:
            return render_template('register.html', error='Alle velden zijn verplicht')
        
        if password != password_confirm:
            return render_template('register.html', error='Wachtwoorden komen niet overeen')
        
        if len(password) < 6:
            return render_template('register.html', error='Wachtwoord moet minstens 6 tekens zijn')
        
        if User.query.filter_by(email=email).first():
            return render_template('register.html', error='Email is al geregistreerd')
        
        if User.query.filter_by(username=username).first():
            return render_template('register.html', error='Gebruikersnaam is al in gebruik')
        
        # Nieuw account aanmaken
        new_user = User(email=email, username=username, currency=100.0)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        session['user_id'] = new_user.id
        session['username'] = new_user.username
        
        return redirect(url_for('dashboard'))
    
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').lower()
        password = request.form.get('password', '')
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', error='Email of wachtwoord is onjuist')
    
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/dashboard')
@login_required
def dashboard():
    user = User.query.get(session['user_id'])
    recent_games = GameRound.query.filter_by(user_id=session['user_id']).order_by(GameRound.created_at.desc()).limit(5).all()
    stats = {
        'total_games': GameRound.query.filter_by(user_id=session['user_id']).count(),
        'wins': GameRound.query.filter_by(user_id=session['user_id'], result='win').count(),
        'losses': GameRound.query.filter_by(user_id=session['user_id'], result='lose').count(),
    }
    
    if stats['total_games'] > 0:
        stats['win_rate'] = round((stats['wins'] / stats['total_games']) * 100, 2)
    else:
        stats['win_rate'] = 0
    
    return render_template('dashboard.html', user=user, recent_games=recent_games, stats=stats)


@app.route('/game')
@login_required
def game():
    user = User.query.get(session['user_id'])
    online_players = User.query.all()
    return render_template('game.html', user=user, online_players=online_players)


@app.route('/api/spin', methods=['POST'])
@login_required
def api_spin():
    try:
        data = request.json
        bet_amount = float(data.get('bet_amount', 0))
        bet_type = data.get('bet_type', 'number')
        bet_value = data.get('bet_value', '0')
        
        user = User.query.get(session['user_id'])
        
        # Validatie
        if bet_amount <= 0 or bet_amount > 1000:
            return jsonify({'error': 'Ongeldig inzetbedrag'}), 400
        
        if user.currency < bet_amount:
            return jsonify({'error': 'Onvoldoende tegoed'}), 400
        
        # Spin het wiel
        winning_number = random.randint(0, 36)
        payout, win = calculate_payout(bet_type, bet_value, winning_number, bet_amount)
        
        # Update gebruiker currency
        user.currency -= bet_amount
        if win:
            user.currency += payout
            result = 'win'
        else:
            result = 'lose'
        
        # Sla het spel op in database
        game_round = GameRound(
            user_id=user.id,
            bet_amount=bet_amount,
            bet_type=bet_type,
            bet_value=bet_value,
            winning_number=winning_number,
            result=result,
            payout=payout
        )
        
        db.session.add(game_round)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'winning_number': winning_number,
            'result': result,
            'payout': payout,
            'new_balance': round(user.currency, 2),
            'message': f"Gewonnen: €{payout:.2f}" if win else "Helaas verloren!"
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/balance')
@login_required
def api_balance():
    user = User.query.get(session['user_id'])
    return jsonify({
        'balance': round(user.currency, 2),
        'username': user.username
    })


@app.route('/account')
@login_required
def account():
    user = User.query.get(session['user_id'])
    return render_template('account.html', user=user)


@app.route('/api/update-account', methods=['POST'])
@login_required
def update_account():
    try:
        data = request.json
        user = User.query.get(session['user_id'])
        
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not user.check_password(current_password):
            return jsonify({'error': 'Huidige wachtwoord is onjuist'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Nieuw wachtwoord moet minstens 6 tekens zijn'}), 400
        
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Wachtwoord gewijzigd'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/history')
@login_required
def history():
    games = GameRound.query.filter_by(user_id=session['user_id']).order_by(GameRound.created_at.desc()).all()
    return render_template('history.html', games=games)


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_error(e):
    db.session.rollback()
    return render_template('500.html'), 500


# ==================== MAIN ====================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, host='localhost', port=5000)
