const dbHandler = require('./dbHandler')();

function reset() {
	dbHandler.dropTables()
		.then((results) => { 
			console.log('Tables dropped');

			dbHandler.createTables()
				.then((results) => {
					console.log('Tables created\n');

				})
				.otherwise((err) => {
					console.log('2 err', err);
				});

		})
		.otherwise((err) => {
			console.log('1 err', err);
		});
}


reset();
