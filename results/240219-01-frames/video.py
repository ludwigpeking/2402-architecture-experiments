import cv2
import os
import glob

img_array = []
for filename in sorted(glob.glob('*.png')): # Assuming PNG images are in the current directory
    img = cv2.imread(filename)
    height, width, layers = img.shape
    size = (width, height)
    img_array.append(img)

# Create a VideoWriter object
out = cv2.VideoWriter('output.avi', cv2.VideoWriter_fourcc(*'DIVX'), 15, size)

# Freeze the first frame for 2 seconds
first_frame = img_array[0]
for _ in range(30):  # 15 fps * 2 seconds
    out.write(first_frame)

# Slow down the first 10 PNGs
slow_factor = 15  # Adjust this factor to control the slowdown effect
for i in range(1, 10):  # Start from 1 since we've already handled the first frame
    for _ in range(slow_factor):
        out.write(img_array[i])

# Write the rest of the frames normally
for i in range(10, len(img_array)):
    out.write(img_array[i])

out.release()
