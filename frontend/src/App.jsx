


import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import GroupDetails from './pages/GroupDetails';

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

      </Routes>
    </BrowserRouter>
  );
}

export default App;
