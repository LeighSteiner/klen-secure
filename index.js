
//expects you to use router.params to fetch the User model
//expects User model to have an isAdmin boolean

// SECTION I: Authorization Checks (logged in, Admin) pass these into your routes that need to be secured 

module.exports = {
checkLoginMild : function (req, res, next){
	if (req.user){
		next();
	}else{
		res.sendStatus(401); //  401 = unauthorized
	}
}, 



checkLoginGoogle : function (req,res,next){
	if (req.user){
		next();
	}else{
		res.redirect('http://google.com');
	}
}, 

checkLoginCat : function (req,res,next){
	if (req.user){
		next();
	}else{
		res.redirect('https://en.wikipedia.org/wiki/Cat');
	}
}, 


checkLoginFingerWag : function (req,res,next){
	if(req.user){
		next();
	}else{
		res.status(401).send('You should know better!');
	}
}, 

checkAdminMild : function (req,res,next){
	if (req.user && req.user.isAdmin){
		next();
	}else{
		res.status(401).send("You must be an administrator to access this.");
	}
}, 

checkAdminMediumWikipedia : function (req,res,next){
	if (req.user && req.user.isAdmin){
		next();
	}else{
		res.redirect('https://en.wikipedia.org/wiki/Administrator');
	}

}, 

checkAdminMediumLogout : function (req,res,next){},

checkAdminMediumFlag : function (req,res,next){},

checkAdminNuclear : function (req,res,next){
	if (req.user && req.user.isAdmin){
		next();
	}else{
		User.destroy(where: {id : user.id})
			.then(res.send('You have been blacklisted'));
	}
}, //deletes violating user 

//flag users who make bad requests -- mild moderate severe loginchecks 
//log them out on second try or change their status
//send to random wikipedia page
//QUESTION? isAdmin -- can i just assume that this is a thing?  should i put that in the readme? config?

// clean email or username requests function
defeatInjection : function(str){
	return str + "";
}
}

