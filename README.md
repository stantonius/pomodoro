# Productivity Pal

**Objective**: use GCP, Firebase, Google Assistant, and Raspberry Pi to create moments of **deep work**

## Build notes (to be moved once live)

### Setup and tools
* Dialogflow uses Firebase functions as backend
* Firebase firestore used to store session data
    * TODO: move firestore to BigQuery for analytics
* GCP PubSub currently configured using GUI
* GCP Scheduler currently configured using GUI
    * TODO: create dynamic Scheduler using [node API](https://googleapis.dev/nodejs/scheduler/latest/) to save cost and constant running.
    * You could also create the Scheduler to run only when the time expires, instead of every minute to check (this would also reduce Firebase calls as well)

### Technical notes
* All times (function MomentJS library) and PubSub metadata use GMT (which is an hour off in BST)

