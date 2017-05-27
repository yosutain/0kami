import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Projects, Emails, EmailElements } from '../../../imports/pubsub';
import { Project, Email, EmailElement } from '../../../imports/interfaces';
import { Global } from '../../../imports/client/global';
import { Template } from 'meteor/templating';

Session.set("currentProject", "none");
Session.set("elementPosition", "none");
Session.set("elementType", "none");
Session.set("beingAdded", "none");
Session.set("dragInProgress", "none");

declare var InstallTrigger: any;
declare var unescape: any;

Template.openProject2.helpers({
	project () {
		return Projects.findOne({id: FlowRouter.getParam("currentProject")});
	},

	accessible () {
		const project: Project = Projects.findOne({id: FlowRouter.getParam("currentProject")}) as Project;
		if (project.owner == Meteor.user()._id) {
			return true;
		}
		return false;
	},
});

Template.emailEditor.helpers({
	emailElement () {
		return EmailElements.find({}, {sort: {position: 1}}).fetch();
	},
});

Template.emailEditor.events({
	'click div'(event, instance) {
		var myButton = event.currentTarget;
		if (myButton.id == "addElementAtTop"){
			Session.set("elementId", 0);

			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "addElementPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});  
		}
	},

	'mouseover div'(event) {
		if (event.target.id.indexOf("emailEditorElement") !== -1) {
			let elementNumber = event.target.id.split("emailEditorElement")[1];
			let affected = document.getElementById("emailPreviewElement" + elementNumber);
			if (affected.className.indexOf("affectedPreviewElement") !== -1) {
				return;
			} else {
				affected.className += " affectedPreviewElement";
			}
		}
	},

	'mouseout div'(event) {
		if (event.target.id.indexOf("emailEditorElement") !== -1) {
			let elementNumber = event.target.id.split("emailEditorElement")[1];
			let affected = document.getElementById("emailPreviewElement" + elementNumber);
			if (affected.className.indexOf("affectedPreviewElement") !== -1) {
				affected.className = affected.className.split(" affectedPreviewElement")[0];
			} 
		}
	},
});


Template.emailEditorElement.events({
	'click div'(event, instance) {
		var myButton = event.currentTarget;
		
		if (myButton.className == "addEmailEditorElement"){
			const elementId = myButton.getAttribute("elementId");
			Session.set("elementId", elementId);

			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "addElementPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});  
		} else if (event.target.id.indexOf("emailEditorElement") !== -1) {
			const elementId = myButton.getAttribute("elementId");
			Session.set("elementId", elementId);

			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "editEmailElementPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});  
		} 
	},

	'dragstart': function(event, instance) {
		const dragStart = function() {
			event.dataTransfer = event.originalEvent.dataTransfer;	

			let dragImage = event.target.cloneNode(true);
			dragImage.style.position = "absolute"; 
			dragImage.style.top = "-100vh"; 
			dragImage.style.left = "-100vw";
			dragImage.style.textAlign = "center";
			dragImage.id = "temporaryDragImage";
			document.body.appendChild(dragImage);

			event.dataTransfer.setData("elementId", event.target.getAttribute("elementId"));
			event.dataTransfer.setDragImage(dragImage, 0, 0);
			
			Session.set("elementId", event.target.getAttribute("elementId"));
			event.target.className += " elementBeingDragged";
		}
		
		const isFirefox = typeof InstallTrigger !== 'undefined';
		if (isFirefox) {
			dragStart();
		} else {
			Meteor.setTimeout(function(){	
				dragStart();
			}, 0);
		}
	},

	'dragenter': function(event) {
		event.preventDefault();
		event.target.className += " dragToElement";
	},

	'dragover': function(event) {
		event.preventDefault();
	},

	'dragleave': function(event) {
		event.preventDefault();
		event.target.className = event.target.className.split(" dragToElement")[0];
	},

	'dragend': function(event) {
		event.preventDefault();
		event.target.className = event.target.className.split(" elementBeingDragged")[0];
		document.getElementsByTagName("body")[0].removeChild(document.getElementById("temporaryDragImage"));
	},

	'drop': function(event) {
		event.preventDefault();
		event.target.className = event.target.className.split(" dragToElement")[0];

		const targetElement = event.target.getAttribute("elementId");
		if (!targetElement) {
			return
		} 

		let draggedElement = document.getElementsByClassName("elementBeingDragged")[0]
		if (draggedElement) {
		draggedElement.className = draggedElement.className.split(" elementBeingDragged")[0];
		}

		const fromElement: EmailElement = EmailElements.findOne({_id: Session.get("elementId")}) as EmailElement;
		const toElement: EmailElement = EmailElements.findOne({_id: targetElement}) as EmailElement;
		const fromPos: number = fromElement.position;
		const toPos: number = toElement.position;

		EmailElements.update(fromElement._id, {
			$set: {
			    position: toPos,
			},
		});
		EmailElements.update(toElement._id, {
			$set: {
			    position: fromPos,
			},
		});
	},
});

Template.addElementPopup.events({
	'submit form': function(event) {
		event.preventDefault();
		const emailElementType = event.target.emailElementType.value;
		const elementId = Session.get("elementId");

		if (event.target.emailElementType.value) {
			let position;
			if (elementId == 0) {
				const elementAfter: EmailElement = 	EmailElements.findOne({}, {sort: {position: 1}}) as EmailElement;
				const posAfter = elementAfter.position;
				position = posAfter / 2;
			} else {
				const elementBefore: EmailElement = EmailElements.findOne({_id: elementId}) as EmailElement;
				const posBefore = elementBefore.position;

				const elementAfter: EmailElement = 	EmailElements.findOne({position: {"$gt": posBefore}},{sort: {position: 1}}) as EmailElement;
				if (elementAfter) {
					const posAfter = elementAfter.position;
					position = posAfter - ((posAfter - posBefore) / 2);
				} else {
					position = posBefore + 100;
				}
			}

			const element: EmailElement = {
				project: FlowRouter.getParam("currentProject"),
				position: position,
			    type: emailElementType,
			    color: 1,
			    font: "Georgia, serif",
			    amount: 1,
			    height: 200,
			    width: 650,
			    spacerTop: 0,
			    spacerBottom: 0,
			    urls: ["", "", ""],
			    texts: ["", "", "", "", "", ""],
			};
			EmailElements.insert(element);
			
			Global.closeAllPopups();
		};
	}
});

Template.deleteEmailElement.events({
	'click div'(event, instance) {
		if (event.target.innerHTML == "Remove Element") {
			event.target.innerHTML = "Remove Forever?";
			event.target.className = "confirmDeleteEmailElement";
			
			Meteor.setTimeout(function(){
				event.target.innerHTML = "Remove Element";
				event.target.className = "";
			}, 2000);
		} else if (event.target.innerHTML == "Remove Forever?") {
			const element: EmailElement = EmailElements.findOne({_id: Session.get("elementId")}) as EmailElement;
			EmailElements.remove(element._id);
			Global.closeAllPopups();
		}
	},
});

Template.registerHelper('A_is_B', (a, b) => {
	if (a == b) {
		return true;
	} else {
		return false;
	}
});

Template.editEmailElementPopup.helpers({
	element () {
		return EmailElements.findOne({_id: Session.get("elementId")});
	},
});

Template.editEmailElementPopup.onRendered(function () {
	const emailElement: EmailElement = EmailElements.findOne({_id: Session.get("elementId")}) as EmailElement;
 	const color 		= emailElement.color;
    const font 			= emailElement.font;
    const amount 		= emailElement.amount;
    const spacerTop 	= emailElement.spacerTop;
    const spacerBottom 	= emailElement.spacerBottom;
    const urls 			= emailElement.urls;
    const height 		= emailElement.height;
    const width 		= emailElement.width;
    let texts 			= emailElement.texts;
	for (var i = 0; i < texts.length; ++i) {
		texts[i] = texts[i].replace(/<br>/g, '\n');
	}

	let elementRadios: NodeListOf<HTMLInputElement> = document.getElementsByName("amount") as NodeListOf<HTMLInputElement>;
	elementRadios[amount - 1].checked = true;

	if (document.getElementsByName("height").length > 0) {
		let imageHeightInput: HTMLInputElement = document.getElementsByName("height")[0] as HTMLInputElement;
		imageHeightInput.value = "" + height;
	}
	if (document.getElementsByName("width").length > 0) {
		let imageWidthInput: HTMLInputElement = document.getElementsByName("width")[0] as HTMLInputElement;
		imageWidthInput.value = "" + width;
	}
	let spacerTopInput: HTMLInputElement = document.getElementsByName("spacerTop")[0] as HTMLInputElement;
	spacerTopInput.value = "" + spacerTop;
	let spacerBottomInput: HTMLInputElement = document.getElementsByName("spacerBottom")[0] as HTMLInputElement;
	spacerBottomInput.value = "" + spacerBottom;

	if (document.getElementsByName("url1").length > 0) {
		let input: HTMLInputElement = document.getElementsByName("url1")[0] as HTMLInputElement;
		input.value = urls[0];
	}
	if (document.getElementsByName("url2").length > 0) {
		let input: HTMLInputElement = document.getElementsByName("url2")[0] as HTMLInputElement;
		input.value = urls[1];
	}
	if (document.getElementsByName("url3").length > 0) {
		let input: HTMLInputElement = document.getElementsByName("url3")[0] as HTMLInputElement;
		input.value = urls[2];
	}
	
	if (document.getElementsByName("titleText1").length > 0) {
		let input: HTMLInputElement = document.getElementsByName("titleText1")[0] as HTMLInputElement;
		input.value = texts[0];
	}
	if (document.getElementsByName("titleText2").length > 0) {
		let input: HTMLInputElement = document.getElementsByName("titleText2")[0] as HTMLInputElement;
		input.value = texts[1];
	}
	if (document.getElementsByName("titleText3").length > 0) {
		let input: HTMLInputElement = document.getElementsByName("titleText3")[0] as HTMLInputElement;
		input.value = texts[2];
	}

	if (document.getElementsByName("paragraphText1").length > 0) {
		let input: HTMLTextAreaElement = document.getElementsByName("paragraphText1")[0] as HTMLTextAreaElement;
		input.value = texts[3];
	}
	if (document.getElementsByName("paragraphText2").length > 0) {
		let input: HTMLTextAreaElement = document.getElementsByName("paragraphText2")[0] as HTMLTextAreaElement;
		input.value = texts[4];
	}
	if (document.getElementsByName("paragraphText3").length > 0) {
		let input: HTMLTextAreaElement = document.getElementsByName("paragraphText3")[0] as HTMLTextAreaElement;
		input.value = texts[5];
	}

	let options = document.getElementsByTagName("option");
	if (options.length > 0) {
		for (var i = 0; i < options.length; ++i) {
			if (options[i].value == font){
				options[i].selected = true;
			}
		}
	}
	
	if (document.getElementsByClassName("emailElementColorRadios").length > 0) {
		let colorRadios = document.getElementsByClassName("emailElementColorRadios")[0];
		let inputs = colorRadios.getElementsByTagName("input");
		inputs[color - 1].checked = true;
	}

});

Template.editEmailElementPopup.events({
	'submit form': function(event) {
		event.preventDefault();
		let color: number;
	    let font;
	    let amount;
	    let spacerTop;
	    let spacerBottom;
	    let height;
	    let width;
	    let urls = [];
		let texts = [];

		if (event.target.bgColor) 		{ color 	= parseInt(event.target.bgColor.value); }
		if (event.target.font) 			{ font	 	= event.target.font.value; }
		if (event.target.amount) 		{ amount 	= event.target.amount.value; }
		if (event.target.spacerTop) 	{ spacerTop = event.target.spacerTop.value; }
		if (event.target.spacerBottom) 	{ spacerBottom = event.target.spacerBottom.value; }
		if (event.target.height) 		{ height 	= event.target.height.value; }
		if (event.target.width) 		{ width		= event.target.width.value; }

		if (event.target.url1) { urls.push(event.target.url1.value) } 
			else { urls.push("") }
		if (event.target.url2) { urls.push(event.target.url2.value) } 
			else { urls.push("") }
		if (event.target.url3) { urls.push(event.target.url3.value) } 
			else { urls.push("") }

		if (event.target.titleText1) { texts.push(event.target.titleText1.value) } 
			else { urls.push("") }
		if (event.target.titleText2) { texts.push(event.target.titleText2.value) } 
			else { urls.push("") }
		if (event.target.titleText3) { texts.push(event.target.titleText3.value) } 
			else { urls.push("") }
		if (event.target.paragraphText1) { texts.push(event.target.paragraphText1.value) } 
			else { urls.push("") }
		if (event.target.paragraphText2) { texts.push(event.target.paragraphText2.value) } 
			else { urls.push("") }
		if (event.target.paragraphText3) { texts.push(event.target.paragraphText3.value) } 
			else { urls.push("") }

		const element: EmailElement = EmailElements.findOne({_id: Session.get("elementId")}) as EmailElement;
		EmailElements.update(element._id, {
			$set: {
			    color: color,
			    font: font,
			    amount: amount,
			    height: height,
			    width: width,
			    spacerTop: spacerTop,
			    spacerBottom: spacerBottom,
			    urls: urls,
			    texts: texts,
			},
		});
		Global.closeAllPopups();
	}
});

Template.editEmailBackgroundPopup.onRendered(function () {
	const email: Email = Emails.findOne() as Email;
	let radios = document.getElementsByClassName("emailBackgroundColorRadios")[0];
	let inputs = radios.getElementsByTagName("input");
	inputs[email.color - 1].checked = true;
});

Template.editEmailBackgroundPopup.events({
	'submit form': function(event) {
		event.preventDefault();
		const color = event.target.color.value;

		if (color) {
			const email: Email = Emails.findOne() as Email;
			Emails.update(email._id, {
				$set: { color: color },
			});
			Global.closeAllPopups();
		};
	}
});

Template.emailPreview.events({
	'click div'(event, instance) {
		if (event.currentTarget.id == "emailPreviewColorSelector"){
			let currentProject = FlowRouter.getParam("currentProject");
			Session.set("currentProject", currentProject);

			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "editEmailBackgroundPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});  
		} else if (event.currentTarget.id == "sendTestEmail"){
			let currentProject = FlowRouter.getParam("currentProject");
			Session.set("currentProject", currentProject);

			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "sendTestEmailPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});  
		}
	}
});

Template.sendTestEmailPopup.events({
	'submit form': function(event) {
		event.preventDefault();
		let currentProject = FlowRouter.getParam("currentProject");
		let emailAddress = event.target.emailAddress.value;

		if (event.target.emailAddress.value) {
				let header = Global.getTemplateContent("header");
				let mainApp = Global.getTemplateContent("mainApp");
				let popup = "";

				let emailHTML = EmailObject.get();

				Meteor.apply('sendTestEmail',[
					currentProject, 
					emailAddress,
					emailHTML
				]);
				Session.set("currentProject", "none");
				BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});
		};
	}
});

Template.emailPreview.helpers({
	downloadEmailAsHTML () {
		const project: Project = Projects.findOne() as Project; 
		let emailHTML = EmailObject.get();
		emailHTML = unescape( encodeURIComponent( emailHTML ) );

		let emailLink = "data:application/octet-stream;base64," + btoa(emailHTML);
		let emailData = project.title + ".html";

		let emailObject = {href: emailLink, data: emailData};
		return emailObject;
	},

	email () {
		return Emails.findOne();
	},

	emailElement () {
		return EmailElements.find({}, {sort: {position: 1}}).fetch();
	},

	getEmailPreviewElement(myIndex, emailElement) {
		const element = EmailObject.getElement(myIndex, emailElement);
		return element;
	},
  	
});

const EmailObject = {
	getElement(myIndex, emailElement) {
		let myTemplate;
	    const type 			= emailElement.type;
	 	const color 		= Color.getColor(emailElement.color);
	 	const bgColor 		= Color.getBgColor(emailElement.color);
	    const font 			= emailElement.font;
	    const amount 		= emailElement.amount;
	    const spacerTop 	= emailElement.spacerTop;
	    const spacerBottom 	= emailElement.spacerBottom;
	    const urls 			= emailElement.urls;
	    const texts 		= emailElement.texts;
	    const height 		= emailElement.height;
	    let width 			= emailElement.width;

		let combinedWidth = width * amount;
		if (combinedWidth > 650) {
			width = 650 / amount;
			combinedWidth = width * amount;
		}

		let numberOfSpacers = amount - 1;
		if (numberOfSpacers < 2) {
			numberOfSpacers = 2;
		}
		const spacer = (650 - (width * amount)) / numberOfSpacers;

		let elementSpacer = function (height) {
			let spacer =
				'<table width=”100%” cellpadding="' + height + '" cellspacing="' + height + '">' +
					'<tr>' +
						'<td>' +
						'</td>' +
					'</tr>' +
				'</table>' ;
			return spacer;
		}

		let imageTd = function (height, width, url) {	
			let image = 
				'<td>' +
					'<img height="' + height + '" width="' + width + '" src="' + url + '" style="display: block;">' +
				'</td>'
			return image;
		}

		let textTd = function (textWidth, titleText, paragraphText, bgColor, color, fontFamily) {	
			let textTemplate = 
					'<td><table width="'+ textWidth +
					'" bgcolor="' + bgColor + '">' + 
					
					'<tr><td align="center" style="font-family: ' + fontFamily + '; ' +
					'font-size:20px; padding:10px; font-weight:bold; color:' + color + '">' + titleText + '</td></tr>' +

					'<tr><td align="left" style="font-family: ' + fontFamily + '; ' + 
					'font-size:16px; padding:10px; font-weight:normal; color:' + color + '">' + paragraphText + '</td></tr>' +

					'</table></td>';
				return textTemplate;
		}
		
		let buttonTd = function (url, linkWidth, linkName, bgColor, color) {
			let buttonTemplate = 
				'<td>' +
					'<a href="' + url + '" style="text-decoration: none; color:' + color + ';">' +
						'<table width="'+ linkWidth +'" height="50" bgcolor="' + bgColor + '"> ' +
							'<tr>' +
								'<td align="center" style="vertical-align:middle">' +
									'<b style="color:' + color + '">' + linkName + '</b>' +
								'</td>' +
							'</tr>' +
						'</table>' +
					'</a>' +
				'</td>';
			return buttonTemplate;
		}

		if (emailElement.type == 1) {
			myTemplate =
			elementSpacer(spacerTop) +
			'<table width=”100%” cellpadding="0" cellspacing="0" align="center" id="emailPreviewElement' + myIndex + '" class="emailPreviewElement">' +
				'<tr>' +
					'<td>' +
						'<table width=”100%” cellpadding="0" cellspacing="0">' +
							'<tr>' + 
								'<td width="' + spacer + '">' +
								'</td>' +
								imageTd (height, width, urls[0]);
								switch (amount) {
									case 1: break; 	
									case 2: myTemplate +=
										'<td width="' + spacer + '">' +
										'</td>' +
										imageTd (height, width, urls[1]);
									break; 	
									case 3: myTemplate +=
										'<td width="' + spacer + '">' +
										'</td>' +
										imageTd (height, width, urls[1]) +
										'<td width="' + spacer + '">' +
										'</td>' +
										imageTd (height, width, urls[2]);
									break; 	
								}
								myTemplate +=	
								'<td width="' + spacer + '">' +
								'</td>' +
							'</tr>' +
						'</table>' +
					'</td>' +
				'</tr>' +
			'</table>' +
			elementSpacer(spacerBottom);
		} else if (emailElement.type == 4) {
			myTemplate =
				elementSpacer(spacerTop) +
				'<table width=”100%” cellpadding="0" cellspacing="0" align="center" id="emailPreviewElement' + myIndex + '" class="emailPreviewElement">' +
					'<tr>' +
						'<td>' +
							'<table width=”100%” cellpadding="0" cellspacing="0">' +
								'<tr>' +
									'<td width="' + spacer + '">' +
									'</td>' +
									textTd (width, texts[0], texts[3], bgColor, color, font);
									switch (amount) {
										case 1: break; 	
										case 2: myTemplate +=
											'<td width="' + spacer + '">' +
											'</td>' +
											textTd (width, texts[1], texts[4], bgColor, color, font);
										break; 	
										case 3: myTemplate +=
											'<td width="' + spacer + '">' +
											'</td>' +
											textTd (width, texts[1], texts[4], bgColor, color, font) +
											'<td width="' + spacer + '">' +
											'</td>' +
											textTd (width, texts[2], texts[5], bgColor, color, font);
										break; 	
									}
									myTemplate +=	
									'<td width="' + spacer + '">' +
									'</td>' +
								'</tr>' +
							'</table>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				elementSpacer(spacerBottom);
		} else if (emailElement.type == 5) {
			myTemplate = 
				elementSpacer(spacerTop) +
				'<table width=”100%” cellpadding="0" cellspacing="0" align="center" id="emailPreviewElement' + myIndex + '" class="emailPreviewElement">' +
					'<tr>' +
						'<td>' +
							'<table width=”100%” cellpadding="0" cellspacing="0">' +
								'<tr>' +
									'<td width="' + spacer + '">' +
									'</td>' +
									buttonTd (urls[0], width, texts[0], bgColor, color);
									switch (amount) {
										case 1: break; 	
										case 2: myTemplate +=
											'<td width="' + spacer + '">' +
											'</td>' +
											buttonTd (urls[1], width, texts[1], bgColor, color);
										break; 	
										case 3: myTemplate +=
											'<td width="' + spacer + '">' +
											'</td>' +
											buttonTd (urls[1], width, texts[1], bgColor, color) +
											'<td width="' + spacer + '">' +
											'</td>' +
											buttonTd (urls[2], width, texts[2], bgColor, color);
										break; 	
									}
									myTemplate +=
									'<td width="' + spacer + '">' +
									'</td>' +
								'</tr>' +
							'</table>' +
						'</td>' +
					'</tr>' +
				'</table>' +
				elementSpacer(spacerBottom);
		}
		return myTemplate;
  	},

    get: function(){
		const email: Email = Emails.findOne() as Email;
		if (!email) {
			return;
		}
		const emailElements = EmailElements.find().fetch();
		const project: Project = Projects.findOne() as Project;
		const bgColor = Color.getBgColor(email.color);

		let elements = "";
		for (var i = 0; i < emailElements.length; ++i) {
			elements = elements + EmailObject.getElement(i, emailElements[i]);
		}

		let emailHTML =
		'<html><head><meta charset="UTF-8"><title>' + project.title + '</title>' +
		'</head><body>' +
			'<table height="100%" width="100%" cellpadding="30" cellspacing="0" bgcolor="' + bgColor + '">' +
	          	'<tr>' +
	            	'<td align="center">' +
						'<table width="650" cellpadding="0" cellspacing="0">' +
							'<tr>' +
								'<td>' +
									elements +
								'</td>' +
							'</tr>' +
						'</table>' +
					'</td>' +
				'</tr>' +
			'</table>' +
		'</body></html>';
		return emailHTML
	}
}

const Color = {
    getBgColor: function(bgColor){
		switch (bgColor) {
			case 1:
				bgColor = "ffffff";
				break;
			case 2:
				bgColor = "#dddddd";
				break;
			case 3:
				bgColor = "#999999";
				break;
			case 4:
				bgColor = "#555555";
				break;
			case 5:
				bgColor = "#333333";
				break;
			case 6:
				bgColor = "#333333";
				break;
			case 7:
				bgColor = "#ff6e66";
				break;
			case 8:
				bgColor = "#77dd77";
				break;
			case 9:
				bgColor = "#779ecb";
				break;
			case 10:
				bgColor = "";
				break;
		} 
		return bgColor;
	},

	getColor: function(color){
		switch (color) {
			case 1:
				color = "#000000";
				break;
			case 2:
				color = "#000000";
				break;
			case 3:
				color = "#000000";
				break;
			case 4:
				color = "#ffffff";
				break;
			case 5:
				color = "#ffffff";
				break;
			case 6:
				color = "#ff1188";
				break;
			case 7:
				color = "#ffffff";
				break;
			case 8:
				color = "#ffffff";
				break;
			case 9:
				color = "#ffffff";
				break;
			case 10:
				color = "#000000";
				break;
		} 
		return color;
	},
};
