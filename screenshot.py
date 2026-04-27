'''
Author: hui.chenn
Description: 
Date: 2026-04-27 13:35:35
LastEditTime: 2026-04-27 13:35:49
LastEditors: hui.chenn
'''
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3001/')
    page.wait_for_timeout(3000)
    page.screenshot(path='d:/work/program/tineco/UI/a2ui-vue-engine/screenshot.png', full_page=True)
    browser.close()
    print('Screenshot saved')
