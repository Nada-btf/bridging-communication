from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
import threading
import queue
import json
import cv2
import sounddevice as sd
import joblib

from vosk import Model, KaldiRecognizer
from mediapipe.python.solutions import hands as mp_hands
from mediapipe.python.solutions import drawing_utils

app = Flask(__name__)

# =========================
# 🔥 DATABASE (ADDED)
# =========================
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///inclusive.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    speech = db.Column(db.String(500))
    gesture = db.Column(db.String(100))


# =========================
# SPEECH RECOGNITION
# =========================
speech_model = Model("models/vosk-model-small-en-us-0.15")
recognizer = KaldiRecognizer(speech_model, 16000)

audio_queue = queue.Queue()

latest_text = ""

def audio_callback(indata, frames, time, status):
    audio_queue.put(bytes(indata))

def speech_loop():

    global latest_text

    with sd.RawInputStream(
        samplerate=16000,
        blocksize=4000,
        dtype='int16',
        channels=1,
        callback=audio_callback
    ):

        while True:
            data = audio_queue.get()

            if recognizer.AcceptWaveform(data):
                result = json.loads(recognizer.Result())
                text = result.get("text", "").strip()

                if text:
                    latest_text = text
                    print("TEXT:", text)


# =========================
# GESTURE RECOGNITION
# =========================
gesture_model = joblib.load("gesture_model.pkl")

hands = mp_hands.Hands()
draw = drawing_utils

cap = cv2.VideoCapture(0)

latest_gesture = ""

labels = {
    0: "HELLO",
    1: "YES",
    2: "NO",
    3: "HELP",
    4: "THANK YOU"
}

def gesture_loop():

    global latest_gesture

    while True:

        success, img = cap.read()
        if not success:
            continue

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = hands.process(img_rgb)

        if results.multi_hand_landmarks:

            for hand_landmarks in results.multi_hand_landmarks:

                data = []
                for lm in hand_landmarks.landmark:
                    data.append(lm.x)
                    data.append(lm.y)
                    data.append(lm.z)

                prediction = gesture_model.predict([data])[0]
                latest_gesture = labels.get(prediction, "Unknown")

                print("GESTURE:", latest_gesture)

                draw.draw_landmarks(
                    img,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS
                )

        cv2.putText(
            img,
            latest_gesture,
            (50, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        cv2.imshow("Inclusive System", img)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break


# =========================
# API + HISTORY SAVE
# =========================
@app.route("/communication")
def communication():

    # 🔥 SAVE TO DB
    new_entry = History(
        speech=latest_text,
        gesture=latest_gesture
    )

    db.session.add(new_entry)
    db.session.commit()

    return jsonify({
        "text": latest_text,
        "gesture": latest_gesture
    })


# =========================
# RUN APP
# =========================
if __name__ == "__main__":

    # create DB
    with app.app_context():
        db.create_all()

    # threads
    speech_thread = threading.Thread(target=speech_loop)
    speech_thread.daemon = True
    speech_thread.start()

    gesture_thread = threading.Thread(target=gesture_loop)
    gesture_thread.daemon = True
    gesture_thread.start()

    app.run(port=5002, debug=False)