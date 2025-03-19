import express from 'express'
import {
  createLedger,
  updateLedger,
  deleteLedger,
  getLedgersByCompany,
  getLedgersByDateRange,
  getAllLedgers,
  getAllCompaniesWithLedgers,
  getVendorsList,
  // generateLedgerReport,
  getLedgerByVendorNameForEntryPage
} from '../controllers/ledgerController.js'

const router = express.Router()
// router.get('/ledger-report/:vendor_name', generateLedgerReport)
router.get('/vendors', getVendorsList)
router.post('/addnew', createLedger)
router.put('/update/:id', updateLedger)
router.delete('/delete/:id', deleteLedger)
// router.get('/ledgers/:vendor_name', getLedgersByCompany)
router.get('/ledgersbydate', getLedgersByDateRange)
router.get('/ledgers/all', getAllLedgers)
// router.get('/companies', getAllCompaniesWithLedgers)
router.get('/company/:vendor_name', getLedgersByCompany)
router.get('/ledgers/:company', getLedgersByCompany);
router.get('/companies', getAllCompaniesWithLedgers);
router.get('/entry/:company', getLedgerByVendorNameForEntryPage)
// router.get('/ledger-report/:vendor_name', generateLedgerReport)


export default router;
