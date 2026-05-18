from flask import Flask, jsonify
import cv2
import joblib
import threading

from mediapipe.python.solutions import hands as mp_hands
from mediapipe.python.solutions import drawing_utils

app = Flask(__name__)

# Load AI model
model = joblib.load("gesture_model.pkl")

# MediaPipe Hands
hands = mp_hands.Hands()

# Drawing utility
draw = drawing_utils

# Webcam
cap = cv2.VideoCapture(0)

# Last detected gesture
latest_gesture = ""

# Labels
labels = {
    0: "HELLO",
    1: "YES",
    2: "NO"
}

def detect_gesture():

    global latest_gesture

    while True:

        success, img = cap.read()

        if not success:
            continue

        # Convert image to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Process hand detection
        results = hands.process(img_rgb)

        if results.multi_hand_landmarks:

            for hand_landmarks in results.multi_hand_landmarks:

                data = []

                # Get landmarks
                for lm in hand_landmarks.landmark:
                    data.append(lm.x)
                    data.append(lm.y)
                    data.append(lm.z)

                # AI prediction
                prediction = model.predict([data])[0]

                # Convert label to text
                latest_gesture = labels.get(prediction, "Unknown")

                # Print in terminal
                print(latest_gesture)

                # Draw hand landmarks
                draw.draw_landmarks(
                    img,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS
                )

        # Show prediction on screen
        cv2.putText(
            img,
            latest_gesture,
            (50, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        # Show webcam
        cv2.imshow("Gesture API", img)

        # Press q to quit
        key = cv2.waitKey(1) & 0xFF

        if key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# API Route
@app.route("/gesture")
def get_gesture():

    return jsonify({
        "gesture": latest_gesture
    })

# Run app
if __name__ == "__main__":

    thread = threading.Thread(target=detect_gesture)
    thread.daemon = True
    thread.start()

    app.run(port=5001, debug=False)