

const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');
let router = new express.Router();
const db = require('../db');


router.get('/', async (request, response, next) => {
    try {
        const dbQuery = await db.query(`SELECT name, description, code FROM companies`);
        return response.json({ "companies" : dbQuery.rows[0] });
    } catch (error) {
        return next(e);
    }
});


router.get('/:code', async (request, response, next) => {
    try {
        const { code } = request.params;

        const compQuery = await db.query(`SELECT code, name, description FROM companies WHERE code=$1`, [code]);

        const invQuery = await db.query(`SELECT id FROM invoices WHERE comp_code=$1`, [code])

        if (compQuery.rows.length === 0) {
            throw new ExpressError(`That company code (${code}) doesn't exist or isn't valid. Please try again.`, 404)
        }

        // if (invQuery.rows.length === 0) {
        //     throw new ExpressError(`That invoice code (${code}) doesn't exist or isn't valid. Please try again.`, 404)
        // }

        const companyResult = compQuery.rows[0];
        const invoiceResult = invQuery.rows;

        companyResult.invoices = invoiceResult.map(inv => inv.id);

        return response.json({ "company" : companyResult });
    } catch (error) {
        return next(error);
    }
})


router.post('/', async (request, response, next) => {
    try {
        const { name, description } = request.body;
        const code = slugify(name, {lower : true});
        
        const dbQuery = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return response.status(201).json({ "company" : dbQuery.rows[0] });
    } catch (error) {
        return next(error);
    }
});


router.patch('/:code', async (request, response, next) => {
    try {
        const {name, description } = request.body;
        const code = request.params.code;
        
        const dbQuery = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING name, description, code`, [name, description, code]);

        if (dbQuery.rows.length === 0) {
            throw new ExpressError(`That company code (${code}) doesn't exist or isn't valid. Please try again.`, 404)
        }
        return response.json({ "company" : dbQuery.rows[0] });
    } catch (error) {
        return next(error);
    }
})


router.delete('/:code', async (request, response, next) => {
    try {
        const { code } = request.params;
        const dbQuery = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code, name, description`, [code]);

        if (dbQuery.rows.length === 0) {
            throw new ExpressError(`That company code (${code}) doesn't exist or isn't valid. Please try again.`, 404)
        }
        return response.send({ "status" : "deleted"})
    } catch (error) {
        return next(error);
    }
})


module.exports = router;

