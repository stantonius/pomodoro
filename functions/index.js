'use strict';
// Dialogflow & Firebase imports 
const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const admin = require("firebase-admin");
const serviceAccount = require("./pomodoro_service_account_credentials.json");

// Additional libraries
const moment = require('moment');

// Firestore setup and initialisation
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pomodoro-90fd7.firebaseio.com"
});
const db = admin.firestore();
//const tasks = db.collection('users').doc('jeffd23');

exports.dialogflowWebhookResponse = functions
    .https.onRequest(async (request, response) => {
    const agent = new WebhookClient({ request, response });

    const result = request.body.queryResult;

    // START OF FUNCTIONS LIST
    
    // Generic functions
    async function defaultWelcome(agent) {
        agent.add(`Yo. I am your productivity pal. What can I help with?`);
    }

    function fallback(agent) {
        agent.add(`I didn't get that. Try again or say 'Help' for other things I can help with.`);
      }

    //Productivity functions
      function pomodoroInitiate(agent) {
        // Initial entry to pomodoro. Check that worktype is provided.
        let [duration, workType] = [agent.parameters['duration'], agent.parameters['workType']]
        // Capture any require entities (as slots)
        let missingSlots = []
        if (!duration) {duration = 30}
        if (!workType) {missingSlots.push('work type')}

        if (missingSlots.length ===1 ) {
          agent.add(`What ${missingSlots[0]} is this for - work or personal?`)
        } else {
          // If all required parameters/slots provided, upload this info to 
          
          agent.add(`Righto. Lets start a ${workType} pomodoro for ${duration}. Starting the timer...now.`);
        }
      }
    
/*
    async function userOnboardingHandler(agent) {

     // Do backend stuff here
     const db = admin.firestore();
     const profile = db.collection('users').doc('jeffd23');

     const { name, color } = result.parameters;

      await profile.set({ name, color })
      agent.add(`Welcome aboard my friend!`);
    }
*/
    // MAP ALL WEBHOOKS BELOW
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', defaultWelcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Start a Pomodoro', pomodoroInitiate);
    
    
    agent.handleRequest(intentMap);
});