import cv2
import joblib

from mediapipe.python.solutions import hands as mp_hands
from mediapipe.python.solutions import drawing_utils


model = joblib.load("gesture_model.pkl")


hands = mp_hands.Hands()
draw = drawing_utils


cap = cv2.VideoCapture(0)


labels = {
    0: "HELLO",
    1: "YES",
    2: "NO",
    3: "HELP",
    4: "THANK YOU"
}

while True:

    success, img = cap.read()

    if not success:
        break

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    results = hands.process(img_rgb)

    text = ""

    if results.multi_hand_landmarks:

        for hand_landmarks in results.multi_hand_landmarks:

            data = []

            for lm in hand_landmarks.landmark:
                data.append(lm.x)
                data.append(lm.y)
                data.append(lm.z)

            prediction = model.predict([data])[0]

            text = labels.get(prediction, "Unknown")

            draw.draw_landmarks(
                img,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS
            )

    cv2.putText(
        img,
        text,
        (50, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.imshow("Gesture Prediction", img)

    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()