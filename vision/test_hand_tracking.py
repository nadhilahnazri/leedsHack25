import cv2
import mediapipe as mp
import socketio
import time

# Initialize Socket.IO client
sio = socketio.Client()

def connect_to_server():
    """Attempt to connect to the server with retries."""
    while not sio.connected:
        try:
            sio.connect("http://localhost:5000")  # Change if needed
            print("✅ Connected to WebSocket server")
        except Exception as e:
            print(f"🔴 Connection failed, retrying... {e}")
            time.sleep(2)

connect_to_server()  # Try to connect when script starts

# Initialize MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

last_gesture = None  # Store the last detected gesture

def send_gesture_to_server(gesture):
    """Send the detected gesture to the server via WebSocket, avoiding spam."""
    global last_gesture
    if gesture != last_gesture:  # Only send if different from last one
        sio.emit("gesture_detected", {"gesture": gesture})
        last_gesture = gesture  # Update last sent gesture

def is_thumb_extended(hand_landmarks, handedness):
    """Detect if the thumb is extended based on hand orientation."""
    thumb_tip = hand_landmarks.landmark[4].x
    thumb_mcp = hand_landmarks.landmark[2].x

    return thumb_tip > thumb_mcp if handedness == "Right" else thumb_tip < thumb_mcp

def is_finger_extended(hand_landmarks, tip, mcp):
    """Returns True if the given finger is extended, False if curled."""
    return hand_landmarks.landmark[tip].y < hand_landmarks.landmark[mcp].y

def classify_hand_sign(hand_landmarks, handedness):
    """Classify the detected hand gesture."""
    thumb = is_thumb_extended(hand_landmarks, handedness)
    index = is_finger_extended(hand_landmarks, 8, 6)
    middle = is_finger_extended(hand_landmarks, 12, 10)
    ring = is_finger_extended(hand_landmarks, 16, 14)
    pinky = is_finger_extended(hand_landmarks, 20, 18)

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
        for i, hand_landmarks in enumerate(result.multi_hand_landmarks):
            handedness = result.multi_handedness[i].classification[0].label  # "Left" or "Right"
            
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # Recognize the hand sign with handedness context
            gesture = classify_hand_sign(hand_landmarks, handedness)
            cv2.putText(frame, f"Gesture: {gesture}", (50, 50 + i * 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            # Send gesture to the server
            send_gesture_to_server(gesture)

    cv2.imshow("Hand Sign Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
