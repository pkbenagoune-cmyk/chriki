import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });

      localStorage.setItem('token', response.data.token);

      console.log('Connexion réussie');

      navigate('/groups');

    } catch (error) {
      console.error('Erreur de connexion', error);
    }
  };

  return (
    <div>
      <h1>Connexion</h1>

      <form onSubmit={handleLogin}>

        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label>Mot de passe</label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit">
          Se connecter
        </button>

      </form>
    </div>
  );
}

export default Login;