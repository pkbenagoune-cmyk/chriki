import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post('/auth/register', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        password: password
      });

      console.log('Inscription réussie', response.data);

      navigate('/login');

    } catch (error) {
      console.error('Erreur lors de l inscription', error);
    }
  };

  return (
    <div>
      <h1>Créer un compte</h1>

      <form onSubmit={handleRegister}>

        <div>
          <label>Prénom</label>
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </div>

        <div>
          <label>Nom</label>
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label>Téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
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
          S'inscrire
        </button>

      </form>
    </div>
  );
}

export default Register;