// 
function processNotification() {
    function pingDatabase(notificationData: any) {
        // if there is a hit at the database for this key, get the emails and send email.
    }
    
    // Getting the notification data from the Vue frontend
    const express = require('express');
    const bodyParser = require('body-parser');

    const app = express();
    const port = 3000;

    app.use(bodyParser.json());

    app.post('/tag-notification', (req, res) => {
        const { tags, deviceKey } = req.body;

        for (let tag of tags) {
            pingDatabase(tag + deviceKey); // TODO: shoudld I type cast to ensure they are strings?? 
        }
        //Responce to frontend
        res.send('Message received!');
    });

    app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    });
}
