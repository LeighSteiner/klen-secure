//usage
const authMaster = require('auth-master');
const userAuthenticator = new authMaster(db.Users, {user: function(id){ validationHere }, siteController: function(){...}, admin: function(){}});
// userAuthenticator.isAuthorized(userId);


// the goal:  to create a library that works without Express or Sequelize, 
//takes in a model to authenticate, a series of authorization functions
// and performs security functions 
//store authorization models in private object inside an iffy function 
//each new instance MUST be established with an id
//set up to default to sequelize but can be overridden

//somehow pass the functions into the private object 

//model authenticator : what model do you want to authenticate and how do you access it


function authMaster(){
	(function(){
		var secretLocation = {};
		var secretId = 0;
		return class {
			constructor(modelAuthenticator, authObject){
				this.modelAuthenticator = modelAuthenticator;
				this.authFunctions = authObject || {
					async isUser : function(id){
						let user = await this.modelAuthenticator.findById(id)
						
					}, 
					isThisUser : function(id){},
					isMod : function(id){},
					isAdmin: function(id){},
					isSiteController : function(id){}
				}
			}

			 checkAuthorizations(userId){
			 	let output = [];
			 	for (let k in this.authFunctions){
			 		if (authFunctions[k](userId)){
			 			output.push(k);
			 		}
			 		return output;
			 	}
			 }
			 checkOneAuth(userId, whichAuth){
				if (authFunction.hasOwnProperty(whichAuth)){
					return whichAuth(userId); 
				}
			}
		}
	}

	)();
}
