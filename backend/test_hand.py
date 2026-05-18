import cv2
from mediapipe.python.solutions import hands as mp_hands

hands = mp_hands.Hands()
cap = cv2.VideoCapture(0)

print("Show your hand to the camera. Press 'q' to quit.")

while True:
    success, img = cap.read()
    if not success:
        continue
    
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(img_rgb)
    
    if results.multi_hand_landmarks:
        print("✅ HAND DETECTED!")
    else:
        print("❌ No hand detected")
    
    cv2.imshow("Test", img)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()