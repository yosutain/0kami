import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.webHome.events({
	'scroll': function(event) {
		let webHeader: HTMLElement = document.getElementById("webHeader");
		if (event.target.scrollTop === 0) {
			if (webHeader.classList.contains("popOutWebHeader")) {
				webHeader.classList.remove("popOutWebHeader");
			}
		} else {
			if (!webHeader.classList.contains("popOutWebHeader")) {
				webHeader.classList.add("popOutWebHeader");
			}
		}

		let sections: any = document.getElementById("webInnerContainer").children;
		let sectionScroll: number = 0;
		for (var i = 0; i < sections.length; ++i) {
			sectionScroll += sections[i].offsetHeight;
			if (event.target.scrollTop <= sectionScroll) {
				if (sections[i].classList.contains("activeScrollIndicator")) {
				} else {
					document.getElementsByClassName("activeScrollIndicator")[0].classList.remove("activeScrollIndicator");
					document.getElementsByClassName("scrollIndicator")[i].classList.add("activeScrollIndicator");
				}
				return;
			} 
		}
		
	}
});

Template.webSection02.onRendered(function () {
	let img: HTMLImageElement = new Image();
	img.onload = function() {
		let placeholder: HTMLElement = document.getElementById("webSection02Placeholder");
		placeholder.style.opacity = "0";
		let parent: HTMLElement = document.getElementById("webSection02");
		Meteor.setTimeout(function(){
			parent.removeChild(placeholder);
		}, 20000); 
	}
	img.src = "/img/ss1.png";  
});

Template.webSection03.onRendered(function () {
	let img: HTMLImageElement = new Image();
	img.onload = function() {
		let placeholder: HTMLElement  = document.getElementById("webSection03Placeholder");
		placeholder.style.opacity = "0";
		let parent: HTMLElement  = document.getElementById("webSection03");
		Meteor.setTimeout(function(){
			parent.removeChild(placeholder);
		}, 20000); 
	}
	img.src = "/img/ss2.png";  
});

Template.webSection04.onRendered(function () {
	let img: HTMLImageElement = new Image();
	img.onload = function() {
		let placeholder: HTMLElement  = document.getElementById("webSection04Placeholder");
		placeholder.style.opacity = "0";
		let parent: HTMLElement  = document.getElementById("webSection04");
		Meteor.setTimeout(function(){
			parent.removeChild(placeholder);
		}, 20000); 
	}
	img.src = "/img/ss3.png";  
});