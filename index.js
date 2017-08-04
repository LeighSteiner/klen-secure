//usage
const authMaster = require('auth-master');
const userAuthenticator = new authMaster(db.Users, {user: function(id){ validationHere }, siteController: function(){...}, admin: function(){}});
// userAuthenticator.isAuthorized(userId);

app.use(userAuthenticator.checkAuthorizations) //thus only receives req res next
//dependent on PASSPORT because then you check for req.user 

function volleyball(req, res, next){

}
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
				this.id = secretId++
				secretLocation[this.id] = {
					authObject: authObject, 
					authFailLog : {}
				};
				this.checkAuthorizations = this.checkAuthorizations.bind(this);
				this.authFailLogger = this.authFailLogger.bind(this);

				this.modelAuthenticator = modelAuthenticator;
				this.authFunctions = authObject || {  //can we contain the Sequelize in the authObj? 
					 isUser : async function(id){
						let user = await this.modelAuthenticator.findById(id)
						user ? true : false; 
					}, 
					// isThisUser : async function(id, targetId){},  //this doesn't work because it doesn't match
					isMod : async function(id){
						let user = await this.modelAuthenticator.findById(id)
						user.isMod ? true : false; 

					},
					isAdmin: async function(id){
						let user = await this.modelAuthenticator.findById(id)
						user.isAdmin ? true : false; 
					},
					isSiteController : async function(id){
						let user = await this.modelAuthenticator.findById(id)
						user.isSiteController ? true : false ;
					} //make DRYer 
					// isParticularClearance(id, clearanceStr){} //is this a better check ModelAuthenticator[clearanceStr]: true
				}
			}

			 checkAuthorizations(req,res,next){ // is now a piece of middleware which relies on PASSPORT 
			 	let output = [];
			 	if(req.user){
				 		for (let k in secretLocation[this.id].authFunctions){
					 		if (authFunctions[k](req.user.id)){
					 			output.push(k);
					 		}
				 		req.user.clearances = output;
				 		next();
			 		} //check if req.user.clearances.contains(x)
			 	}else{
			 		throw new Error('checkAuth: user is not logged in')
			 	}
			 }

			 authFailLogger(whichAuth){  //RETURNS a function which is a piece of middleware 
			 	return function(req,res,next){
				 	if (req.user){
				 		if(secretLocation[this.id].authFunction.hasOwnProperty(whichAuth)){
				 			if (req.user.clearances.includes(whichAuth)){
				 				next();
				 			}else{
				 				if (secretLocation[this.id].authFailLog[whichAuth]){
				 					secretLocation[this.id].authFailLog[whichAuth].push(req.user.id);
				 				}else{
				 					secretLocation[this.id].authFailLog[whichAuth] = [req.user.id];
				 				}
				 			}
				 		}else{
				 			throw new Error('not a valid authorization check');
				 		}
				 	}
			 	}else{
			 		throw new Error('authFailLog: user is not logged in');
			 	}	
			 }
			
			
		}
	}
	)();
}
