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
  getLedgerByVendorNameForEntryPage
} from '../controllers/ledgerController.js'

const router = express.Router()

router.get('/vendors', getVendorsList)
router.post('/addnew', createLedger)
router.put('/update/:id', updateLedger)
router.delete('/delete/:id', deleteLedger)
router.get('/ledgersbydate', getLedgersByDateRange)
router.get('/ledgers/all', getAllLedgers)
router.get('/ledgers/:company', getLedgersByCompany);
router.get('/companies', getAllCompaniesWithLedgers);
router.get('/entry/:company', getLedgerByVendorNameForEntryPage)


export default router;
