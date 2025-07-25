"""install Python and Selenium along with these packages to run the script"""
import time
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC, expected_conditions
from selenium.webdriver.firefox.options import Options
from requests_ip_rotator import ApiGateway
from multiprocessing import Process

# disable the geo location prompt upon browser startup
geoDisabled = webdriver.FirefoxOptions()
geoDisabled.set_preference("geo.enabled", False)
#browser = webdriver.Firefox(geoDisabled)

# create a new record
count = 1
while count < 1001:
    options = Options()
    options.add_argument("--headless")
    browser = webdriver.Firefox(options=options)
    browser2 = ApiGateway(site="https://gdt-test-frontend-ehgye9ajamb0hvgk.z01.azurefd.net/", access_key_id='', access_key_secret='')
    browser2.start()
    browser.get("https://red-stone-00f5d251e.5.azurestaticapps.net/")

    #time.sleep(2)
    WebDriverWait(browser, 1000).until(expected_conditions.presence_of_element_located((By.XPATH, '//*[@id="homeCreateButton"]')))
    create_new_record = browser.find_element('xpath', '//*[@id="homeCreateButton"]')
    browser.execute_script('arguments[0].click();', create_new_record)

    # fill in fake information
    #time.sleep(2)
    WebDriverWait(browser, 1000).until(expected_conditions.presence_of_element_located((By.CSS_SELECTOR, '#create_record > form:nth-child(1) > div:nth-child(2) > input:nth-child(2)')))
    browser.find_element('css selector', '#create_record > form:nth-child(1) > div:nth-child(2) > input:nth-child(1)').send_keys("Hieu's bot " + str(count))
    browser.find_element('css selector', '#create_record > form:nth-child(1) > div:nth-child(2) > input:nth-child(2)').send_keys("Hieu's dos fake record test with picture #" + str(count))

    #add picture
    #browse_files_to_add = browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div[2]/form/div[1]/div[1]/input')
    #browse_files_to_add.send_keys(r"C:\Users\soope\Desktop\Rockies_in_the_morning.jpg")

    #time.sleep(1)
    submit = browser.find_element('xpath' ,'//*[@id="record-button"]')
    browser.execute_script('arguments[0].click();', submit)
    WebDriverWait(browser, 1500).until(expected_conditions.presence_of_element_located((By.XPATH, '/html/body/section/div/article/div/div[2]/div')))
   #browser2.shutdown()
    browser.close()
    print('Fake Record #' + str(count) + ' Created')
    count += 1
