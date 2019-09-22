const mysql = require( 'mysql' );
class Database {
	constructor( config ) {
		//this.connection = mysql.createConnection( config );
        this.connection  = mysql.createPool( config );
	}
	query( sql, args ) {
		return new Promise( ( resolve, reject ) => {
			this.connection.query( sql, args, ( err, rows ) => {
				if ( err )
					return reject( err );
				resolve( rows );
			} );
		} );
	}
    async queryRow(sql, args) {
        let result = await this.query(sql, args);
        if (result.length > 0) {
            return result[0];
        }
        return result;
    }
    async queryField(field, sql, args) {
        let row = await this.queryRow(sql, args);
        if (row !== undefined) {
            return row[field];
        }
        return row;
    }
	close() {
		return new Promise( ( resolve, reject ) => {
			this.connection.end( err => {
				if ( err )
					return reject( err );
				resolve();
			} );
		} );
	}
}

module.exports = Database;
