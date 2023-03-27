
// Tell node we are in "test" mode
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

// new invoice variable
let testInvoice;

// Before every test, we want to create a new dummy invoice
beforeEach(async () => {
    // await db.query(`DELETE FROM invoices`);

    // const testCompany = await db.query(
    //     `INSERT INTO companies (code, name) VALUES ('testcode', 'testname')`
    // )
    
    const result = await db.query(
        `INSERT INTO invoices (comp_code, amt) 
        VALUES ('testcode', '9999') 
        RETURNING comp_code, amt, add_date, paid_date, paid, id
        `);
    testInvoice = result.rows[0];
})

// Delete all companies after each test
afterEach(async () => {
    await db.query(`DELETE FROM invoices`);
})

// After ALL tests, stop connection to database
afterAll(async () => {
    await db.end();
})

// We should be set up to write tests
test('Hope this works', async () => {
    console.log(testInvoice);
    expect(1).toBe(1);
})

describe('Test GET / route', () => {
    test("Retrieve array of invoices, with testInvoice as only invoice", async () => {
        const result = await request(app).get('/invoices');
        expect(result.statusCode).toBe(200);
        // expect(result.body).toEqual({ invoices : testInvoice });
        expect(result.body).toEqual({
            "invoices" : {
                "add_date" : expect.any(String),
                "amt" : testInvoice.amt,
                "comp_code" : testInvoice.comp_code,
                "id" : testInvoice.id,
                "paid" : testInvoice.paid,
                "paid_date" : testInvoice.paid_date
            }
        })
    })
})


describe('Test GET invoices/:id route', () => {
    test('Get a single specific invoice', async () => {
        const result = await request(app).get(`/invoices/${testInvoice.id}`);
        // testCompany.invoices = [];
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({
            "invoice" : {
                "add_date" : expect.any(String),
                "amt" : testInvoice.amt,
                "comp_code" : testInvoice.comp_code,
                "id" : testInvoice.id,
                "paid" : testInvoice.paid,
                "paid_date" : testInvoice.paid_date
            }
        });
    })
    test('Responds with 404 for invalid code', async () => {
        const result = await request(app).get(`/invoices/${985797569}`);
        expect(result.statusCode).toBe(404);
    })
})

// use .send() to send JSON body data
describe('Test POST / route', () => {
    test("Create a single new invoice", async () => {
        const result = await request(app).post('/invoices').send({
            "amt" : 12345,
            "comp_code" : testInvoice.comp_code
        });
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual({ "invoice" : {
            "add_date" : expect.any(String),
            "amt" : 12345,
            "comp_code" : testInvoice.comp_code,
            "id" : expect.any(Number),
            "paid" : false,
            "paid_date" : null
        }})
    })
})


// describe('Test PATCH "/companies/:code" route', () => {
//     test("Updates a single company's info", async () => {
//         const result = await request(app)
//             .patch(`/companies/${testCompany.code}`)
//             .send({"name" : "patchedcompanyname", "description" : "Patched description too"});
//         expect(result.statusCode).toBe(200);
//         expect(result.body).toEqual({ "company" : {code : testCompany.code, "name" : "patchedcompanyname", "description" : "Patched description too"}})
//     });
//     test("Responds with 404 for invalid company code", async () => {
//         const result = await request(app).patch(`/companies/askdfhua9sdfasdh8n9`).send({"name" : "patchedcompanyname", "description" : "Patched description too"});
//         expect(result.statusCode).toBe(404);
//     })
// })


// describe('Test DELETE "/companies/:code" route', () => {
//     test('Delete a single company', async () => {
//         const result = await request(app).delete(`/companies/${testCompany.code}`);
//         expect(result.statusCode).toBe(200);
//         expect(result.body).toEqual({ "status" : "deleted"})
//     })
// })