import { v4 as uuidv4 } from 'uuid';
//import fetch from 'node-fetch';
const faunadb = require('faunadb')
const q = faunadb.query;
const client = new faunadb.Client({
	secret: process.env.FAUNA_DB_KEY,
	
	endpoint: 'https://db.eu.fauna.com/'
})

const repository = require( '../js/tracking-repository.js' );

function buildTabelline() {
	let ops = [];
	let results = [];
	let base = 1;
	for( let i = 1; i <= 10; i++ ) {	
		for( let j = base++; j <= 10; j++ ) {
			ops.push( { op1: i, op2: j, res: i * j } );
		}
	}	
	return { 
		ops: shuffle( ops ), 
		results: [...new Set( ops.map( value => value.res ) )] 
	};	
}

function shuffle( arr ) {
	return arr.map(value => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(({ value }) => value);
}

exports.handler = async function ( event, context ) {	
	const tabelline = buildTabelline();
	const result = {
		id: uuidv4(),
		questions: [],
		answers: [],
		clientData: {
			ip: ( event.headers['x-nf-client-connection-ip'] !== '::1' ? event.headers['x-nf-client-connection-ip'] : '127.0.0.1' ),
			userAgent: event.headers['user-agent']
		}
	};
		
	for( let i = 0; i < 32; i++ ) {
		const idx = Math.floor( Math.random() * tabelline.ops.length );
		const question = tabelline.ops[ idx ];
		tabelline.ops.splice( idx, 1 );
		const answers = tabelline.results.filter( e => e != question.res );
		const idxAnswer1 = Math.floor( Math.random() * answers.length );
		const answer1 = answers[ idxAnswer1 ];
		answers.splice( idxAnswer1, 1 );
		const answer2 = answers[ Math.floor( Math.random() * answers.length ) ];
		const ops = shuffle( [ question.op1, question.op2 ] );
		const results = shuffle( [ question.res, answer1, answer2 ] );
		result.questions.push( { op1: ops[0], op2: ops[1], ans1: results[0], ans2: results[1], ans3: results[2] } );
		result.answers.push( question.res );
	}
	
	repository.insertNew( client, q, { data: JSON.parse( JSON.stringify( result ) ) } );
	
	/*
	fetch('http://localhost:9000/crud-save', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify( result )
	})
	.then((response) => response.json())
	.then((result) => {
		console.log('Success:', result);		
	})
	.catch((error) => {
		console.error('Error:', error);
	});
	*/
	
	
	result.answers = undefined;
	result.clientData = undefined;
	
	return {
		statusCode: 200,
		headers: {
			"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
			"Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
		},
		body: JSON.stringify( result ),
	};
};