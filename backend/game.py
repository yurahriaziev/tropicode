import pygame
import cv2
import numpy as np

# Initialize Pygame
pygame.init()
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
clock = pygame.time.Clock()
rect = pygame.Rect(200, 150, 400, 300)
def get_frame():
    """Capture a Pygame frame and return it as a JPEG"""
    screen.fill((0, 0, 0))  # Clear screen
    pygame.draw.rect(screen, (255, 0, 0), rect)  # Example shape
    pygame.display.flip()

    rect.x += 1
    

    # Convert to NumPy array
    frame = pygame.surfarray.array3d(screen)
    frame = np.rot90(frame)  # Rotate to fix orientation
    frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)  # Convert RGB to BGR for OpenCV

    # Encode to JPEG
    _, jpeg = cv2.imencode('.jpg', frame)
    return jpeg.tobytes()

if __name__ == "__main__":
    while True:
        get_frame()
        clock.tick(30)  # 30 FPS
