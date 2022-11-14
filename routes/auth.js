const express = require('express');
const router = express.Router();

const passport = require('passport');

router.get('/signup', (request, response) => {
    response.render('signup', function (err, html) {
        if(err){
            console.log('500 Error');
            console.log(err);
            response.redirect('/500');
        }
        else{
            response.render('signup', request.user);
        }
    });
});

router.post('/signup', (request, response) => {
    console.log(request.body.firstName);
     const citizen = new Community.Citizen({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        secondLastName: request.body.secondLastName,
        email: request.body.email,
        password: request.body.password,
        cellphone: request.body.cellphone,
    });
    citizen.save()
        .then((result) => response.send(result))
        .catch((error) => response.send(error));
});

router.get('/login', (request, response) => {
    response.render('login', (err, html) =>{
        console.log('req.user before:');
        console.log(request.user);
        if(err){
            response.redirect('/404', {'message': [err,html]});
        }else{
            response.render('login', request.user);
        }
    });
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureMessage: true}),
    (request, response) => {        
        if(request.Url){
            response.redirect(request.url)
        }else{
            console.log(request.user);
            response.redirect('profile');
        }
    }
);

router.get('/profile', (request, response) => {
    if (!request.user){
        request.url = '/profile';
        response.redirect('/login');
    } else{
        response.render('profile', request.user);
    }
    });

router.post('/logout', function(request, response, next) {
    request.logout(function(error) {
        if(error) {return next(error);}
        response.redirect('/');
    });
});

module.exports = router;