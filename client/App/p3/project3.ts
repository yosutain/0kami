import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Projects, APICalls } from '../../../imports/pubsub';
import { Project, APICall } from '../../../imports/interfaces';
import { Global } from '../../../imports/client/global';
import { Template } from 'meteor/templating';

Template.openProject3.helpers({
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

Template.addCallItem.events({
	'submit form': function(event) {
		event.preventDefault();
		if (event.target.url.value) {
			let url = event.target.url.value;
			if ((url.indexOf("http://") !== 0) && (url.indexOf("https://") !== 0)) {
				let invalidField = event.target.url;
				if (!invalidField.classList.contains("p3-invalidField")) {
					invalidField.classList.add("p3-invalidField");
				}
				return;
			} else {
				let invalidField = event.target.url;
				if (invalidField.classList.contains("p3-invalidField")) {
					invalidField.classList.remove("p3-invalidField");
				}
			}

			let currentProjectId = FlowRouter.getParam("currentProject");
			if ((url.indexOf("http://") !== 0) && (url.indexOf("https://") !== 0)) {
				return;
			}
			const apiCall: APICall = {
			    project: currentProjectId,
			    status: 0,
			    url: url,
			    response: "",
			    id: Global.getUniqueId(),
			};
    		APICalls.insert(apiCall);
			event.target.url.value = "";
		};
	}
});

Template.callItemList.helpers({
	callItemList () {
		return APICalls.find().fetch();
	},
});

Template.callItem.events({
	'click div': function(event) {
		event.preventDefault();
		if (event.target.classList.contains("p3-callItemSettings")) {
			let callId = event.target.getAttribute("callId");
			Session.set("callId", callId);

			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "callItemSettingsPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});	
		} else if (event.target.classList.contains("p3-callItemStatus")) {
			let callId = event.target.getAttribute("callId");
			Session.set("callId", callId);

			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "callItemStatusPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});	
		} else if (event.target.classList.contains("p3-callItemURL")) {
			let callId = event.target.getAttribute("callId");
			Session.set("callId", callId);

			let header = Global.getTemplateContent("header");
			let mainApp = Global.getTemplateContent("mainApp");
			let popup = "callItemURLPopup";
			BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});	
		}
	}
});

Template.callItemSettingsPopup.events({
	'click button': function(event) {
		event.preventDefault();
		if (event.target.id == "p3-deleteCallItemButton") {
			if (event.target.classList.contains("p3-confirmDeleteCallItem")) {
				const apiCall: APICall = APICalls.findOne({id: Session.get("callId")}) as APICall;
				const id = apiCall._id;
				APICalls.remove(id);
				Global.closeAllPopups();
			} else {
				event.target.classList.add("p3-confirmDeleteCallItem");
				Meteor.setTimeout(function(){
					event.target.classList.remove("p3-confirmDeleteCallItem");
				}, 5000);
			}
		}
	}
});

Template.callItemRunner.events({
	'click button': function(event) {
		event.preventDefault();
		if (event.target.id == "p3-runAllButton") {
			let currentProjectId: any = FlowRouter.getParam("currentProject");
			Meteor.apply("runAll", [currentProjectId]);
		};
	}
});

Template.callItemURLPopup.events({
	'click div': function(event) {
		event.preventDefault();
		if (event.target.classList.contains("showMyContent")) {
			event.target.classList.remove("showMyContent");
		} else if (event.target.parentNode.classList.contains("showMyContent")) {
			event.target.parentNode.classList.remove("showMyContent");
		} else if (event.target.parentNode.classList.contains("p3-resultBlock")) {
			event.target.classList.add("showMyContent");
		}
	}
});

Template.callItemURLPopup.helpers({
	response () {
		const id: string = Session.get("callId");
		const call: APICall = APICalls.findOne({id: id}) as APICall;
		const response: JSON = call.response as JSON;
		if (!response) {
			return "<div class='p3-resultBlock'><div> This call had no content<div class='p3-myContent'> \\(*w*)/ </div></div></div>";
		}
		const keys = Object.getOwnPropertyNames(response);
		let keyArray = [];
		let valueArray = [];
		for (var i = 0; i < keys.length; ++i) {
			keyArray.push(keys[i].toUpperCase());
			valueArray.push(response[keys[i]]);
		}

		for (var i = 0; i < valueArray.length; ++i) {
			let value = valueArray[i];
			if (typeof value == "object") {
				valueArray[i] = "--OBJECT--";
			} else if (typeof value == "string") {
				valueArray[i] = "--STRING--";
			} else if (typeof value == "number") {
				valueArray[i] = "--NUMBER--";
			}
		}

		let result = "<div class='p3-resultBlock'>";
		for (var i = 0; i < valueArray.length; ++i) {
			result = result + 
			"<div>" + 
			keyArray[i] + 
			"<div class='p3-myContent'>" + 
			valueArray[i] + 
			"</div></div>";
		}
		result = result + "</div>";
		return result;
	},

	responseContent () {
		const id: string = Session.get("callId");
		const call: APICall = APICalls.findOne({id: id}) as APICall;
		const response: JSON = call.response as JSON;
		if (!response) {
			return "<div class='p3-resultBlock'><div> This call had no content<div class='p3-myContent'> \\(*w*)/ </div></div></div>";
		}
		const keys = Object.getOwnPropertyNames(response);

		let valueArray = [];
		for (var i = 0; i < keys.length; ++i) {
			valueArray.push(response[keys[i]]);
		}

		let str: string;
		for (var i = 0; i < valueArray.length; ++i) {
			let value = valueArray[i];
			if (typeof value == "string") {
				str = valueArray[i];
				i = valueArray.length;
			}
		}
		const strArr: string[] = str.split(",");

		let tempStr
		let tempStrArr: string[];
		let result: string = "<div class='p3-resultBlock'>";
		for (var i = 0; i < strArr.length; ++i) {
			strArr[i] = strArr[i].replace(/\[|\]|\"|\{|\}/g, " ");
			tempStrArr = strArr[i].split(":");
			result = result + "<div>" + tempStrArr[0] + "<div class='p3-myContent'>" + tempStrArr[1] + "</div></div>";
		}
		result = result + "</div>";
		return result;
	},
});

Template.callItemStatusPopup.helpers({
	statusMessage () {
		const id: string = Session.get("callId");
		const call: APICall = APICalls.findOne({id: id}) as APICall;
		const statusCode: number = call.status;
		let statusMessage = "Please make sure that the URL was written correctly";
		switch (statusCode) {
		case 0: statusMessage = "This url has not been called"; break;
		case 101: statusMessage = "A valid URL would start with http..."; break;
		case 200: statusMessage = "OK"; break;
		case 201: statusMessage = "Created"; break;
		case 202: statusMessage = "Accepted"; break;
		case 203: statusMessage = "Non-Authoritative Information"; break;
		case 204: statusMessage = "No Content"; break;
		case 205: statusMessage = "Reset Content"; break;
		case 206: statusMessage = "Partial Content"; break;
		case 300: statusMessage = "Multiple Choices"; break;
		case 301: statusMessage = "Moved Permanently"; break;
		case 302: statusMessage = "Found"; break;
		case 303: statusMessage = "See Other"; break;
		case 304: statusMessage = "Not Modified"; break;
		case 305: statusMessage = "Use Proxy"; break;
		case 306: statusMessage = "Unused"; break;
		case 307: statusMessage = "Temporary Redirect"; break;
		case 308: statusMessage = "Permanent Redirect"; break;
		case 400: statusMessage = "Bad Request"; break;
		case 401: statusMessage = "Unauthorized"; break;
		case 402: statusMessage = "Payment Required"; break;
		case 403: statusMessage = "Forbidden"; break;
		case 404: statusMessage = "Not Found"; break;
		case 405: statusMessage = "Method Not Allowed"; break;
		case 406: statusMessage = "Not Acceptable"; break;
		case 407: statusMessage = "Proxy Authentication Required"; break;
		case 408: statusMessage = "Request Timeout"; break;
		case 409: statusMessage = "Conflict"; break;
		case 410: statusMessage = "Gone"; break;
		case 411: statusMessage = "Length Required"; break;
		case 412: statusMessage = "Precondition Required"; break;
		case 413: statusMessage = "Request Entry Too Large"; break;
		case 414: statusMessage = "Request-URI Too Long"; break;
		case 415: statusMessage = "Unsupported Media Type"; break;
		case 416: statusMessage = "Requested Range Not Satisfiable"; break;
		case 417: statusMessage = "Expectation Failed"; break;
		case 418: statusMessage = "I'm a teapot"; break;
		case 422: statusMessage = "Unprocessable Entity"; break;
		case 428: statusMessage = "Precondition Required"; break;
		case 429: statusMessage = "Too Many Requests"; break;
		case 431: statusMessage = "Request Header Fields Too Large"; break;
		case 451: statusMessage = "Unavailable For Legal Reasons"; break;
		case 500: statusMessage = "Internal Server Error"; break;
		case 501: statusMessage = "Not Implemented"; break;
		case 502: statusMessage = "Bad Gateway"; break;
		case 503: statusMessage = "Service Unavailable"; break;
		case 504: statusMessage = "Gateway Timeout"; break;
		case 505: statusMessage = "HTTP Version Not Supported"; break;
		case 511: statusMessage = "Network Authentication Required"; break;
		case 520: statusMessage = "Web server is returning an unknown error"; break;
		case 522: statusMessage = "Connection timed out"; break;
		case 524: statusMessage = "A timeout occurred"; break;
		}
		return statusMessage;
	},
});

Template.registerHelper('statusCode', () => {
	const id: string = Session.get("callId");
	const call: APICall = APICalls.findOne({id: id}) as APICall;
	const statusCode: number = call.status;
	return statusCode;
});

Template.registerHelper('statusFrame', () => {
	const id: string = Session.get("callId");
	const call: APICall = APICalls.findOne({id: id}) as APICall;
	const statusCode: number = call.status;
	let callItemStatusFrame = "";
	if (statusCode == 0) {
		callItemStatusFrame = "callItemStatusFrame0";
	} else if (statusCode == 101) {
		callItemStatusFrame = "callItemStatusFrame0";
	} else if (statusCode < 300) {
		callItemStatusFrame = "callItemStatusFrame1";
	} else if (statusCode < 400) {
		callItemStatusFrame = "callItemStatusFrame2";
	} else if (statusCode < 500) {
		callItemStatusFrame = "callItemStatusFrame3";
	} else if (statusCode < 600) {
		callItemStatusFrame = "callItemStatusFrame4";
	} else {
		callItemStatusFrame = "callItemStatusFrame0";
	}
	return callItemStatusFrame;
});