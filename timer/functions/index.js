/**
 * Triggered by PubSub topic
 */


const functions = require('firebase-functions');

exports.pomodoroTimer = functions.pubsub.topic('pomodoro-timer').onPublish((message, context) => {
    const messageBody = message.data ? Buffer.from(message.data, 'base64').toString() : null;
    console.log('The function was triggered at ', context.timestamp)
    console.log(messageBody)
    // Retrieve any active sessions
    
})
