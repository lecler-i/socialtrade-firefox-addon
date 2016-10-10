// $(document).arrive(".test-elem", function() {
//     // 'this' refers to the newly created element
//     var $newElem = $(this);
// });



$(document).ready(() => {
	let cmdGetWork = $('#ctl00_ContentPlaceHolder1_cmdGetWork');
	window.console.error(cmdGetWork);
 	if (cmdGetWork){
		cmdGetWork.click();
	}
});

let blacklist = [];
self.port.on('blacklist-update', (data) => {
	blacklist = data;
	console.error('Blacklist updated !', blacklist);
});

let fsm = new Stately.machine({
    'LOAD': {
    	execute: function () {
   			this.currentTask = null;
   			return this.PICK_TASK;
    	}
    },
    'PICK_TASK': {
    	execute: function () {
			let done = this.rows.every((elt, idx) => {
    			let status = $(elt.cells[2]).find('b').text();
				if (status === 'Pending' && idx != this.currentTask && !blacklist.includes(idx)){
					//self.port.emit('task-in-progress', idx);
					this.currentTask = idx;
					return false;
				}
				return true;
    		});
			return done ? this.FINISH_ALL : this.CLICK_TASK;
    	}
    },
    'CLICK_TASK':{
    	execute: function (arg) {
    		let action = $($(this.rows[this.currentTask].cells[3]).find('span')[0]);
			if (action) 
				return [this.CLICK_NORMAL_TASK, action];
			//self.port.emit('task-blacklist', this.currentTask);
            $(this.rows[this.currentTask]).css('background-color', '#e51c23aa');
			return this.PICK_TASK;
    	}
    },
    'CLICK_NORMAL_TASK':{
    	execute: function (action) {
            $(this.rows[this.currentTask]).css('background-color', '#5677fcaa');
    		action.click();
			return this.WAIT_TASK_FINISH;
    	}
    },
    'WAIT_TASK_FINISH':{
    	execute: function (arg) {
    		let status = $(this.rows[this.currentTask].cells[2]).children('span').text();
    		console.error(status, this.currentTask);
    		if (status === 'clicked')
				return this.TASK_FINISH;
			return this.WAIT_TASK_FINISH;
		}
    },
    'TASK_FINISH':{
    	execute: function (arg) {
            $(this.rows[this.currentTask]).css('background-color', '#259b24aa');
    		self.port.emit('task-finish', this.currentTask);
    		return this.PICK_TASK;
		}
    },
    'FINISH_ALL':{
    	execute: function (arg) {
    		//$('#ctl00_ContentPlaceHolder1_cmdSubmit').click();
    		//self.port.emit('finish-all');    		
		}
    },

}).bind(function(event, oldState, newState) {
	this.rows = $('#dvCustomers > tr').toArray();
    //console.error(event, oldState, newState);
});



let data = null;
setTimeout(function loopsyloop() {
	let PanelAssignMEnt = $('#dvCustomers > tr');
    if (PanelAssignMEnt)
    	data = fsm.execute(data);
    setTimeout(loopsyloop, 500);
}, 3000);