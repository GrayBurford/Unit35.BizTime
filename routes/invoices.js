

const express = require("express");
const { response } = require("../app");
let router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");


router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(`SELECT * FROM invoices`);
        return res.json({ "invoices" : result.rows[0] });
    } catch (error) {
        return next(error);
    }
})


router.get('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const dbQuery = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);

        if (dbQuery.rows.length === 0) {
            throw new ExpressError(`That invoice ID (${id}) doesn't exist or isn't valid. Please try again.`, 404)
        }

        return res.json({ "invoice" : dbQuery.rows[0] });
    } catch (error) {
        return next(error);
    }
})


router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);

        return res.status(201).json({ "invoice" : result.rows[0] });
    } catch (error) {
        return next(error);
    }
})


router.patch('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const { amt } = req.body;
        const currQuery = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);

        if (currQuery.rows.length === 0) {
            throw new ExpressError(`That invoice ID (${id}) doesn't exist or isn't valid. Please try again.`, 404)
        }

        const currPaidDate = currResult.rows[0].paid_date;
        if (!currPaidDate && paid) {
          paidDate = new Date();
        } else if (!paid) {
          paidDate = null
        } else {
          paidDate = currPaidDate;
        }

        const result = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]); 

        return res.json({ "invoice" : result.rows[0] });
    } catch (error) {
        return next(error);
    }
})


router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING id`, [id]);

        if (result.rows.length === 0) {
            throw new ExpressError(`That invoice ID (${id}) doesn't exist or isn't valid. Please try again.`, 404)
        }

        return res.json({ "status" : "deleted" })
    } catch (error) {
        return next(error);
    }
})

module.exports = router;