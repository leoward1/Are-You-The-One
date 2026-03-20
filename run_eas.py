import pty
import sys
import os

os.environ["EXPO_APPLE_ID"] = "marquisrichburg@yahoo.com"
os.environ["EXPO_APPLE_PASSWORD"] = "N3wJ0b1!"
pty.spawn(["npx", "eas-cli", "build", "--platform", "ios", "--profile", "production"])
