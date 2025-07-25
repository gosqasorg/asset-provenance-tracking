import time
from selenium import webdriver
from selenium.webdriver import DesiredCapabilities, FirefoxProfile
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC, expected_conditions
from requests_ip_rotator import ApiGateway, EXTRA_REGIONS
from selenium.webdriver.firefox.options import Options
from multiprocessing import Process


def make_fake_records(count):
    counter = 1
    while counter < 100:
        # run headless browser so browser doesn't pop up
        options = Options()
        options.add_argument("--headless")

        # disable the geo location prompt upon browser startup
        #geoDisabled = webdriver.FirefoxOptions()
        #geoDisabled.set_preference("geo.enabled", False)

        """This runs with browser popping up, comment out to run headless"""
        browser = webdriver.Firefox(options=options)

        """ Uncomment the # in front of browser to run 'headless', meaning no browser will pop up"""
        #browser = webdriver.Firefox(options=options)

        # create a new record
        #count = 1
        #while count < 1001:
        browser.get("https://blue-stone-05ede120f.5.azurestaticapps.net/")
        #time.sleep(2)
        WebDriverWait(browser, 800).until(expected_conditions.presence_of_element_located(
            (By.XPATH, "//*[@id='homeCreateButton']")))
        create_new_record = browser.find_element('xpath', "//*[@id='homeCreateButton']")
        browser.execute_script('arguments[0].click();', create_new_record)

        #time.sleep(1)
        WebDriverWait(browser, 800).until(expected_conditions.presence_of_element_located(
            (By.CSS_SELECTOR, '#create_record > form:nth-child(1) > div:nth-child(2) > input:nth-child(2)')))
        browser.find_element('css selector', '#create_record > form:nth-child(1) > div:nth-child(2) > input:nth-child(1)').send_keys('Hieu ' + str(counter))
        browser.find_element('css selector', '#create_record > form:nth-child(1) > div:nth-child(2) > input:nth-child(2)').send_keys("Hieu's dos fake record test with picture #" + str(counter))

        #add picture
        #browse_files_to_add = browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div[2]/form/div[1]/div[1]/input')
        # place directory of picture to upload here
        #browse_files_to_add.send_keys(r"C:\Users\soope\Desktop\Rockies_in_the_morning.jpg")

        #time.sleep(1)
        submit = browser.find_element('xpath' ,'//*[@id="record-button"]')
        browser.execute_script('arguments[0].click();', submit)
        WebDriverWait(browser, 1500).until(expected_conditions.presence_of_element_located((By.XPATH, '/html/body/section/div/article/div/div[2]/div')))
        print('Fake record #' + str(counter) + ' created from Bot #:' + str(count))
        browser.close()
        counter += 1

if __name__ == '__main__':
    processes = [Process(target=make_fake_records, args=(i,), daemon=True) for i in range(0, 20)]
    for process in processes:
       process.start()
    for process in processes:
        process.join()