const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/**
 * Generate SQL for a partial update operation.
 *
 * This function takes an object with data to update and an optional mapping
 * between JavaScript field names and SQL column names. It returns an object
 * with SQL fragments for the SET clause and an array of values for the query.
 *
 * @param {Object} dataToUpdate - Data to be updated (JavaScript object).
 * @param {Object} jsToSql - Optional mapping of JavaScript field names to SQL column names.
 * @returns {Object} An object with setCols (SQL fragment) and an array of values.
 * @throws {BadRequestError} If no data is provided for the update.
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
