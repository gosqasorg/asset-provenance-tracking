"""install Python and Selenium along with these packages to run the script"""
import time
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC, expected_conditions
from requests_ip_rotator import ApiGateway, EXTRA_REGIONS

# disable the geo location prompt upon browser startup
geoDisabled = webdriver.FirefoxOptions()
geoDisabled.set_preference("geo.enabled", False)
browser = webdriver.Firefox(geoDisabled)

# create a new record
count = 1

browser2 = ApiGateway(site="https://red-stone-00f5d251e.5.azurestaticapps.net/", access_key_id='', access_key_secret='')
browser2.start()
browser.get("https://red-stone-00f5d251e.5.azurestaticapps.net/")
time.sleep(1.5)
create_new_record = browser.find_element('xpath', "//*[@id='homeCreateButton']")
browser.execute_script('arguments[0].click();', create_new_record)

# fill in fake information
time.sleep(1)
browser.find_element('css selector', '#create_record > form:nth-child(1) > div:nth-child(2) > input:nth-child(1)').send_keys("Hieu's Appending Bot " + str(count))
browser.find_element('css selector', '#create_record > form:nth-child(1) > div:nth-child(2) > input:nth-child(2)').send_keys("Hieu's dos fake appending record test with 9.7MB picture #" + str(count))

#add picture
browse_files_to_add = browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div[2]/form/div[1]/div[1]/input')
browse_files_to_add.send_keys(r"C:\Users\soope\Desktop\Rockies_in_the_morning.jpg")

#time.sleep(1)
submit = browser.find_element('xpath' ,'//*[@id="record-button"]')
browser.execute_script('arguments[0].click();', submit)
WebDriverWait(browser, 800).until(expected_conditions.presence_of_element_located((By.XPATH, '/html/body/section/div/article/div/div[2]/div')))

time.sleep(1.5)
# select view records
view_records = browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div[1]/div[2]/button[1]')
browser.execute_script('arguments[0].click();', view_records)

# copy the record key
time.sleep(1.5)
key = browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div/div[3]/div/section[1]/div[1]/div[2]')
key_text = key.get_attribute('innerHTML')
key_text.split()

counter = 1

while counter < 1001:
    # paste the record key
    browser.find_element('xpath', '//*[@id="provenance-description"]').send_keys("fake record append " + str(counter))
    browser.find_element('css selector', '#container-key').send_keys(key_text[12:])

    # add picture to append
    add_another_picture = browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div/div[3]/div/section[5]/form/div[1]/div[3]/input')
    add_another_picture.send_keys(r"C:\Users\soope\Desktop\Rockies_in_the_morning.jpg")

    time.sleep(3)
    # append record
    submit_append = browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div/div[3]/div/section[5]/form/div[2]/button')
    browser.execute_script('arguments[0].click();', submit_append)

    time.sleep(7)
    #WebDriverWait(browser, 5).until(lambda browse: browser.execute_script('return document.readyState') == 'complete')

    counter += 1