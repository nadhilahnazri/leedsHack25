import cv2
import mediapipe as mp

# Initialize MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7)
mp_drawing = mp.solutions.drawing_utils

def is_finger_extended(hand_landmarks, tip, mcp):
    """Returns True if the given finger is extended, False if curled."""
    return hand_landmarks.landmark[tip].y < hand_landmarks.landmark[mcp].y

def classify_hand_sign(hand_landmarks):
    thumb = is_finger_extended(hand_landmarks, 4, 3)
    index = is_finger_extended(hand_landmarks, 8, 6)
    middle = is_finger_extended(hand_landmarks, 12, 10)
    ring = is_finger_extended(hand_landmarks, 16, 14)
    pinky = is_finger_extended(hand_landmarks, 20, 18)

    # Check for Thumbs Up (Thumb extended, all others curled)
    if thumb and not index and not middle and not ring and not pinky:
        return "Thumbs Up"
    elif index and not middle and not ring and not pinky:
        return "Pointing"
    elif index and middle and not ring and not pinky:
        return "Peace Sign"
    elif thumb and index and middle and ring and pinky:
        return "Open Palm"
    elif not thumb and not index and not middle and not ring and not pinky:
        return "Fist"
    elif thumb and not index and not middle and not ring and pinky:
        return "Rock Sign"
    else:
        return "Unknown Gesture"

# Open webcam
cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb_frame)

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # Recognize the hand sign
            gesture = classify_hand_sign(hand_landmarks)
            cv2.putText(frame, f"Gesture: {gesture}", (50, 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow("Hand Sign Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
