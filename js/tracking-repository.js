module.exports.insertNew = function( client, q, obj, _cback, _cbackKo ) {
	return client.query( q.Create( q.Collection( "tracking" ), obj ) )
    .then((response) => {
		console.log('success', response)
		/* Success! return the response with statusCode 200 */
		//return response;
		_cback.call();
	}).catch((error) => {
		console.log('error', error)
		/* Error! return the error with statusCode 400 */
		/*
		return {
			error: error
		}
		*/
		_cbackKo.call();
    })
}

module.exports.getById = function( client, q, id ) {	
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
      return response;
    }).catch((error) => {
      console.log('error', error)
      /* Error! return the error with statusCode 400 */
      return {
        error: error
      }
    })
};

module.exports.updateByRef = function( client, q, ref, obj ) {
	return client.query( q.Update( ref, obj ) )
	.then((response) => {
      console.log('success', response)
      /* Success! return the response with statusCode 200 */
      return response;
    }).catch((error) => {
      console.log('error', error)
      /* Error! return the error with statusCode 400 */
      return {
        error: error
      }
    })
}
