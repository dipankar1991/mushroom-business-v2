import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import Dashboard from '@/features/dashboard/Dashboard';
import TransactionForm from '@/features/transactions/TransactionForm';
import TransactionList from '@/features/transactions/TransactionList';
import BatchList from '@/features/batches/BatchList';
import BatchForm from '@/features/batches/BatchForm';
import BatchDetails from '@/features/batches/BatchDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<TransactionForm />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="/batches" element={<BatchList />} />
          <Route path="/batches/new" element={<BatchForm />} />
          <Route path="/batches/:id" element={<BatchDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
