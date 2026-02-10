import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { authAPI } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const toast = React.useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Por favor ingresa email y contraseña',
        life: 3000
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.login(email, password);

      // Store token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast.current?.show({
        severity: 'success',
        summary: 'Bienvenido',
        detail: `Hola ${response.data.user.firstName}!`,
        life: 2000
      });

      // Navigate to dashboard based on role
      setTimeout(() => {
        if (response.data.user.role === 'DOCTOR' || response.data.user.role === 'ADMIN') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error de autenticación',
        detail: 'Email o contraseña incorrectos',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Toast ref={toast} />

      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">🌱</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            adiccare
          </h1>
          <p className="text-lg text-gray-600">
            Tu Jardín de Recuperación
          </p>
        </div>

        {/* Card de login con mejor estilo */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: '2px solid #e5e7eb'
          }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full"
                disabled={loading}
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full"
                inputClassName="w-full"
                inputStyle={{ padding: '0.75rem', fontSize: '1rem' }}
                toggleMask
                feedback={false}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              label={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              icon="pi pi-sign-in"
              className="w-full"
              loading={loading}
              style={{
                padding: '0.875rem',
                fontSize: '1.05rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none'
              }}
            />
          </form>

          {/* Usuarios de prueba */}
          <div className="mt-6 pt-6" style={{ borderTop: '2px solid #e5e7eb' }}>
            <p className="text-sm text-gray-600 text-center mb-3 font-semibold">
              👤 Usuarios de prueba:
            </p>
            <div className="space-y-2 text-xs">
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #86efac'
              }}>
                <strong className="text-green-700">Paciente (Semilla):</strong>
                <div className="text-gray-600 mt-1">juan.perez@email.com / password123</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #86efac'
              }}>
                <strong className="text-green-700">Paciente (Brote):</strong>
                <div className="text-gray-600 mt-1">lucia.fernandez@email.com / password123</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #86efac'
              }}>
                <strong className="text-green-700">Doctor (Brote):</strong>
                <div className="text-gray-600 mt-1">dr.rodriguez@esperanza-rehab.es / password123</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #93c5fd'
              }}>
                <strong className="text-blue-700">Doctor:</strong>
                <div className="text-gray-600 mt-1">Crear desde panel de admin</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6 font-medium">
          Desarrollado con 💚 para tu recuperación
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
