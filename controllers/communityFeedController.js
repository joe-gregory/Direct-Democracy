const Community = require('../models/community');
const Law = require('../models/law');

const getCommunityFeed = (request, response) => {
    if (!request.user.community) response.redirect('/mycommunity/nocommunity');

    response.locals.firstName = request.user.firstName;
    //Primero buscar la comunidad asociada con el usuario
    Community.Community.findById(request.user.community, function(err, community) {

        //Guardar la informacion de la comunidad en locals para poder render en pagina
        response.locals.community = community;
        
        //Despues buscar la lista de propuestas en el modelo de comunidad
        Law.Proposal.find({'_id' : { $in: community.proposals}}, function(err, proposals) {
            
            response.locals.proposals = proposals;
            if(response.locals.proposals.length == 0) response.render('mycommunity');
            for (let j = 0; j < response.locals.proposals.length; j++) {
                //I need to find the array of votes.citizens so I can check it against req.user.id to see if already voted on this proposal
                Law.Vote.find({'_id' : { $in: response.locals.proposals[j].votes}}, function(err, votes) {
                    let matchingVotes = votes.find(vote => vote.citizen == request.user.id);
                    (matchingVotes != undefined) ? response.locals.proposals[j].alreadyVoted = true : response.locals.proposals[j].alreadyVoted = false;
                        //Encontrar el autor de cada propuesta y su numero de casa y agregar a locals.proposals
                    Community.Citizen.findById(response.locals.proposals[j].author, function(err, citizen) {
                        response.locals.proposals[j].authorName = `${citizen.firstName} ${citizen.lastName} ${citizen.secondLastName}`;
                        Community.Home.findById(citizen.home, function(err, home) {
                            
                            response.locals.proposals[j].houseNumber = home.innerNumber;
                            if(j == response.locals.proposals.length-1){
                                response.render('mycommunity');
                            }
                        })
                    })
                });
            }
        });
    });
};

const postCreateProposal = (request, response) => {
    //create proposal and populate it

    Community.Community.findById(request.user.community, function(err,community) {
        const proposal = new Law.Proposal({
                proposal: request.body.proposalText,
                type: request.body.typeProposal,
                author: request.user.id,
                votesInFavor: 0,
                votesAgainst: 0,
                law: request.body.law, //for when deleting law
                community: request.user.community
            });
            proposal.save();
            community.proposals.push(proposal);
            community.save();
            
    });
    response.redirect('/mycommunity');
};

//dealing with voting on feed proposals:
const postFeedVote = (request, response) =>{
    //Check if user has voted on this proposal: check list of votes in proposal and see if any of them has a citizen.id that matches the current user
    Law.Proposal.findById(request.params.proposalId, function(err, proposal) {
        //[^]Make sure there isn't double voting search for votes and if any matches request.user.id in proposal.votes[i].id
        Law.Vote.find({'_id' : { $in: proposal.votes}}, function(err, votes) {
                if(votes.find(vote => vote.citizen == request.user.id)){
                    console.log('already voted');
                    response.redirect('/profile');
                }else{
                    //[^]If no double voting create a new Vote object with proposal & user information and append it to the proposal
                    const inFavor = (request.body.voteButton === 'accept') ? true : false;
                    const vote = new Law.Vote({
                        citizen: request.user.id,
                        inFavor: inFavor,
                        proposal: request.params.proposalId 
                    });
                    prevVotesInFavor = proposal.votesInFavor;
                    prevVotesAgainst = proposal.votesAgainst;

                    if (vote.inFavor == true){
                        proposal.votesInFavor = prevVotesInFavor + 1;
                    } else if(vote.inFavor == false) {
                        proposal.votesAgainst = prevVotesAgainst + 1;
                    } else{
                        throw 'Unexpected value for proposals.votesInFavor';
                    }
                    
                    //[^]save the vote
                    vote.save();
                    //[^] add vote to proposals.votes & save
                    //[^}test to make vote
                    //[^]test to try to make vote twice to see it doesn't get made and I get redirected
                    //[^]add vote to list of votes in proposal
                    proposal.votes.push(vote);
                    proposal.save();
                    
                    //[]Check to see if this vote gave the proposal majority.
                    ////How many homes in this community?
                    Community.Community.findById(proposal.community, function(err, community) {
                        amountHomes = community.innerHomes.length;
                        console.log('amount of homes: ', amountHomes);
                        //votesInFavor = votes.find(vote => vote.inFavor == true).length;
                        //console.log(votedinFavor);
                        response.redirect('/mycommunity');
                    });
                    
                    //[]count votes in favor, count votes against, 
                    //[]if votes in favor/amountHouses > .5 => proposal passes, give it date it passed & create law
                    //[]Add law to the community's laws. 
                    //Redirect back to /mycommunity
                    
                };
            });
    });
};

module.exports = {
    getCommunityFeed,
    postCreateProposal,
    postFeedVote,
}

