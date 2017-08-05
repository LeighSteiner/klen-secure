//usage
// const authMaster = require('auth-master')();
// const userAuthenticator = new authMaster(db.Users, {user: function(id){ validationHere }, siteController: function(){...}, admin: function(){}});
// userAuthenticator.isAuthorized(userId);


function authMaster(){
	return (function(){
		var secretLocation = {};
		var secretId = 0;
		return class {
			constructor(modelAuthenticator, authObject, logViewBool){

				this.id = secretId++
				secretLocation[this.id] = {
					authFailLog : {}, 
					logViewBool : logViewBool || false //default setting is that you canNOT modify the log 
				};

				this.modelAuthenticator = modelAuthenticator;
				
				secretLocation[this.id].authObject = authObject || {  //default setup for Sequelize 
					 isUser : async (id) => {                        // async await requires at least Node 7.6
						let user = await this.modelAuthenticator.findById(id)
						return !!user;
					}, 
					isMod : async (id) => {
						let user = await this.modelAuthenticator.findById(id)
						 return !!user.isMod;
					},
					isAdmin: async (id) =>{
						let user = await this.modelAuthenticator.findById(id)
						return !!user.isAdmin; 
					},
					isSiteController : async (id) => {
						let user = await this.modelAuthenticator.findById(id)
						return !!user.isSiteController;
					}  
				}

			}

			 checkAuthorizations(){ 
			 	let output = [];
			 	return (req,res,next) => {
			 		if(req.user){
			 			
					 		for (let k in secretLocation[this.id].authObject){
						 		if (secretLocation[this.id].authObject[k](req.user.id)){
						 			output.push(k);
						 		}
					 		req.user.clearances = output;
					 		console.log('clearance: ',req.user.clearances)
				 		} 
				 		next();
				 	}else{
				 		next(new Error('checkAuth: user is not logged in'));
				 	}
			 	}
			 }

	 		authFailLogger(whichAuth){
			 	return (req,res,next) => {
				 	if (req.user){
				 		if(secretLocation[this.id].authObject.hasOwnProperty(whichAuth)){
				 			if (req.user.clearances.includes(whichAuth)){
				 				next();
				 			}else{
				 				if (secretLocation[this.id].authFailLog[whichAuth]){
				 					secretLocation[this.id].authFailLog[whichAuth].push(req.user.id);
				 					console.log(whichAuth, "Fail Log: ",secretLocation[this.id].authFailLog[whichAuth]);

				 				}else{
				 					secretLocation[this.id].authFailLog[whichAuth] = [req.user.id];
				 					console.log(whichAuth, "Fail Log: ",secretLocation[this.id].authFailLog[whichAuth])
				 				}
				 				next(new Error('You do not have valid clearance'));
				 			}
				 		}else{
				 			 next(new Error('not a valid authorization check'));
				 		}
				 	}else{
			 			next(new Error('authFailLog: user is not logged in'));
			 		}	
			 	}
			 }
			
			singleRouteSecure(whichAuth){
				return (req,res,next) => {
					if (req.user){
						if(secretLocation[this.id].authObject.hasOwnProperty(whichAuth)){
							if(secretLocation[this.id].authObject[whichAuth](req.user.id)){
								next();
							}else{
								if (secretLocation[this.id].authFailLog[whichAuth]){
				 					secretLocation[this.id].authFailLog[whichAuth].push(req.user.id);
				 					console.log(secretLocation[this.id].authFailLog[whichAuth]);

				 				}else{
				 					secretLocation[this.id].authFailLog[whichAuth] = [req.user.id];
				 					console.log(whichAuth, "Fail Log: ",secretLocation[this.id].authFailLog[whichAuth])
				 				}
				 			}

						}else{
							next(new Error('singleRouteSecure: not a valid authorization check'))
						}
					}else{
						next(new Error('singleRouteSecure: user is not logged in'));
					}
				}
			}

			getAuthFailLog(){
				if(secretLocation[this.id].logViewBool){ //refactor to return middleware 
					return secretLocation[this.id].authFailLog; 
				}else{
					throw new Error('you cannot modify this log');
				}
			}

			viewAuthFailLog(){ //refactor to return middleware 
				return secretLocation[this.id].authFailLog.toString();;
			}
		}
	}
	)();
}
module.exports = authMaster;