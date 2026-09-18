import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import GroupDetails from './pages/GroupDetails';
import CreateExpense from './pages/CreateExpense';
import ExpenseDetails from './pages/ExpenseDetails';
import Expenses from './pages/Expenses';
import ActivityFeed from './pages/ActivityFeed';
import EditExpense from './pages/EditExpense';

function App() {
  return (
    <BrowserRouter>
      <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route path="/groups" element={<Groups />} />
    <Route path="/groups/create" element={<CreateGroup />} />
    <Route path="/groups/join" element={<JoinGroup />} />

    <Route path="/groups/:groupId" element={<GroupDetails />} />

    <Route
        path="/groups/:groupId/expenses"
        element={<Expenses />}
    />

    <Route
        path="/groups/:groupId/expenses/new"
        element={<CreateExpense />}
    />
    <Route
    path="/groups/:groupId/expenses/:expenseId/edit"
    element={<EditExpense />}
    />
    <Route
        path="/groups/:groupId/expenses/:expenseId"
        element={<ExpenseDetails />}
    />

    <Route
        path="/groups/:groupId/activities"
        element={<ActivityFeed />}
    />
</Routes>
    </BrowserRouter>
  );
}

export default App;