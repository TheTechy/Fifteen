chrome.alarms.onAlarm.addListener((alarm) => {
  // Check if the alarm that fired is one of our task timers
  if (alarm.name.startsWith('timer-')) {

    // 1. Fetch the objectives to find the task name
    chrome.storage.sync.get(['objectives'], (result) => {
      const objectives = result.objectives || [];
      const taskId = alarm.name.replace('timer-', '');
      const task = objectives.find(obj => obj.id == taskId);
      const taskName = task ? task.text : "A micro-objective";

      // 2. Create the notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png', // Ensure this exists in your icons folder
        title: "Time is up!",
        message: `Time has expired for: ${taskName}`,
        priority: 2,
        requireInteraction: true // Keeps the notification visible until user closes it
      });
    });
  }
});