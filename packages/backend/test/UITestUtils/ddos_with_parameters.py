import time
import sys
from selenium import webdriver
from selenium.webdriver import DesiredCapabilities, FirefoxProfile
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC, expected_conditions
from requests_ip_rotator import ApiGateway, EXTRA_REGIONS
from selenium.webdriver.firefox.options import Options
from multiprocessing import Process

"""Run file on command line with first argument = # of requests, second argument = # of bots, third optional argument = ip switch on"""

"""e.g. When in the terminal, go to the directory containing python file, type in: python dos_dev_gosqas_with_parameters.py 5 5 on"""
"""This will run python bot script with 5 requests total, 5 bots, and IP switch on"""
"""Third argument can be blank and the script will run in single IP mode"""

browser2 = ApiGateway(site="https://dev.gosqas.org/",
                      access_key_id='',
                      access_key_secret='')

if len(sys.argv) == 4:
    browser2.start()
else:
    pass

def make_fake_records(count):
    counter = 0
    while counter < int(sys.argv[1]):
        # run headless browser so browser doesn't pop up
        options = Options()
        options.add_argument("--headless")

        """This will run with the browser displayed, comment out to run headless"""
        #browser = webdriver.Firefox()

        """This will run the browser 'headless', meaning browser will pop up"""
        browser = webdriver.Firefox(options)

        """Navigate to website and click on Create Record"""
        browser.get("https://dev.gosqas.org/")
        #time.sleep(2)
        WebDriverWait(browser, 600).until(expected_conditions.presence_of_element_located(
            (By.XPATH, "//*[@id='homeCreateButton']")))
        create_new_record = browser.find_element('xpath', "//*[@id='homeCreateButton']")
        browser.execute_script('arguments[0].click();', create_new_record)

        """Fill in fake name and description"""
        time.sleep(1)
        #WebDriverWait(browser, 800).until(expected_conditions.presence_of_element_located(
        #    (By.CSS_SELECTOR, '#create_record > form:nth-child(1) > div:nth-child(2) > input:nth-child(2)')))
        browser.find_element('css selector', '#record-form > div:nth-child(2) > input:nth-child(1)').send_keys('Hieu ' + str(counter))
        browser.find_element('css selector', '#record-description').send_keys("Hieu's dos fake record test with picture #" + str(counter))

        #add picture (optional, uncomment to enable)
        #browse_files_to_add = browser.find_element('xpath', '/html/body/div[1]/div/div/div/div/div/div[2]/form/div[1]/div[1]/input')
        # place directory of picture to upload here
        #browse_files_to_add.send_keys(r"C:\Users\soope\Desktop\Rockies_in_the_morning.jpg")

        """Submit the record and close the browser"""
        submit = browser.find_element('xpath' ,'//*[@id="record-button"]')
        browser.execute_script('arguments[0].click();', submit)
        WebDriverWait(browser, 600).until(expected_conditions.presence_of_element_located((By.XPATH, '/html/body/section/div/article/div/div[2]/div')))
        print('Fake record #' + str(counter) + ' created from Bot #:' + str(count))
        time.sleep(1)
        browser.close()
        counter += 1

if __name__ == '__main__':
    processes = [Process(target=make_fake_records, args=(i,), daemon=True) for i in range(0, int(sys.argv[2]))]
    for process in processes:
        process.start()
    for process in processes:
        process.join()