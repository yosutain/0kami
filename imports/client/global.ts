export const Global = {
    getTemplateContent: function(content){
		let currentTemplate: string;
		if (content == "header"){
			currentTemplate = document.getElementsByTagName("header")[0].id;
		} else if (content == "mainApp"){
			currentTemplate = document.getElementById("mainApp").className;
		} else if (content == "popup"){
			currentTemplate = "";
		}
		return currentTemplate;
	},

	closeAllPopups: function(){
		let header: string = Global.getTemplateContent("header");
		let mainApp: string = Global.getTemplateContent("mainApp");
		let popup: string = "";
		BlazeLayout.render("layout1", {header: header, mainApp: mainApp, popup: popup});
	},

	getUniqueId: function(){
		let uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});	
		return uid;
	},
};