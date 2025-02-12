# import pygame
# import random
# import time

# pygame.init()

# WIDTH, HEIGHT = 1000, 700
# SCREEN = pygame.display.set_mode((WIDTH, HEIGHT))

# bg_img = pygame.image.load('static/bg.jpg')
# bg_img = pygame.transform.scale(bg_img, (WIDTH, HEIGHT))
# cat_images = [
#     pygame.image.load(f"static/cat{i}.png") for i in range(1, 7) 
# ]
# CAT_WIDTH, CAT_HEIGHT = 100, 100
# cat_images = [pygame.transform.scale(img, (CAT_WIDTH, CAT_HEIGHT)) for img in cat_images]

# font = pygame.font.Font(None, 30)
# big_font = pygame.font.Font(None, 72)

# button_color = ((253, 194, 255))
# button_hover_color = (225, 166, 227)
# button_rect = pygame.Rect(WIDTH // 2 - 100, HEIGHT // 2 + 50, 200, 50)

# gift_button_color = (190, 150, 255)
# gift_button_hover_color = (170, 130, 235)
# gift_button_rect = pygame.Rect(WIDTH // 2 - 100, HEIGHT // 2 + 120, 200, 50)

# yes_button_color = (255, 100, 100)
# yes_button_hover_color = (235, 80, 80)
# yes_button_1_rect = pygame.Rect(WIDTH // 2 - 120, HEIGHT // 2 + 50, 100, 50)
# yes_button_2_rect = pygame.Rect(WIDTH // 2 + 20, HEIGHT // 2 + 50, 100, 50)

# def draw_button(rect, text, color, hover_color):
#     mouse_x, mouse_y = pygame.mouse.get_pos()
#     button_color = hover_color if rect.collidepoint(mouse_x, mouse_y) else color
#     pygame.draw.rect(SCREEN, button_color, rect, border_radius=10)
#     button_text = font.render(text, True, (255, 255, 255))
#     if text == 'Open Your Gift':
#         x = 25
#     elif text == 'Yes':
#         x = 30
#     else:
#         x = 45
#     SCREEN.blit(button_text, (rect.x + x, rect.y + 15))

# def display_valentine_message():
#     while True:
#         SCREEN.fill((253, 194, 255))
#         valentine_text = big_font.render("Will you be my Valentine?", True, (200, 0, 0))
#         SCREEN.blit(valentine_text, (WIDTH // 2 - 280, HEIGHT // 2 - 50))

#         draw_button(yes_button_1_rect, "Yes", yes_button_color, yes_button_hover_color)
#         draw_button(yes_button_2_rect, "Yes", yes_button_color, yes_button_hover_color)

#         pygame.display.update()

#         for event in pygame.event.get():
#             if event.type == pygame.QUIT:
#                 pygame.quit()
#                 return
#             elif event.type == pygame.MOUSEBUTTONDOWN:
#                 mouse_x, mouse_y = event.pos
#                 if yes_button_1_rect.collidepoint(mouse_x, mouse_y) or yes_button_2_rect.collidepoint(mouse_x, mouse_y):
#                     run_game()

# def run_game():
#     clock = pygame.time.Clock()
#     cats = []
#     score = 0
#     CAT_SPEED = 3
#     CAT_FALL_RATE = 18
#     GAME_DURATION = 10
#     start_time = time.time()
#     game_over = False

#     run = True
#     while run:
#         SCREEN.blit(bg_img, (0, 0))

#         elapsed_time = time.time() - start_time
#         remaining_time = max(0, GAME_DURATION - int(elapsed_time))

#         if remaining_time == 0:
#             game_over = True

#         for event in pygame.event.get():
#             if event.type == pygame.QUIT:
#                 pygame.quit()
#             elif event.type == pygame.MOUSEBUTTONDOWN:
#                 mouse_x, mouse_y = event.pos

#                 if game_over and button_rect.collidepoint(mouse_x, mouse_y):
#                     run_game()
#                 if game_over and score >= 10 and gift_button_rect.collidepoint(mouse_x, mouse_y):
#                     display_valentine_message()
#                     run_game()
#                 if not game_over:
#                     for cat in cats[:]:
#                         cx, cy, cat_img = cat
#                         if cx <= mouse_x <= cx + CAT_WIDTH and cy <= mouse_y <= cy + CAT_HEIGHT:
#                             cats.remove(cat)
#                             score += 1
        
#         if not game_over:
#             if random.randint(0, CAT_FALL_RATE) == 0:
#                 x_pos = random.randint(0, WIDTH - 80)
#                 selected_cat = random.choice(cat_images)
#                 tilt_angle = random.choice(range(-15, -4)) if random.random() < 0.5 else random.choice(range(5, 16))
#                 tilted_cat = pygame.transform.rotate(selected_cat, tilt_angle)
#                 cats.append([x_pos, 0, tilted_cat])

#             for cat in cats:
#                 cat[1] += CAT_SPEED

#             cats = [cat for cat in cats if cat[1] < HEIGHT]

#         for cat in cats:
#             SCREEN.blit(cat[2], (cat[0], cat[1]))

#         score_text = font.render(f"Score: {score}", True, (0, 0, 0))
#         timer_text = font.render(f"Time Left: {remaining_time}s", True, (0, 0, 0))
#         SCREEN.blit(score_text, (10, 10))
#         SCREEN.blit(timer_text, (WIDTH - 200, 10))

#         if game_over:
#             SCREEN.fill((255, 255, 255))
#             if score >= 10:
#                 result_text = big_font.render("You Won!", True, (0, 128, 0))
#                 # draw_button(gift_button_rect, "Open Your Gift", gift_button_color, gift_button_hover_color)
#                 SCREEN.blit(result_text, (WIDTH // 2 - 115, HEIGHT // 2 - 50))
#             else:
#                 result_text = big_font.render("Game Over!", True, (200, 0, 0))
#                 SCREEN.blit(result_text, (WIDTH // 2-140, HEIGHT // 2 - 50))

#             draw_button(button_rect, "Play Again", button_color, button_hover_color)

#         pygame.display.update()
#         clock.tick(30)

# run_game()