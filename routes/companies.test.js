

// Tell node we are in "test mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

// new company variable
let testCompany;

// Before every test, we want to create a new dummy company
beforeEach(async () => {
    await db.query(`DELETE FROM companies`);
    
    const result = await db.query(
        `INSERT INTO companies (code, name, description) 
        VALUES ('testcode', 'testcompany', 'Testing the description') 
        RETURNING code, name, description
        `);
    testCompany = result.rows[0];
})

// Delete all companies after each test
afterEach(async () => {
    await db.query(`DELETE FROM companies`);
})

// After ALL tests, stop connection to database
afterAll(async () => {
    await db.end();
})

// We should be set up to write tests
test('Hope this works', async () => {
    console.log(testCompany);
    expect(1).toBe(1);
})


describe('Test GET "/companies" route', () => {
    test("Retrieve array of companies, with testCompany as only company", async () => {
        const result = await request(app).get('/companies');
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({ companies : testCompany });
    })
})


describe('Test GET "/companies/:code" route', () => {
    test('Get a single specific company', async () => {
        const result = await request(app).get(`/companies/${testCompany.code}`);
        testCompany.invoices = [];
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({ company : testCompany });
    })
    test('Responds with 404 for invalid code', async () => {
        const result = await request(app).get(`/companies/thequickbrownfoxjumpsoverthelazydog`);
        expect(result.statusCode).toBe(404);
    })
})

// use .send() to send JSON body data
describe('Test POST "/companies" route', () => {
    test("Create a single new company", async () => {
        const result = await request(app).post('/companies').send({ "code" : "hitch", "name" : "Hitch 22", "description" : "Christopher Hitchens' company" });
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual({ "company" : { "code" : "hitch-22", "name" : "Hitch 22", "description" : "Christopher Hitchens' company" } })
    })
})


describe('Test PATCH "/companies/:code" route', () => {
    test("Updates a single company's info", async () => {
        const result = await request(app)
            .patch(`/companies/${testCompany.code}`)
            .send({"name" : "patchedcompanyname", "description" : "Patched description too"});
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({ "company" : {code : testCompany.code, "name" : "patchedcompanyname", "description" : "Patched description too"}})
    });
    test("Responds with 404 for invalid company code", async () => {
        const result = await request(app).patch(`/companies/askdfhua9sdfasdh8n9`).send({"name" : "patchedcompanyname", "description" : "Patched description too"});
        expect(result.statusCode).toBe(404);
    })
})


describe('Test DELETE "/companies/:code" route', () => {
    test('Delete a single company', async () => {
        const result = await request(app).delete(`/companies/${testCompany.code}`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({ "status" : "deleted"})
    })
})