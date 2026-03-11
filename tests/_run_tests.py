#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import subprocess
import msvcrt
import glob

# =============================================================================
# Paths (script lives in tests/)
# =============================================================================
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
E2E_DIR      = os.path.join(SCRIPT_DIR, "playwright", "e2e")
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)   # one level above tests/

# =============================================================================
# Helpers
# =============================================================================

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')


def get_key():
    """Capture a single keypress (arrows, Enter, Esc, digits)."""
    key = msvcrt.getch()
    if key in (b'\xe0', b'\x00'):          # escape sequence prefix (arrows)
        key = msvcrt.getch()
        if key == b'H':  return 'up'
        if key == b'P':  return 'down'
    elif key == b'\r':   return 'enter'
    elif key == b'\x1b': return 'esc'
    elif key == b'\x08': return 'back'     # Backspace → back to main menu
    elif key.isdigit():  return key.decode()
    return None


def discover_e2e_tests():
    """Return sorted list of *.test.js files found in tests/playwright/e2e/."""
    pattern = os.path.join(E2E_DIR, "*.test.js")
    files   = sorted(glob.glob(pattern))
    return files


def short_name(filepath):
    """Return just the filename without extension for display."""
    return os.path.splitext(os.path.basename(filepath))[0]


def run_command(cmd, cwd=None):
    """Run a shell command and wait; handles KeyboardInterrupt gracefully."""
    try:
        subprocess.run(cmd, shell=True, cwd=cwd or PROJECT_ROOT)
    except KeyboardInterrupt:
        print("\n\nInterruption detected...")
    except Exception as e:
        print(f"\Error : {e}")

    print("\n" + "=" * 50)
    print("Command ended.")
    print("=" * 50)
    print("\nHit a key: return to the Menu...")
    msvcrt.getch()

# =============================================================================
# Screen renderers
# =============================================================================

def draw_main_menu(cursor):
    clear_screen()
    print("=" * 50)
    print("              TEST MENU")
    print("=" * 50)
    print()

    entries = [
        "Run ALL Jest Tests  (npm run test)",
        "Run ALL Playwright Tests  (npm run test:playwright)",
        "Run a specific Playwright test →",
    ]

    for i, label in enumerate(entries, 1):
        arrow = "→" if i == cursor else " "
        print(f"  {arrow} {i}) {label}")

    print()
    print("=" * 50)
    print("  [↑][↓] Select   [Enter] Validate   [Echap]: Exit")
    print("=" * 50)


def draw_e2e_menu(cursor, test_files):
    clear_screen()
    print("=" * 50)
    print("       CHOOSE A E2E PLAYWRIGHT TEST")
    print("=" * 50)
    print(f"  Folder : tests/playwright/e2e/")
    print()

    if not test_files:
        print("  (No file '*.test.js' found)")
    else:
        for i, filepath in enumerate(test_files, 1):
            arrow = "→" if i == cursor else " "
            print(f"  {arrow} {i:2d}) {short_name(filepath)}")

    print()
    print("=" * 50)
    print("  [↑][↓]: Select   [Enter]: Run   [Backspace]: Main Menu ")
    print("=" * 50)

# =============================================================================
# Menu loops
# =============================================================================

def main_menu_loop():
    cursor    = 1
    nb_items  = 3

    while True:
        draw_main_menu(cursor)
        key = get_key()

        if key == 'up':
            cursor = max(1, cursor - 1)
        elif key == 'down':
            cursor = min(nb_items, cursor + 1)
        elif key == 'esc':
            clear_screen()
            print("Goodbye !")
            sys.exit(0)
        elif key and key.isdigit() and 1 <= int(key) <= nb_items:
            cursor = int(key)
            key = 'enter'            # treat digit as immediate confirm

        if key == 'enter':
            if cursor == 1:
                clear_screen()
                print("Run : npm run test\n")
                run_command("npm run test")
            elif cursor == 2:
                clear_screen()
                print("Run : npm run test:playwright\n")
                run_command("npm run test:playwright")
            elif cursor == 3:
                e2e_menu_loop()


def e2e_menu_loop():
    cursor     = 1
    test_files = discover_e2e_tests()
    nb_items   = len(test_files)

    if nb_items == 0:
        clear_screen()
        print(f"No file '*.test.js' found in :\n  {E2E_DIR}")
        print("\nHit a key: return to the Menu..")
        msvcrt.getch()
        return

    while True:
        draw_e2e_menu(cursor, test_files)
        key = get_key()

        if key == 'up':
            cursor = max(1, cursor - 1)
        elif key == 'down':
            cursor = min(nb_items, cursor + 1)
        elif key in ('esc', 'back'):
            return                   # back to main menu
        elif key and key.isdigit():
            n = int(key)
            if 1 <= n <= nb_items:
                cursor = n
                key = 'enter'       # treat digit as immediate confirm

        if key == 'enter' and 1 <= cursor <= nb_items:
            chosen = test_files[cursor - 1]
            rel    = os.path.relpath(chosen, PROJECT_ROOT).replace("\\", "/")
            cmd    = (
                f"npx playwright test {rel} "
                f"--config=tests/playwright/playwright.config.js"
            )
            clear_screen()
            print(f"Run : {cmd}\n")
            run_command(cmd)

# =============================================================================
# Entry point
# =============================================================================

if __name__ == "__main__":
    try:
        main_menu_loop()
    except KeyboardInterrupt:
        print("\nGoodbye !")
        sys.exit(0)
