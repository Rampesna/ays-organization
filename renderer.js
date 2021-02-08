const { Notification } = require('electron')

function showNotification () {
    const notification = {
        title: 'Basic Notification',
        body: 'Notification from the Main process'
    }
    new Notification(notification).show()
}

showNotification();