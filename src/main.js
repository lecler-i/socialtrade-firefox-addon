import Stately from 'stately.js';
import $ from "jquery";

$.noConflict();
window.$ = $;

import 'jquery-toggles';
import 'jquery-toggles/css/toggles-full.css';

// alert('hello');

$(document).ready(() => {
	let cmdGetWork = $('#ctl00_ContentPlaceHolder1_cmdGetWork');
	console.log(cmdGetWork);
 	if (cmdGetWork){
		cmdGetWork.click();
	}
});

const DIV_SELECTOR = ".home-title > h1";


$(DIV_SELECTOR).html('<div class="toggles toggle-light"></div>');
$(".army_text").html('I LOVE MAMTA AND PREM');

$('.toggles').toggles({
  on: false
});
var myToggle = $('.toggles').data('toggles');

let fsm = new Stately.machine({
    'LOAD': {
    	execute: function () {
   			this.currentTask = null;
   			return this.PICK_TASK;
    	}
    },
    'PICK_TASK': {
    	execute: function () {
 			this.currentTask = $('span[onclick^="update"]').parents('tr').index();
    		if (this.currentTask === -1) {
    			return this.FINISH_ALL;
    		}
    		return this.CLICK_TASK;
    	}
    },
    'CLICK_TASK':{
    	execute: function (arg) {
    		let action = $(this.rows[this.currentTask]).find('span[onclick^="update"]');
    		if (action) {
    			$(this.rows[this.currentTask]).css('background-color', '#5677fc');
	    		action.click();
    			this.clickTime = $.now() / 1000;	
				return this.WAIT_TASK_FINISH;
    		}
            $(this.rows[this.currentTask]).css('background-color', '#e51c23');
			return this.PICK_TASK;
    	}
    },
    'REFRESH_CURRENT_TASK':{
    	execute: function () {
			let refreshAction = $(this.rows[this.currentTask]).find('span[onclick^="refresh"]');
			if (refreshAction) 
            	refreshAction.click();
    		this.clickTime = $.now() / 1000;
			return this.CLICK_TASK;
    	}
    },
    'WAIT_TASK_FINISH':{
    	execute: function (arg) {
    		let status = $(this.rows[this.currentTask].cells[2]).children('span').text();
    		if (status === 'clicked')
				return this.TASK_FINISH;
			const now = $.now() / 1000;
			if (now - this.clickTime >= 45) {
				return this.REFRESH_CURRENT_TASK;
			}
			return this.WAIT_TASK_FINISH;
		}
    },
    'TASK_FINISH':{
    	execute: function (arg) {
            $(this.rows[this.currentTask]).css('background-color', '#259b24');
    		//self.port.emit('task-finish', this.currentTask);
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
	this.rows = $('#dvCustomers').children().toArray();
});

let data = null;
setTimeout(function loopsyloop() {
	let PanelAssignMEnt = $('#dvCustomers > tr');
    if (PanelAssignMEnt && myToggle.active)
    	data = fsm.execute(data);
    setTimeout(loopsyloop, 500);
}, 3000);