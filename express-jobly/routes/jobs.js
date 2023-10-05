"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobFilterSchema = require("../schemas/jobFilter.json");
const { json } = require("body-parser");

const router = express.Router({ mergeParams: true });

/** POST / { job } => { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.post('/',
    ensureAdmin,
    async (req, res, next) => {
        try {
            const validator = jsonschema.validate(req.body, jobNewSchema);

            if (!validator.valid) {
                const errs = validator.errors.map(e => e.stack);
                throw new BadRequestError(errs);
            }

            const job = await Job.create(req.body);
            return res.status(201).json({ job });
        }
        catch (error) {
            return next(error)
        }
    });

/** GET / =>
 *   { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }
 *
 * Can provide search filter in query:
 * - minSalary
 * - hasEquity (true returns only jobs with equity > 0, other values ignored)
 * - title (will find case-insensitive, partial matches)

 * Authorization required: none
 */
router.get('/', async (req, res, next) => {
    const q = req.query;
    // arrives as a string but we want a int/boolean
    if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
    q.hasEquity = q.hasEquity === "true";

    try {
        const validator = jsonschema.validate(q, jobFilterSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const jobs = await Job.findAll(q);
        return res.json({ jobs });
    }
    catch (error) {
        return next(error)
    }
});

/** GET /[jobId] => { job }
 *
 * Returns { id, title, salary, equity, company }
 *   where company is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */
router.get('/:jobId', async (req, res, next) => {
    try {
        const job = await Job.get(req.params.jobId);
        return res.json({ job });
    }
    catch (error) {
        return next(error)
    }
});

/** PATCH /[jobId]  { fld1, fld2, ... } => { job }
 *
 * Data can include: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */
router.patch('/:jobId',
    ensureAdmin,
    async (req, res, next) => {
        try {
            const validator = jsonschema.validate(req.body, jobUpdateSchema);
            if (!validator.valid) {
                const errs = validator.errors.map(e => e.stack);
                throw new BadRequestError(errs);
            }

            const job = await Job.update(req.params.jobId, req.body);
            return res.json({ job });
        }
        catch (error) {
            return next(error)
        }
    });

/** DELETE /[handle]  =>  { deleted: id }
 *
 * Authorization required: admin
 */
router.delete('/:jobId',
    ensureAdmin,
    async (req, res, next) => {
        try {
            await Job.remove(req.params.jobId);
            return res.json({ deleted: req.params.jobId });
        }
        catch (error) {
            return next(error)
        }
    });

module.exports = router;