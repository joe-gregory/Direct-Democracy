const express = require('express');
const router = express.Router();

const communityController = require('../controllers/communityController');
const communityFeedController = require('../controllers/communityFeedController');

router.get('/mycommunity*', communityController.getCheckIsAuthenticated);

router.post('/mycommunity*', communityController.getCheckIsAuthenticated);

router.get('/mycommunity', communityFeedController.getCommunityFeed);

router.get('/mycommunity/nocommunity', (request, response) => {
    response.locals.firstName = request.user.firstName;
    response.render('noCommunity');
})
router.get('/mycommunity/about',communityController.getCommunityAbout);

router.get('/mycommunity/create', (request, response) =>{
    response.render('createCommunity', request.user);
});

router.post('/mycommunity/create', communityController.postCommunityCreate);

router.get('/mycommunity/join', communityController.getCommunityJoin);

router.post('/mycommunity/join', communityController.postCommunityJoin);

//AJAX request
router.get('/mycommunity/join/homes', communityController.getCommunityJoinHomesAjax);

router.get('/mycommunity/createproposal', communityController.getCommunityProposal);

router.post('/mycommunity/createproposal', communityFeedController.postCreateProposal);

router.post('/mycommunity/vote/:proposalId', communityFeedController.postFeedVote);

module.exports = router;