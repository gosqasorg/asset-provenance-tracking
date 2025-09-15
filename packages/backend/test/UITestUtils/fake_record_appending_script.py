"""install Python and Selenium along with these packages to run the script"""
import time
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC, expected_conditions
from requests_ip_rotator import ApiGateway, EXTRA_REGIONS
from multiprocessing import Process
from selenium.webdriver.firefox.options import Options
import re

# disable the geo location prompt upon browser startup
geoDisabled = webdriver.FirefoxOptions()
geoDisabled.set_preference("geo.enabled", False)

# create a new record

#browser2 = ApiGateway(site="", access_key_id='', access_key_secret='')
#browser2.start()
options = Options()
options.add_argument("--headless")
browser = webdriver.Firefox()
browser.get("https://gdt-test-frontend-ehgye9ajamb0hvgk.z01.azurefd.net/")
time.sleep(1.5)

create_new_record = browser.find_element('xpath', "//*[@id='homeCreateButton']")
browser.execute_script('arguments[0].click();', create_new_record)

# fill in fake information
time.sleep(1)
browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div[2]/form/div[1]/input[1]').send_keys("Hieu's Appending Bot")
browser.find_element('css selector', '#create_record > form:nth-child(1) > div:nth-child(2) > input:nth-child(2)').send_keys("Hieu's dos fake appending record")
click_view = browser.find_element('xpath', '//*[@id="viewRecordButton"]')
browser.execute_script('arguments[0].click();', click_view)

#add picture
#browse_files_to_add = browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div[2]/form/div[1]/div[1]/input')

#uncomment below and change directory to add picture
#browse_files_to_add.send_keys(r"C:\Users\soope\Desktop\Rockies_in_the_morning.jpg")

#time.sleep(1)

# submit to create record
submit = browser.find_element('xpath' ,'//*[@id="record-button"]')
browser.execute_script('arguments[0].click();', submit)
WebDriverWait(browser, 800).until(expected_conditions.presence_of_element_located((By.XPATH, '/html/body/section/div/article/div/div[2]/div')))
print("fake record created")

# copy the record key
time.sleep(1.5)
key = browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div/section/div[1]/div[2]')
key_text = key.get_attribute('innerHTML')
key_text.split()

key_text = re.sub("R.*?:\\s", "", key_text)


# select view records
#view_records = browser.find_element('xpath', '//*[@id="viewRecordButton"]')
#browser.execute_script('arguments[0].click();', view_records)

time.sleep(1)
# insert scraped key into key field then view record
browser.find_element('css selector', '#input').send_keys(key_text)

view_records = browser.find_element('css selector', 'button.baseButton:nth-child(2)')
browser.execute_script('arguments[0].click();', view_records)

# now append new fake records
counter = 1
while counter < 1000:

    time.sleep(1)
    # fill in description
    browser.find_element('xpath', '//*[@id="provenance-description"]').send_keys('Fake appended record #' + str(counter))

    #submit new append
    append_submit = browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div/div/div[3]/div/section[5]/form/div[2]/button')
    browser.execute_script('arguments[0].click();', append_submit)
    counter += 1
    print('fake record appended')