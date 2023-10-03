const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
    test("works: 1 ", function () {
        const result = sqlForPartialUpdate(
            { firstName: "Test1" },
            { firstName: "first_name", lastName: "last_name" }
        );
        expect(result).toEqual({
            setCols: "\"first_name\"=$1",
            values: ["Test1"]
        });
    });

    test("works: with 2 entry", function () {
        const result = sqlForPartialUpdate({
            firstName: "Test1", lastName: "Testing1"
        },
            {
                firstName: "first_name", lastName: "last_name"
            });
        expect(result).toEqual({
            setCols: "\"first_name\"=$1, \"last_name\"=$2",
            values: ["Test1", "Testing1"]
        });
    });
});