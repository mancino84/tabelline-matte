//import fetch from 'node-fetch';
/* Import faunaDB sdk */
const faunadb = require('faunadb')
const q = faunadb.query;
const client = new faunadb.Client({
	secret: process.env.FAUNA_DB_KEY,
	endpoint: 'https://db.eu.fauna.com/'
})

//const repository = require( '../js/tracking-repository.js' );

/*
async function getObj( id ) {	
	return await fetch('http://localhost:9000/crud-get?id=' + id, {
		method: 'GET',		
	})
	.then((response) => {
		if( response.status > 299 ) throw { error: "invalid response code " + response.status };
		return response.json()
	})
	.then((result) => {
		console.log('Success:', result);
		return result;
	})
	.catch((error) => {
		console.error('Error:', error);
		return { error: "crud-get?id=" + id  + " fetch error" };
	});
}
*/

function validateAnswers( givenAnswers, correctAnswers ) {
	if( givenAnswers.length != correctAnswers.length ) return { error: "incorrect answers length" }
	let ok = 0;
	for( let i = 0; i < givenAnswers.length; i++ ) {
		if( givenAnswers[i] == correctAnswers[i] ) {
			ok++;
		}
	}
	return { score: ( ok / givenAnswers.length ) * 100 }
}


exports.handler = async function ( event, context ) {	

	const req = JSON.parse( event.body );
	const id = req.id;

	return client.query( 	
		/*
		Map(
		  Paginate(
			Match(Index("tracking_find_by_id"), "6158f842-789e-4bea-a952-7bf061673ba9")
		  ),
		  Lambda("rec", Get(Var("rec")))
		)
		*/
		q.Map( 
			q.Paginate(
				q.Match( q.Index( "tracking_find_by_id" ), id )
			),
			q.Lambda( "rec", q.Get(q.Var("rec") ) ) )
	)
    .then((response) => {
		
		console.log('success', response)
		/* Success! return the response with statusCode 200 */
		const data = response.data[0].data;
		const result = validateAnswers( req.givenAnswers, data.answers );
		
		return client.query( q.Update( response.data[0].ref, { data: { result: result, givenAnswers: req.givenAnswers } } ) )
		.then((response) => {
			console.log('success', response)
			return {
				statusCode: 200,
				headers: {
					"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
					"Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
				},
				body: JSON.stringify( result )
			};
		})
		.catch((error) => {
			console.log('error', error)
			/* Error! return the error with statusCode 400 */
			return {
				statusCode: 500,
				headers: {
					"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
					"Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
				},
				body: JSON.stringify( error ),
			};	
		})
		
		
		return response;
		
    }).catch((error) => {
		console.log('error', error)		
		return {
			statusCode: 500,
			headers: {
				"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
				"Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
			},
			body: JSON.stringify( error ),
		};	
    })

};