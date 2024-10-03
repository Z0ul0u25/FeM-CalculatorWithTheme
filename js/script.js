"use strict";

/* HTML Elements */
let body = null;
let display = null;

/* Variables */
let result = 0;
let operationToDo = null;
let lastInputType = null;
let lastNumber = null;
let needReset = false;

/* Constants */
const THEMES = ['light', 'dark', 'other'];

/* Enum */
const InputType = {
	Number: 'Number',
	Operator: 'Operator',
	Equal: 'Equal',
	System: 'System'
};

/**
 * Set the theme
 * @param {String} themeName nome of the theme
 */
function setTheme(themeName) {
	if (!body.classList.contains('themeName')) {
		localStorage.setItem('theme', themeName);
		THEMES.forEach($theme => {
			body.classList.remove($theme);
		});
		body.classList.add(themeName);
	}
}

/**
 * Update what appear on the display
 * @param {Number} nb number to display
 * @param {Boolean} isToClean To clear the display or not
 */
function displayUpdate(nb, isToClean) {
	if (isToClean) {
		display.innerHTML = "0";
	}

	if (display.innerHTML == "0" && nb != ".") {
		display.innerHTML = "";
	}

	if (!(display.innerHTML.length > 10)) {
		display.innerHTML += (nb != "") ? nb : "0";
	}
}

/**
 * Reset variables
 */
function resetMemory() {
	result = 0;
	operationToDo = null;
	lastInputType = null;
	lastNumber = null;
	needReset = false;
	displayUpdate(0, true);
}

/**
 * Compute answer
 * @param {String} opperation operation to do
 * @returns value to display
 */
function compute(opperation) {
	switch (opperation) {
		case "+":
			result += lastNumber;
			break;
		case "-":
			result -= lastNumber;
			break;
		case "x":
			result *= lastNumber;
			break;
		case "÷":
			if (lastNumber == 0) {
				needReset = true;
				return "Error Div by 0";
			}
			result /= lastNumber;
			break;
		default:
			break;
	}

	if (result > 0) {
		if (Math.ceil(Math.log10(result)) > 11) {
			needReset = true;
			return "Too Big!";
		}
	}

	if (result.toString().length > 11) {
		let toKeep = 11 - Math.floor(result).toString().length;
		if (toKeep > 0) {
			return result.toFixed(toKeep);
		} else {
			needReset = true;
			return (result < 0) ? "Too Small" : "Too Big!";
		}
	}

	if (result < 0.000000001 && result > -0.000000001) {
		result = 0;
	}

	return result;
}

/**
 * Evaluate the input to do the required funciton
 * @param {Event} e event trigger
 */
function inputProcessing(e) {
	let input = e.currentTarget.children[0].innerHTML;
	if (!needReset) {
		if (!isNaN(input) || input == ".") {
			displayUpdate(input, (lastInputType == InputType.Operator));
			lastNumber = Number(display.innerHTML);
			lastInputType = InputType.Number;
		} else if (input.length == 1) {
			if (operationToDo == null) {
				result = Number(display.innerHTML);
			} else if (lastInputType == InputType.Operator || input == "=") {
				displayUpdate(compute(operationToDo), true);
			}

			if (input != "=") {
				operationToDo = input;
				lastInputType = InputType.Operator;
			} else {
				lastInputType = InputType.Equal;
			}

		} else if (input == "DEL") {
			result = String(display.innerHTML.slice(0, -1));
			displayUpdate(result, true);

			lastInputType = InputType.System;
		}
	}

	if (input == "RESET") {
		resetMemory();
		lastInputType = InputType.System;
	}

	//	DEBUG
	console.log("result:", result, "| operationToDo:", operationToDo, "| input", input, "| lastInputType:", lastInputType, "| lastNumber:", lastNumber);
}

/**
 * Initialise stuff
 */
function init() {

	body = document.getElementsByTagName('body')[0];
	display = document.getElementById('screen');

	for (const div of document.getElementsByClassName('themeSwitch')) {
		div.addEventListener('click', function (e) {
			setTheme(e.currentTarget.id);
		}, false);
	}

	for (const elem of document.getElementsByTagName('button')) {
		elem.addEventListener('click', inputProcessing, false);
	}

	if (localStorage.getItem('theme')) {
		setTheme(localStorage.getItem('theme'));
	} else {
		setTheme(window.matchMedia("(prefers-color-scheme: dark)") ? "dark" : "light");
	}

	// Prevent transition on page load
	window.setTimeout(function () { body.classList.remove('preload'); }, 1);
}

window.addEventListener('DOMContentLoaded', init, false);