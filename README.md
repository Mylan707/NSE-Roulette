# 🎰 Multiplayer Roulette Casino

Een interactieve online roulette site gebouwd met Flask. Registreer met je email, log in, en speel roulette met een echter casino-ervaring. Volg je tegoed, bekijk je geschiedenis en competeer met andere spelers!

## ✨ Functies

- **Gebruikersaccounts**: Registreer met email en wachtwoord
- **Persoonlijk Tegoed**: Start met €100 en beheer je saldo
- **Interactieve Roulette**: Realistische roulettewiel animatie met spin effect
- **Weddenschap Systeem**: 
  - Inzetten op specifieke nummers (36:1 uitbetaling)
  - Kleurwedden - Rood/Zwart (2:1 uitbetaling)
  - Even/Oneven nummers (2:1 uitbetaling)
  - Hoog (19-36) / Laag (1-18) (2:1 uitbetaling)
- **Dashboard**: Bekijk je statistieken en recente spellen
- **Speel Historie**: Volledige geschiedenis van alle je spellen
- **Account Management**: Wijzig je wachtwoord
- **Responsief Design**: Werkt perfect op desktop, tablet en mobiel

## 📋 Vereisten

- Python 3.8 of hoger
- pip (Python package manager)

## 🚀 Installatie

### Stap 1: Clone of download het project
```bash
cd NSE-Roulette
```

### Stap 2: Maak een virtuele omgeving (aanbevolen)
```bash
python -m venv venv

# Activeer de virtuele omgeving:
# Op Windows:
venv\Scripts\activate

# Op macOS/Linux:
source venv/bin/activate
```

### Stap 3: Installeer de vereiste packages
```bash
pip install -r requirements.txt
```

### Stap 4: Voer de applicatie uit
```bash
python NSE-Roulette.py
```

De applicatie start nu op `http://localhost:5000`

### Stap 5: Open in je browser
Open je webbrowser en ga naar: **http://localhost:5000**

## 🎮 Hoe Speel Je

### Registratie & Login
1. **Nieuw account**: Klik op "Registreer hier" en vul je email, gebruikersnaam en wachtwoord in
2. **Login**: Log in met je email en wachtwoord
3. **Startbonus**: Je krijgt automatisch €100 tegoed!

### Spelen
1. **Kies je inzettype**: 
   - Getal (nummer 0-36)
   - Kleur (Rood of Zwart)
   - Oneven/Even
   - Hoog (19-36) / Laag (1-18)
2. **Voer inzetbedrag in**: Minimaal €1, maximaal €1000
3. **Selecteer je inzet**: Klik op de gewenste waarde
4. **Klik SPIN**: Het wiel draait en je ziet het resultaat
5. **Volg je balans**: Je tegoed wordt automatisch bijgewerkt

### Account Management
- Bekijk je **Dashboard** voor statistieken
- Zie je **Spelgeschiedenis** voor alle vorige spellen
- **Wijzig je wachtwoord** in Account instellingen


## ⚙️ Configuratie


**Standaardwaarden:**
- Startbalans: €100
- Min. inzet: €1
- Max. inzet: €1000
- Server poort: 5000

## 🎲 Roulette Uitbetalingen

- **0**: Groen (verliest tegen alles)
- **1-36**: Rood of Zwart
  - **Enkel getal**: 36:1 uitbetaling
  - **Rood/Zwart**: 2:1 uitbetaling
  - **Oneven/Even**: 2:1 uitbetaling
  - **Hoog (19-36) / Laag (1-18)**: 2:1 uitbetaling

## 🛡️ Disclaimer

⚠️ **LET OP**: Dit is een educatief/entertainment project. 
- Dit mag NIET gebruikt worden voor echt gokken of geldtransacties
- Speel verantwoord en maak jezelf niet schuldig
- Lokale wetten en regelingen kunnen van toepassing zijn

## 🔒 Veiligheid

- Wachtwoorden worden beveiligd opgeslagen (hashed)
- Sessies zijn beveiligd met geheime sleutels
- SQL injection bescherming via SQLAlchemy
- CSRF bescherming ingebouwd

## 📝 Licentie

Dit project is gelicentieerd onder de MIT Licentie.

## 📧 Contact & Support

- **Email**: mylaneling6@gmail.com
- **GitHub**: Mylan707

---

**Veel plezier met spelen! Speel bewust en verantwoord! 🎰**


## Inloggen voor becijfering:

Voorbeeld inloggegevens:

E-mail:  gebruiker@oplevering.nl

Gebruikersnaam:  Gebruiker

Wachtwoord:  Wachtwoord123

(Mag natuurlijk ook eigen account aanmaken)


Inloggen als admin:

http://localhost:5000/admin

User: admin

Password: admin


*Laatst geupdate: April 2026*
