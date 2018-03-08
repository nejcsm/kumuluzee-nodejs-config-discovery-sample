import express from 'express';
import bodyParser from 'body-parser';
import { getCustomers, getCustomerId, addCustomer, deleteCustomer } from './database.js';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', (req, res) => {
  const customers = getCustomers();
  res.status(200).json(customers);
})

router.get('/:customerId', (req, res) => {
  const customerId = req.params.customerId;
  const customer = getCustomerId(customerId);
  res.status(200).json(customer);
})

router.post('/', (req, res) => {
  if(req.body) {
    const { id, firstName, lastName } = req.body;
    addCustomer({ id, firstName, lastName });
    res.status(200).json();
  }
})

router.delete('/:customerId', (req, res) => {
  const customerId = req.params.customerId;
  deleteCustomer(customerId);
  res.status(200).json();
})


export default router;