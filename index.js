var pageMod = require("sdk/page-mod");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");


//const Stately = require('stately.js');
var button = buttons.ActionButton({
  id: "social-bot-link",
  label: "Visit Mozilla",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleClick
});

var tasksBlacklist = [];
var tasksDone = [];
var tasksInProgress = [];
var tabWorkers = [];

function emitBlacklistUpdate(taskId){
	tabWorkers.forEach((w) => { w.port.emit('blacklist-update', [].concat(tasksBlacklist, tasksDone, tasksInProgress)); });
	//tabWorkers.forEach((w) => { w.port.emit('blacklist-update', taskId );});
}

function handleClick(state) {
	let tab = tabs.open({
  		url: 'https://www.socialtrade.biz/User/TodayTask.aspx',
	  	onReady: (tab) => {
	  		var worker = tab.attach({
				contentScriptFile: ["./libs/jquery/jquery.js", "./libs/arrive/arrive.js", "./libs/Stately.js/Stately.js", "./script.js", './style.css'],
			    contentScriptWhen: 'end',
			});
			tabWorkers.push(worker);
			worker.port.emit('blacklist-update', [].concat(tasksBlacklist, tasksDone, tasksInProgress));
			worker.port.on('task-finish', (taskId) => {
				console.log('Receive : ', 'task-finish', taskId);
				tasksInProgress = tasksInProgress.filter((e) => e != taskId);
	      		tasksDone.push(taskId);
	      		emitBlacklistUpdate(taskId);
	    	});
	    	worker.port.on('task-blacklist', (taskId) => {
	      		tasksBlacklist.push(taskId);
	      		emitBlacklistUpdate(taskId);
	    	});
	    	worker.port.on('task-in-progress', (taskId) => {
				console.log('Receive : ', 'task-finish', taskId);
	      		tasksInProgress.push(taskId);
	      		emitBlacklistUpdate(taskId);
	    	});
	    	worker.port.on('finish-all', () => {
	    		tab.close();
	    	});
	    }
	});
}





// self.port.on("myAddonMessage", function(myAddonMessagePayload) {
//   // Handle the message
// });

// pageMod.PageMod({
//   include: "*.biz",
//   contentScriptFile: [require.resolve("stately"), "./script.js"]
// });

