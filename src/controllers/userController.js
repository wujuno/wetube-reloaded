import User from "../models/user"
import Video from "../models/video"
import fetch from "node-fetch";
import bcrypt from "bcryptjs"
import session from "express-session";

export const getJoin = (req,res) => 
res.render("join", {pageTitle: "Join"});
export const postJoin = async(req,res) => {
    const { name, email, username, password, password2, location } = req.body;
    const pageTitle = "Join";
    if(password !== password2){
        return res.status(400).render("join", {
            pageTitle, 
            errorMessage: "Password confirmation does not match."});
    }
    //$or 
    const exists = await User.exists({$or:[ {username}, {email} ]});
    if (exists) {
       return res.status(400).render("join", {
        pageTitle, 
        errorMessage: "This username/email is already taken."});
    }
    try {
    await User.create({
        name,
        email,
        username,
        password,
        location, 
    });
    return res.redirect("/login")
    } catch(error) {
        return res.status(400).render("join", {
            pageTitle, 
            errorMessage: error._message,
        })
    }
}
export const getLogin = (req, res) => res.render("login", {pageTitle : "Login"});
export const postLogin = async(req, res) => {
    const {username, password} = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({ username, socialOnly:false })
    if(!user){
       return res.status(400).render("login", {pageTitle, errorMessage: "An account with this username dose not exists."}) 
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", {pageTitle, errorMessage: "The password is wrong."})
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

export const startGithubLogin = (req,res) => {
    const baseUrl = `http://github.com/login/oauth/authorize`;
    const config = {
        client_id:process.env.GH_CLINET,
        allow_signup:false,
        scope:"read:user user:email"
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl)
}

export const finishGithubLogin = async(req,res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLINET,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
        method:"POST",
        headers: {
            Accept: "application/json",
        },
    })
    ).json();
    if("access_token" in tokenRequest){
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await (
            await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `token ${access_token}`,
            },
        })
        ).json();
        console.log(userData);
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
            headers: {
                Authorization: `token ${access_token}`,
            },
        })
        ).json();
        const emailObj = emailData.find(
            email => email.primary===true && email.verified===true
        );
        if (!emailObj) {
            //set notification
            return res.redirect("/login");
        }
        let user = await User.findOne({email: emailObj.email});
        if(!user){
            user = await User.create({
                name:userData.name,
                avatarUrl:userData.avatar_url,
                email:emailObj.email,
                username:userData.login,
                password:"",
                socialOnly:true,
                location:userData.location,
            });
        } 
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    }else {
        return res.redirect("/login");
    }
}


export const logout = (req, res) => {
    req.session.user = null;
    res.locals.loggedInUser = req.session.user;
    req.session.loggedIn = false;
    req.flash("info", "Bye Bye");
    return res.redirect("/")
};
export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
    const {
        session: {
            user: {_id, avatarUrl, email:sessionEmail, username:sessionUsername}
        }, 
        body: {name,email,username,location},
        file,
    } = req;
    console.log(avatarUrl);
    const existUserEmail = sessionEmail !== email ? await User.exists({email}) : undefined; 
    const existUsername = sessionUsername !== username ? await User.exists({username}) : undefined;
    if(existUserEmail || existUsername) {
        return res.status(400).render("edit-profile", {
            pageTitle:"Edit Profile", 
            errorMessage: "This username/email is already taken."})
    }
    const updatedUser = await User.findByIdAndUpdate(_id, 
        {
        avatarUrl: file ? file.path : avatarUrl,
        name,
        email,
        username,
        location
        },
        { new: true }
    );
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
        

};

export const getChangePassword = async (req, res) => {
    if(req.session.user.socialOnly === true){
        req.flash("error", "Can't change password");
        return res.redirect("/");
    }
    return res.render("users/change-password", {pageTitle:"Change Password"});
};
export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: {_id}
        }, 
        body: { oldPassword,newPassword,newPasswordConfirmation,}
    } = req;
    const user = await User.findById(_id);
    const ok = await bcrypt.compare(oldPassword, user.password);
    if(!ok){
        return res.status(400).render("users/change-password", {
            pageTitle:"Change Password", 
            errorMessage:"The oldPassword is wrong"
        });
    }
    if(newPassword !== newPasswordConfirmation) {
        return res.status(400).render("users/change-password", {
            pageTitle:"Change Password", 
            errorMessage:"The Password Does not match the confirmaition"
        });
    }
    user.password = newPassword;
    await user.save();
    req.session.destroy();
    req.flash("info", "Password Updated");
    return res.redirect("/login");
    
    // send notification
};



export const see = async (req, res) => {
    const {_id} = req.session.user;
    const user = await User.findById(_id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "user"
        }
    });
    console.log(user);
    if(!user){
        return res.status(404).render("404", {pageTitle:"User Not Found"}
    )};
    return res.render("users/profile", {
        pageTitle:`${user.name}의 Profile`, 
        user,
    });
};

