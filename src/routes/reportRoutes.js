import express from 'express';
import { generateLedgerReport } from '../utils/generateLedgerReport.js';

const router = express.Router();

// Route to generate ledger report
router.get('/ledger-report/:vendor_name', generateLedgerReport);

export default router;
