import re
import csv
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support.expected_conditions import presence_of_element_located
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from datetime import datetime, timezone
from tkinter import filedialog
import sqlite3
import pymsgbox
import sys

# function to open and store cvs file through filedialog
def through_filedialog():
    file = filedialog.askopenfilename(defaultextension='.csv', filetypes=[("CSV FILES", "*.csv")])

    with open(file, "r") as csv_file:
        db = csv.DictReader(csv_file)
        to_db = []
        for i in db:
            captured_csv_time = re.sub("\\s\\(.*?\\)", "", i['Timestamp'])
            capture_utc_time = re.findall("(\\(.*?\\))", i['Timestamp'])
            csv_utc_time = capture_utc_time[0]
            csv_time_format = datetime.strptime(captured_csv_time, '%m/%d/%Y %I:%M:%S %p')
            print('csv_time_formatted: ' , csv_time_format)
            csv_time_format_string = datetime.strftime(csv_time_format, '%#m/%d/%Y %H:%M:%S')
            #print('csv_time_format_string: ', csv_time_format_string)
            i['Timestamp'] = csv_time_format_string + ' ' + csv_utc_time
            temp_dict = {'Timestamp': i['Timestamp'],
                         'Device Key': i['Device Key'],
                         'Device Name': i['Device Name'],
                         'Device Url' : i['Device Url'],
                         'Description': i['Description'],
                         'Tags': i['Tags'],
                         'Reporting Key': i['Reporting Key'],
                         'Attachment File': i['Attachment File']
                         }
            to_db.append(temp_dict)

    for info in to_db:
        #print('info: ', info)
        c.execute('INSERT INTO records (Timestamp, Device_Key, Device_Name, Device_Url, Description, Tags, Reporting_Key, Attachment_File) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', (info['Timestamp'], info['Device Key'], info['Device Name'], info['Device Url'], info['Description'], info['Tags'], info['Reporting Key'], info['Attachment File'],))
        conn.commit()

# open file through CLI
def through_cli():

    with open(sys.argv[1], 'r') as csv_file:
        db = csv.DictReader(csv_file)
        to_db = []
        for i in db:
            captured_csv_time = re.sub("\\s\\(.*?\\)", "", i['Timestamp'])
            capture_utc_time = re.findall("(\\(.*?\\))", i['Timestamp'])
            csv_utc_time = capture_utc_time[0]
            csv_time_format = datetime.strptime(captured_csv_time, '%m/%d/%Y %I:%M:%S %p')
            print('csv_time_formatted: ', csv_time_format)
            csv_time_format_string = datetime.strftime(csv_time_format, '%#m/%d/%Y %H:%M:%S')
            #print('csv_time_format_string: ', csv_time_format_string)
            i['Timestamp'] = csv_time_format_string + ' ' + csv_utc_time
            temp_dict = {'Timestamp': i['Timestamp'],
                         'Device Key': i['Device Key'],
                         'Device Name': i['Device Name'],
                         'Device Url': i['Device Url'],
                         'Description': i['Description'],
                         'Tags': i['Tags'],
                         'Reporting Key': i['Reporting Key'],
                         'Attachment File': i['Attachment File']
                         }
            to_db.append(temp_dict)

    for info in to_db:
        #print('info: ', info)
        c.execute(
            'INSERT INTO records (Timestamp, Device_Key, Device_Name, Device_Url, Description, Tags, Reporting_Key, Attachment_File) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            (info['Timestamp'], info['Device Key'], info['Device Name'], info['Device Url'], info['Description'],
             info['Tags'], info['Reporting Key'], info['Attachment File'],))
        conn.commit()

conn = sqlite3.connect('records.db')
c = conn.cursor()
c.execute("CREATE TABLE IF NOT EXISTS records (Timestamp, Device_Key, Device_Name, Device_Url, Description, Tags, Reporting_Key, Attachment_File)")

# ask user filedialog box
test = pymsgbox.confirm(text='Would you like to upload a record csv file?', buttons=['Yes', 'No'], timeout=5000)

# open file through GUI
if test == 'Yes':
    through_filedialog()

# through CLI
#through_cli()

records = conn.execute('SELECT DISTINCT Device_Key from records')
fetch_keys = records.fetchall()
print('Fetched keys: ', fetch_keys)
for stuff in fetch_keys:
    print('Working on record key: ', stuff)
    fetched_time = conn.execute('SELECT max(Timestamp) from records WHERE Device_Key=?', stuff)
    row = conn.execute('SELECT max(Timestamp), Device_Key, Device_Name, Device_Url, Description, Tags, Reporting_Key, Attachment_File from records WHERE Device_Key=?', stuff)
    fetched_data = row.fetchall()
    print('Fetched key data : ', fetched_data)
    fetched_time_data = fetched_time.fetchall()
    print('Fetched key time: ', fetched_time_data)
    capture_file_date = re.sub("\\s\\(.*?\\)", "", fetched_data[0][0])
    print('Date and time from file: ', capture_file_date)
    formatted_file_date = datetime.strptime(capture_file_date, '%m/%d/%Y %H:%M:%S')

    # run Selenium webdriver headless meaning no browser will pop up to render Javascript items on page
    options = Options()
    options.add_argument("--headless")

    print('Website: ', fetched_data[0][3])
    redstone_url = fetched_data[0][3]

    browser = webdriver.Firefox(options=options)
    browser.get(redstone_url)
    WebDriverWait(browser, 10).until(presence_of_element_located(
        (By.XPATH, '/html/body/div[1]/div/div/div/div/div/div/div/div[3]/div/section[5]/form/div[2]/button')))
    data = BeautifulSoup(browser.page_source, 'html.parser')
    browser.quit()

    # capture and parse the time and update description text from the website
    counter = 0
    newest_info = ''
    captured_texts = []
    time_strings = []
    time = []
    tags = []
    for site_item in data.find_all('div', 'report-box'):
        newest_info = site_item.text
        for item2 in site_item.children:
            if counter == 2:
                captured_time = item2.text[4:]
                # print(captured_time)
                counter += 1
            elif counter == 3:
                captured_text = item2.text
                counter += 1
            elif counter == 4:
                for tag in item2.children:
                    tags.append(tag.text)
                break
            else:
                counter += 1
        if counter == 4:
            counter = 0
            break

    captured_time2 = re.sub("G.*?\\)", "", captured_time)
    formatted_site_date = datetime.strptime(captured_time2, "%b %d %Y %H:%M:%S ")
    formatted_time_str = datetime.strftime(formatted_site_date, "%#m/%d/%Y %H:%M:%S")

    print('Date and time from website: ', formatted_site_date)
    if formatted_site_date > formatted_file_date:
        formatted_utc = datetime.strftime(formatted_site_date, '%Y-%m-%d %I:%M:%S %z')
        tags = ', '.join(tags)
        c.execute('INSERT INTO records (Timestamp, Device_Key, Device_Name, Device_Url, Description, Tags, Reporting_Key, Attachment_File) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            (formatted_time_str + ' (' + formatted_utc + ' UTC)', fetched_data[0][1], fetched_data[0][2], fetched_data[0][3], captured_text, tags,
             fetched_data[0][6], fetched_data[0][7]))
        conn.commit()
        alert_msg = pymsgbox.alert(text='RECORD KEY UPDATE ALERT!!!', button='Okay', timeout=6000)
        continue

conn.close()

