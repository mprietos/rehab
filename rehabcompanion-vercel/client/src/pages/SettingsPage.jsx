import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { authAPI } from '../services/api';

const SettingsPage = () => {
    const navigate = useNavigate();
    const toast = useRef(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData({
                firstName: parsedUser.firstName || '',
                lastName: parsedUser.lastName || '',
                emergencyContactName: parsedUser.emergencyContactName || '',
                emergencyContactPhone: parsedUser.emergencyContactPhone || ''
            });
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await authAPI.updateProfile(formData);

            // Update local storage
            const updatedUser = { ...user, ...response.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Perfil actualizado correctamente',
                life: 3000
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar el perfil',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
            <Toast ref={toast} />

            <div className="w-full max-w-2xl">
                {/* Botón volver */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-4 px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center gap-2 font-medium transition-colors"
                >
                    <span style={{ fontSize: '1.2rem' }}>←</span>
                    Volver al Dashboard
                </button>

                {/* Card principal */}
                <div
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '2.5rem',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        border: '2px solid #e5e7eb'
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <span className="text-4xl">⚙️</span>
                        <h1 className="text-3xl font-bold text-gray-800">Configuración</h1>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Datos personales */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span style={{ fontSize: '1.2rem' }}>👤</span>
                                Datos Personales
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nombre
                                    </label>
                                    <InputText
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full"
                                        style={{ padding: '0.75rem', fontSize: '1rem' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Apellidos
                                    </label>
                                    <InputText
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full"
                                        style={{ padding: '0.75rem', fontSize: '1rem' }}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Separador */}
                        <div style={{ borderTop: '2px solid #e5e7eb', margin: '1.5rem 0' }}></div>

                        {/* Contacto de emergencia */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span style={{ fontSize: '1.2rem' }}>🚨</span>
                                Contacto de Emergencia
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="emergencyContactName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nombre del Contacto
                                    </label>
                                    <InputText
                                        id="emergencyContactName"
                                        value={formData.emergencyContactName}
                                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                        className="w-full"
                                        placeholder="Ej: María García"
                                        style={{ padding: '0.75rem', fontSize: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="emergencyContactPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Teléfono
                                    </label>
                                    <InputText
                                        id="emergencyContactPhone"
                                        value={formData.emergencyContactPhone}
                                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                        className="w-full"
                                        placeholder="Ej: +34 600 000 000"
                                        style={{ padding: '0.75rem', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                    borderRadius: '8px',
                                    border: '1px solid #fbbf24'
                                }}
                            >
                                <p className="text-sm text-gray-700 flex items-center gap-2">
                                    <span>💡</span>
                                    <span>Este contacto se mostrará si registras varios días con bajo estado de ánimo.</span>
                                </p>
                            </div>
                        </div>

                        {/* Botón guardar */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                label={loading ? 'Guardando...' : 'Guardar Cambios'}
                                icon="pi pi-save"
                                loading={loading}
                                className="w-full"
                                style={{
                                    padding: '0.875rem',
                                    fontSize: '1.05rem',
                                    fontWeight: '600',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    border: 'none'
                                }}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 mt-6 font-medium">
                    Mantén tu información actualizada para una mejor experiencia
                </p>
            </div>
        </div>
    );
};

export default SettingsPage;
