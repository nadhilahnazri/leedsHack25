import cv2

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ ERROR: Cannot open webcam. Check your camera settings.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ ERROR: Failed to capture frame.")
        break

    cv2.imshow("Camera Test", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
