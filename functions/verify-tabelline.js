//import fetch from 'node-fetch';
/* Import faunaDB sdk */
const faunadb = require('faunadb')
const q = faunadb.query;
const client = new faunadb.Client({
	secret: process.env.FAUNA_DB_KEY,
	endpoint: 'https://db.eu.fauna.com/'
})

const repository = require( '../js/tracking-repository.js' );

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

function updateObj( obj, result ) {
	
}

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
	console.log( "eeee", event );
	if( event.httpMethod != "POST" ) return {
		statusCode: 200,
		headers: {
			"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
			"Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS 
			"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
			"Access-Control-Allow-Headers": "X-PINGOTHER, Content-Type"
		},
		body: "ok"
	};

	//const req = { id: "6158f842-789e-4bea-a952-7bf061673ba9" };//JSON.parse(event.body);
	
	const req = JSON.parse(event.body);
	const obj = await repository.getById( client, q, req.id );	
	if( obj.error ) {
		return {
			statusCode: 500,
				headers: {
				"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
				"Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
			},
			body: JSON.stringify( obj ),
		};
	}
	const data = obj.data[0].data;
	const result = validateAnswers( req.givenAnswers, data.answers );
	repository.updateByRef( client, q, obj.data[0].ref, { data: { result: result, givenAnswers: req.givenAnswers } } );
	if( result.error ) {
		return {
			statusCode: 500,
				headers: {
				"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
				"Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
			},
			body: JSON.stringify( result ),
		};
	}
	
	return {
		statusCode: 200,
		headers: {
			"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
			"Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
		},
		body: JSON.stringify( result )
	};
};