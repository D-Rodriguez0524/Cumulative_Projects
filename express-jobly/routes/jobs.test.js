"use strict";

const request = require("supertest");

const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    testJobIds,
    u1Token,
    adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /jobs", () => {
    test("works: admin", async () => {
        const resp = await request(app)
            .post("/jobs")
            .send({
                companyHandle: "c1",
                title: "new-job",
                salary: 100,
                equity: "0.2"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                companyHandle: "c1",
                title: "new-job",
                salary: 100,
                equity: "0.2"
            }
        });
    });

    test("for unauth users", async () => {
        const resp = await request(app)
            .post('/jobs')
            .send({
                companyHandle: "c1"
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("bad request", async () => {
        const resp = await request(app)
            .post('/jobs')
            .send({
                companyHandle: "c1",
                title: "new-job",
                salary: "something",
                equity: "0.2"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

describe("GET /jobs", () => {
    test("works: users", async () => {
        const resp = await request(app).get(`/jobs`);
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J3",
                    salary: 3,
                    equity: null,
                    companyHandle: "c1",
                    companyName: "C1",
                }
            ]
        });
    });

    test("works: filtering", async () => {
        const resp = await request(app)
            .get('/jobs')
            .query({ hasEquity: true });
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: "J1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1",
                },
                {
                    id: expect.any(Number),
                    title: "J2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c1",
                    companyName: "C1",
                }
            ]
        });
    });

    test("works: filtering on 2 filters", async function () {
        const resp = await request(app)
            .get(`/jobs`)
            .query({ minSalary: 2, title: "3" });
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: "J3",
                    salary: 3,
                    equity: null,
                    companyHandle: "c1",
                    companyName: "C1",
                },
            ],
        },
        );
    });

    test("fail: invalid filter key", async function () {
        const resp = await request(app)
            .get(`/jobs`)
            .query({ minSalary: 2, nope: "nope" });
        expect(resp.statusCode).toEqual(400);
    });

});

describe("GET /jobs/:id", () => {
    test("works: users", async () => {
        const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "J1",
                salary: 1,
                equity: "0.1",
                company: {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img"
                },
            },
        });
    });

    test("fail: no job found", async () => {
        const resp = await request(app).get('/jobs/0');
        expect(resp.statusCode).toEqual(404);
    });
});

describe("PATCH /jobs/:id", () => {
    test("works: for admin", async () => {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "new-job"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "new-job",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1",
            }
        });
    });

    test("fail: unauth user", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                title: "new-job",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("fail: no such job", async function () {
        const resp = await request(app)
            .patch(`/jobs/0`)
            .send({
                handle: "new",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("fail: invalid data", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
                salary: "something",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

describe("DELETE /jobs/:id", () => {
    test("works: for admin", async () => {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({ deleted: testJobIds[0] });
    });

    test("fail: no such job", async function () {
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test("fail: unauth user", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });
});