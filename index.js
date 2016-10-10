var pageMod = require("sdk/page-mod");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");

var button = buttons.ActionButton({
  id: "social-bot-link",
  label: "LOL Launch Social-Trade-Bot",
  icon: "./icon.svg",
  badge: 0,
  badgeColor: "#00AAAA",
  onClick: handleClick
});

var tasksBlacklist = [];
var tasksDone = [];
var tasksInProgress = [];
var tabWorkers = [];

function emitBlacklistUpdate(taskId){
	tabWorkers.forEach((w) => { w.port.emit('blacklist-update', [].concat(tasksBlacklist, tasksDone, tasksInProgress)); });
}

function handleClick(state) {
	let tab = tabs.open({
  		url: 'https://www.socialtrade.biz/User/TodayTask.aspx',
	  	onReady: (tab) => {
	  		var worker = tab.attach({
				contentScriptFile: ["./libs/jquery/jquery.js", "./libs/arrive/arrive.js", "./libs/Stately.js/Stately.js", "./script.js"],
			    contentScriptWhen: 'end',
			});
			tabWorkers.push(worker);
			//worker.port.emit('blacklist-update', [].concat(tasksBlacklist, tasksDone, tasksInProgress));
			worker.port.on('task-finish', (taskId) => {
				tasksInProgress = tasksInProgress.filter((e) => e != taskId);
	      		tasksDone.push(taskId);
	      		emitBlacklistUpdate(taskId);
	      		button.badge++;
	    	});
	    	worker.port.on('finish-all', () => {
	    		tab.close();
	    	});
	    }
	});
}