let user = {};
var fs = new FamilySearch({
  environment: 'production',
  appKey: 'a02j000000KTRjpAAH',
  redirectUri: 'https://misbach.github.io/fs-surnames/'
  // redirectUri: 'http://localhost:5000/'
});

// Finish oauth flow by obtaining access_token
fs.oauthResponse(function() {
	$('.login').hide();

	// Get current user's tree ID
	fs.get('/platform/users/current', function(error, response) {
		// Get User's ancestry
		fs.get('/platform/tree/ancestry?generations=5&person='+response.data.users[0].personId, function(error, rsp) {
			user.tree = rsp.data.persons;
			deadHorizon(1);

			// Display Horizon along with surnames
			for (var i = 0; i < user.horizon.length; i++) {
				let portrait = "https://api.familysearch.org/platform/tree/persons/"+user.horizon[i].pid+"/portrait?default=http://fsicons.org/wp-content/uploads/2014/10/gender-unknown-circle-2XL.png&access_token="+fs.accessToken;
				$('.tree').append('<li><a href="https://www.familysearch.org/tree/person/'+user.horizon[i].pid+'" target="_blank"><img class="portrait" src="'+portrait+'"><h3 class="ancestor">'+user.horizon[i].name+'</h3></a><br /><div class="'+user.horizon[i].pid+' surnames"></div></li>');

				// Get surnames for each Horizon person
				fs.get('/platform/tree/ancestry?generations=4&person='+user.horizon[i].pid, function(error, rsp) {
					let surnames = {};
					// Get surnames
					for (var i = 2; i < rsp.data.persons.length; i++) {
						if (rsp.data.persons[i].names[0].nameForms[0].parts[1]) {
							let surname = rsp.data.persons[i].names[0].nameForms[0].parts[1].value;
							if (surnames[surname] == undefined) surnames[surname] = rsp.data.persons[i].id;
						}
					}

					// Display surnames
					$.each(surnames, function(key, value) {
					  $('.'+rsp.data.persons[0].id).append('<a href="https://www.familysearch.org/tree/person/'+value+'" target="_blank">'+key+"</a> ");
					});
				});
			}
		});
	});
});

// Dead Horizon
function deadHorizon(slot) {
  // Create horizon object if doesn't exit
  if (!user.horizon) user.horizon = [];
  
  // find node we're looking for in pedigree
  for (var i=0; i<user.tree.length; i++) {
    if (user.tree[i].display.ascendancyNumber == slot) {
      if (user.tree[i].living == false) {
        user.horizon.push(
          { name: user.tree[i].display.name,
            pid: user.tree[i].id,
            slot: user.tree[i].display.ascendancyNumber
          });
      } else {
        deadHorizon(slot * 2);
        deadHorizon(slot * 2 +1);
      }
    }
  }
  return
}		
