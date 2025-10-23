import time
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC, expected_conditions
from selenium.webdriver.firefox.options import Options

"""This runs without browser popping up, comment out to run headless"""
options = Options()
options.add_argument('--headless')

browser = webdriver.Firefox(options)
print('Grabbing test website: https://red-stone-00f5d251e.5.azurestaticapps.net/')

browser.get("https://red-stone-00f5d251e.5.azurestaticapps.net/")
time.sleep(2)

print('Waiting for target item to render: Create Record Button')
WebDriverWait(browser, 800).until(expected_conditions.presence_of_element_located(
    (By.CSS_SELECTOR , '#homeCreateButton')))

print('Click on CREATE RECORD BUTTON')
create_new_record = browser.find_element('css selector', '#homeCreateButton')
browser.execute_script('arguments[0].click();', create_new_record)
print('Test SUCCESSFUL: Clicked on CREATE RECORD BUTTON and successfully went to CREATE NEW RECORD page.')
