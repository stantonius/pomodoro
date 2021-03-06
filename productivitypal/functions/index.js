"use strict";
// Dialogflow & Firebase imports
const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const admin = require("firebase-admin");
const serviceAccount = require("./pomodoro_service_account_credentials.json");

// Additional libraries
const moment = require("moment");
const Trello = require("trello")

// Firestore setup and initialisation
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pomodoro-90fd7.firebaseio.com",
});
const db = admin.firestore();

// Trello setup and initialisation
const trelloCreds = require('./trelloCreds.json')
var trello = new Trello(trelloCreds.appKey, trelloCreds.userToken);

// MAIN WEBHOOK LISTENING FUNCTION

exports.dialogflowWebhookResponse = functions.https.onRequest(
  async (request, response) => {
    const agent = new WebhookClient({ request, response });

    const result = request.body.queryResult;

    // START OF FUNCTIONS LIST

    // Generic functions
    async function defaultWelcome(agent) {
      agent.add(`Yo. I am your productivity pal. What can I help with?`);
    }

    function fallback(agent) {
      agent.add(
        `I didn't get that. Try again or say 'Help' for other things I can help with.`
      );
    }

    //Productivity functions
    async function pomodoroInitiate(agent) {
      // Initial entry to pomodoro. Check that worktype is provided.
      let [duration, workType] = [
        agent.parameters["duration"],
        agent.parameters["workType"],
      ];
      // Capture any require entities (as slots)
      let missingSlots = [];
      if (!duration) {
        duration = "30 minutes";
      }
      if (!workType) {
        missingSlots.push("work type");
      }

      if (missingSlots.length === 1) {
        agent.add(`What ${missingSlots[0]} is this for - work or personal?`);
      } else {
        let [len, unit] = duration.split(" ");
        let startTime = moment().format();
        let endTime = moment(startTime).add(len, unit).format();
        // If all required parameters/slots provided, upload this info to firebase
        let data = {
          startTime: startTime,
          duration: len,
          endTime: endTime,
          workType: workType,
          active: true,
        };
        db.collection("sessions").add(data);
        agent.add(
          `Righto. Lets start a ${workType} pomodoro for ${duration}. Starting the timer...now.`
        );
      }
    }

    // Trello productivity 

    async function projectsList(agent) {
      const mainBoard = '5ec072eda01167532fd6dadf'
      const trelloLists = await trello.getListsOnBoard(mainBoard)
      let listItems = trelloLists.map(list => list.name).join(', ')
      agent.add(
        `You current projects are: ${listItems}`
      )
    }

    async function cardsListForProject(agent) {
      const projectName = agent.parameters['project']
      const mainBoard = '5ec072eda01167532fd6dadf'
      if (projectName) {
        const trelloLists = await trello.getListsOnBoard(mainBoard)
        const projectID = trelloLists.filter(pro => pro.name === projectName)[0].id
        const cardsOnList = await trello.getCardsOnList(projectID)
        const cards = cardsOnList.map(card => card.name).join(', ')
        agent.add(
          `These are the In Progress tasks for ${projectName}: ${cards}`
        )
      } else {
        agent.add(
          "There is no project by that name. Say 'Create Project' to create one."
        )
      }

      const trelloLists = await trello.getListsOnBoard(mainBoard)
      let listItems = trelloLists.map(list => list.name).join(', ')
      agent.add(
        `You current projects are: ${listItems}`
      )
    }

    // MAP ALL WEBHOOKS BELOW
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", defaultWelcome);
    intentMap.set("Default Fallback Intent", fallback);
    intentMap.set("Start a Pomodoro", pomodoroInitiate);
    intentMap.set("Trello - Projects - List All", projectsList)
    intentMap.set("Trello - Project - All Cards", cardsListForProject)

    agent.handleRequest(intentMap);
  }
);
