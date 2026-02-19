# Flask Roulette Site

Een interactieve online roulette site gebouwd met Flask. Deze applicatie stelt gebruikers in staat om het klassieke casino-spel roulette te spelen met realistische gameplay.

## 🎰 Functies

- **Interactieve Roulette Spinning**: Realistische roulettewiel animatie
- **Weddenschap Systeem**: Plaats wedden op nummers, kleuren en andere opstellingen
- **Balans Management**: Volg je huidige speltegoed
- **Speel Historie**: Bekijk vorige spins en resultaten
- **Responsief Design**: Werkt op desktop, tablet en mobiel

## 📋 Vereisten

- Python 3.8+
- Flask
- Flask-SQLAlchemy (voor database)
- Andere dependenties (zie requirements.txt)

## 🚀 Installatie

1. Clone de repository:
```bash
git clone <repository-url>
cd NSE-Roulette
```

2. Maak een virtuele omgeving:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# of voor macOS/Linux:
# source venv/bin/activate
```

3. Installeer de vereiste packages:
```bash
pip install -r requirements.txt
```

4. Voer de applicatie uit:
```bash
python NSE-Roulette.py
```

5. Open je browser en ga naar:
```
http://localhost:5000
```

## 🎮 Hoe Speel Je

1. **Start het spel**: De applicatie laadt met een startbalans
2. **Plaats je wedden**: 
   - Klik op getallen voor directe nummers
   - Klik op kleuren voor rood/zwart wedden
   - Selecteer andere opstellingen via het wedden menu
3. **Spin het wiel**: Klik de "SPIN" knop om het roulettewiel te draaien
4. **Bekijk je resultaat**: Het winnende getal wordt aangegeven en je balans wordt bijgewerkt

## 📁 Projectstructuur

```
NSE-Roulette/
├── NSE-Roulette.py      # Hoofdapplicatiebestand
├── requirements.txt      # Python dependenties
├── README.md            # Deze file
├── static/
│   ├── css/
│   │   └── style.css    # Stijling
│   └── js/
│       └── script.js    # Frontend logica
└── templates/
    └── index.html       # HTML template
```

## ⚙️ Configuratie

Je kunt de volgende instellingen aanpassen in `NSE-Roulette.py`:

- **Startbalans**: Initiële hoeveelheid speelgeld
- **Minimale inzet**: Minimale weddenschap toegestaan
- **Maximale inzet**: Maximale weddenschap toegestaan
- **Server poort**: Wijzig de poort waarop de app draait

## 🎲 Roulette Regels

- Eupaese roulette: 37 getallen (0-36)
- Mogelijke wedden:
  - Enkel getal (36:1 uitbetaling)
  - Twee getallen (17:1 uitbetaling)
  - Drie getallen (11:1 uitbetaling)
  - Vier getallen (8:1 uitbetaling)
  - Rode/Zwarte (1:1 uitbetaling)
  - Oneven/Even (1:1 uitbetaling)
  - Hoog/Laag (1:1 uitbetaling)

## 🛡️ Disclaimer

Dit is een educatief project. Voor echt gokken moet je een licentie hebben volgens lokale wetgeving. Dit spel mag niet gebruikt worden voor daadwerkelijk gokken of geldtransacties.

## 🤝 Bijdragen

Bijdragen zijn welkom! Voel je vrij om:
- Bug fixes in te dienen
- Nieuwe features voor te stellen
- Suggesties voor verbetering te doen

## 📝 Licentie

Dit project is gelicentieerd onder de MIT Licentie - zie LICENSE bestand voor details.

## 📧 Contact

Voor vragen of feedback, neem contact op via [jouw contactinformatie].

---

**Veel plezier met spelen!  🎰**
