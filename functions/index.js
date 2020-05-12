'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');

exports.dialogflowWebhook = functions
    .region('europe-west2')
    .https.onRequest(async (request, response) => {
    const agent = new WebhookClient({ request, response });

    const result = request.body.queryResult;

    // START OF FUNCTIONS LIST
    
    async function defaultWelcome(agent) {
        agent.add(`Righto. I will tell Lyd to piss off for a quick 30`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
      }

      function pissoff(agent) {
        agent.add(`Piss off you twat`);
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
    intentMap.set('Does this even work', pissoff);
    
    
    agent.handleRequest(intentMap);
});