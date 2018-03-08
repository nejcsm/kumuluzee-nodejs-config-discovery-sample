let customers = [];

export const getCustomers = () => {
  return customers;
}

export const getCustomerId = (customerId) => {
  const [customer] = customers.filter(customer => customer.id === customerId);
  return customer || null;
}

export const addCustomer = (customer) => {
  customers.push(customer);
}

export const deleteCustomer = (customerId) => {
  customers = customers.filter(customer => customer.id !== customerId);
}