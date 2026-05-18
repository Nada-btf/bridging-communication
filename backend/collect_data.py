import cv2
import csv

from mediapipe.python.solutions import hands as mp_hands
from mediapipe.python.solutions import drawing_utils

label = input("Enter label: ")

hands = mp_hands.Hands()
draw = drawing_utils

cap = cv2.VideoCapture(0)

with open("dataset.csv", "a", newline="") as f:

    writer = csv.writer(f)

    while True:

        success, img = cap.read()

        if not success:
            break

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        results = hands.process(img_rgb)

        if results.multi_hand_landmarks:

            for hand_landmarks in results.multi_hand_landmarks:

                data = []

                for lm in hand_landmarks.landmark:
                    data.append(lm.x)
                    data.append(lm.y)
                    data.append(lm.z)

                data.append(label)

                writer.writerow(data)

                draw.draw_landmarks(
                    img,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS
                )
        cv2.imshow("Collect Data", img)

        key = cv2.waitKey(1) & 0xFF

        if key == 27:
            print("Stopping...")
            break

cap.release()
cv2.destroyAllWindows()