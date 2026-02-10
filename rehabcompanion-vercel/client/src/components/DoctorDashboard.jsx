import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { doctorAPI } from '../services/api';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const toast = useRef(null);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [taskDialog, setTaskDialog] = useState(false);
    const [messageDialog, setMessageDialog] = useState(false);
    const [createPatientDialog, setCreatePatientDialog] = useState(false);

    // Assignment form states
    const [newTask, setNewTask] = useState({ description: '', type: 'ACTIVITY' });
    const [newMessage, setNewMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // New patient form
    const [newPatient, setNewPatient] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    const taskTypes = [
        { label: 'Medicación', value: 'MEDICATION' },
        { label: 'Actividad', value: 'ACTIVITY' },
        { label: 'Check Emocional', value: 'EMOTION_CHECK' }
    ];

    const predefinedTasks = {
        MEDICATION: [
            { label: 'Tomar medicación matutina', value: 'Tomar medicación matutina' },
            { label: 'Tomar medicación vespertina', value: 'Tomar medicación vespertina' },
            { label: 'Tomar vitaminas', value: 'Tomar vitaminas' },
            { label: 'Revisar efectos secundarios', value: 'Revisar efectos secundarios' }
        ],
        ACTIVITY: [
            { label: 'Caminar 30 minutos', value: 'Caminar 30 minutos' },
            { label: 'Sesión de yoga o meditación', value: 'Sesión de yoga o meditación' },
            { label: 'Ejercicio cardiovascular', value: 'Ejercicio cardiovascular' },
            { label: 'Asistir a terapia grupal', value: 'Asistir a terapia grupal' },
            { label: 'Escribir en diario personal', value: 'Escribir en diario personal' },
            { label: 'Actividad recreativa', value: 'Actividad recreativa' },
            { label: 'Lectura de autoayuda', value: 'Lectura de autoayuda' }
        ],
        EMOTION_CHECK: [
            { label: 'Registrar estado emocional', value: 'Registrar estado emocional' },
            { label: 'Identificar triggers', value: 'Identificar triggers' },
            { label: 'Practicar respiración consciente', value: 'Practicar respiración consciente' },
            { label: 'Contactar con red de apoyo', value: 'Contactar con red de apoyo' }
        ]
    };

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await doctorAPI.getPatients();
            setPatients(response.data.patients);
        } catch (error) {
            console.error('Error fetching patients:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los pacientes' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const openPatientDetail = async (patient) => {
        try {
            const response = await doctorAPI.getPatientDetail(patient.id);
            setSelectedPatient(response.data.patient);
            setShowDetailDialog(true);
        } catch (error) {
            console.error('Error fetching patient details:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los detalles del paciente' });
        }
    };

    const handleAssignTask = async () => {
        if (!newTask.description) return;
        try {
            setSubmitting(true);
            await doctorAPI.assignTask(selectedPatient.id, newTask);
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Tarea asignada correctamente' });
            setTaskDialog(false);
            setNewTask({ description: '', type: 'ACTIVITY' });
        } catch (error) {
            console.error('Error assigning task:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo asignar la tarea' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage) return;
        try {
            setSubmitting(true);
            await doctorAPI.sendMessage(selectedPatient.id, newMessage);
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Mensaje enviado correctamente' });
            setMessageDialog(false);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar el mensaje' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleGenerateAIMessage = async () => {
        try {
            setSubmitting(true);
            const recentMood = selectedPatient.dailyTasks
                ?.filter(task => task.mood)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.mood;

            const response = await doctorAPI.generateMessage({
                patientName: selectedPatient.firstName,
                context: `Paciente en rehabilitación. Etapa actual: ${selectedPatient.gardenState?.plantStage}`,
                mood: recentMood || 'variable'
            });

            setNewMessage(response.data.message);
            toast.current?.show({
                severity: 'success',
                summary: 'Mensaje Generado',
                detail: response.data.source === 'ai' ? 'Mensaje generado por IA' : 'Mensaje sugerido',
                life: 3000
            });
        } catch (error) {
            console.error('Error generating message:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el mensaje' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreatePatient = async () => {
        if (!newPatient.email || !newPatient.password || !newPatient.firstName || !newPatient.lastName) {
            toast.current?.show({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor completa todos los campos obligatorios' });
            return;
        }

        try {
            setSubmitting(true);
            await doctorAPI.createPatient(newPatient);
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Paciente creado correctamente' });
            setCreatePatientDialog(false);
            setNewPatient({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                emergencyContactName: '',
                emergencyContactPhone: ''
            });
            fetchPatients();
        } catch (error) {
            console.error('Error creating patient:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.error || 'No se pudo crear el paciente' });
        } finally {
            setSubmitting(false);
        }
    };

    const statusBodyTemplate = (rowData) => {
        return <Tag value={rowData.isActive ? 'Activo' : 'Inactivo'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const stageBodyTemplate = (rowData) => {
        const stage = rowData.gardenState?.plantStage || 'SEED';
        let severity = 'info';
        switch (stage) {
            case 'SEED': severity = 'secondary'; break;
            case 'SPROUT': severity = 'info'; break;
            case 'PLANT': severity = 'success'; break;
            case 'FLOWER': severity = 'warning'; break;
        }
        return <Tag value={stage} severity={severity} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2 justify-center">
                <Button
                    icon="pi pi-eye"
                    label="Ver"
                    size="small"
                    outlined
                    severity="info"
                    onClick={() => openPatientDetail(rowData)}
                />
            </div>
        );
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <Toast ref={toast} />

            {/* Header */}
            <div className="bg-white shadow-md border-b-2 border-blue-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">👨‍⚕️</div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Panel de Doctor</h1>
                                <p className="text-sm text-gray-600">Gestión de Pacientes</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                label="Crear Paciente"
                                icon="pi pi-plus"
                                onClick={() => setCreatePatientDialog(true)}
                                severity="success"
                            />
                            <Button
                                label="Cerrar Sesión"
                                icon="pi pi-sign-out"
                                onClick={handleLogout}
                                outlined
                                severity="secondary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="container mx-auto px-4 py-6">

            <Card className="shadow-md">
                <DataTable value={patients} loading={loading} paginator rows={10} emptyMessage="No hay pacientes asignados">
                    <Column field="firstName" header="Nombre" sortable></Column>
                    <Column field="lastName" header="Apellido" sortable></Column>
                    <Column field="email" header="Email" sortable></Column>
                    <Column header="Estado Planta" body={stageBodyTemplate}></Column>
                    <Column header="Acciones" body={actionBodyTemplate}></Column>
                </DataTable>
            </Card>

            <Dialog visible={showDetailDialog} onHide={() => setShowDetailDialog(false)} header="Detalle de Paciente" style={{ width: '70vw' }} modal>
                {selectedPatient && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Información Personal</h3>
                            <p><strong>Nombre:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</p>
                            <p><strong>Email:</strong> {selectedPatient.email}</p>
                            <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
                                <h4 className="font-bold text-red-700">Contacto de Emergencia</h4>
                                <p>{selectedPatient.emergencyContactName}</p>
                                <p>{selectedPatient.emergencyContactPhone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Progreso</h3>
                            <div className="p-4 bg-green-50 rounded border border-green-200">
                                <p><strong>Etapa:</strong> {selectedPatient.gardenState?.plantStage}</p>
                                <p><strong>XP Actual:</strong> {selectedPatient.gardenState?.currentXp}</p>
                                <p><strong>Racha:</strong> {selectedPatient.gardenState?.streakDays} días</p>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button label="Asignar Tarea" icon="pi pi-check-square" onClick={() => setTaskDialog(true)} />
                                <Button label="Enviar Ánimo" icon="pi pi-heart" severity="help" onClick={() => setMessageDialog(true)} />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-4">
                            <h3 className="text-lg font-semibold mb-2">Historial Reciente</h3>
                            <DataTable value={selectedPatient.dailyTasks} paginator rows={5} size="small">
                                <Column field="date" header="Fecha" body={(rowData) => new Date(rowData.date).toLocaleDateString()}></Column>
                                <Column field="type" header="Tipo"></Column>
                                <Column field="description" header="Descripción"></Column>
                                <Column field="isCompleted" header="Completado" body={(rowData) => rowData.isCompleted ? <i className="pi pi-check text-green-500"></i> : <i className="pi pi-times text-red-500"></i>}></Column>
                                <Column field="mood" header="Estado de Ánimo"></Column>
                            </DataTable>
                        </div>

                        <div className="col-span-1 md:col-span-2 mt-4">
                            <h3 className="text-lg font-semibold mb-2">Historial de Estados de Ánimo</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                {selectedPatient.dailyTasks
                                    ?.filter(task => task.mood && task.isCompleted)
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .slice(0, 10)
                                    .map((task, index) => (
                                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                            <span className="text-sm text-gray-600">
                                                {new Date(task.date).toLocaleDateString('es-ES', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    task.mood === 'Bien' ? 'bg-green-100 text-green-700' :
                                                    task.mood === 'Regular' ? 'bg-yellow-100 text-yellow-700' :
                                                    task.mood === 'Mal' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {task.mood || 'No registrado'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                {!selectedPatient.dailyTasks?.some(task => task.mood) && (
                                    <p className="text-center text-gray-500 py-4">
                                        No hay registros de estado de ánimo
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            <Dialog
                visible={taskDialog}
                onHide={() => setTaskDialog(false)}
                header="Asignar Nueva Tarea"
                style={{ width: '550px' }}
                modal
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">
                            Tipo de Tarea
                        </label>
                        <select
                            value={newTask.type}
                            onChange={(e) => setNewTask({ ...newTask, type: e.target.value, description: '' })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {taskTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">
                            Tarea Predefinida
                        </label>
                        <select
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecciona una tarea...</option>
                            {predefinedTasks[newTask.type].map(task => (
                                <option key={task.value} value={task.value}>{task.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold text-gray-700">
                            O escribe una tarea personalizada
                        </label>
                        <InputText
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            className="w-full"
                            placeholder="Escribe una tarea personalizada..."
                        />
                    </div>

                    <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                        <Button
                            label="Asignar Tarea"
                            icon="pi pi-check"
                            loading={submitting}
                            onClick={handleAssignTask}
                            disabled={!newTask.description}
                            className="w-full"
                            style={{ padding: '0.75rem' }}
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog visible={messageDialog} onHide={() => setMessageDialog(false)} header="Enviar Mensaje de Ánimo" style={{ width: '500px' }} modal>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-2 font-semibold">Mensaje</label>
                        <InputTextarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            rows={6}
                            className="w-full"
                            placeholder="Escribe un mensaje de ánimo para tu paciente..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            label="Generar con IA"
                            icon="pi pi-sparkles"
                            outlined
                            severity="secondary"
                            loading={submitting}
                            onClick={handleGenerateAIMessage}
                            className="flex-1"
                        />
                        <Button
                            label="Enviar"
                            icon="pi pi-send"
                            severity="help"
                            loading={submitting}
                            onClick={handleSendMessage}
                            disabled={!newMessage}
                            className="flex-1"
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog visible={createPatientDialog} onHide={() => setCreatePatientDialog(false)} header="Crear Nuevo Paciente" style={{ width: '600px' }} modal>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 font-semibold">Nombre *</label>
                            <InputText
                                value={newPatient.firstName}
                                onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                                className="w-full"
                                placeholder="Nombre del paciente"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-semibold">Apellido *</label>
                            <InputText
                                value={newPatient.lastName}
                                onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                                className="w-full"
                                placeholder="Apellido del paciente"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold">Email *</label>
                        <InputText
                            value={newPatient.email}
                            onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                            className="w-full"
                            placeholder="email@ejemplo.com"
                            type="email"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold">Contraseña *</label>
                        <InputText
                            value={newPatient.password}
                            onChange={(e) => setNewPatient({ ...newPatient, password: e.target.value })}
                            className="w-full"
                            placeholder="Contraseña inicial"
                            type="password"
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-bold mb-3 text-red-700">Contacto de Emergencia</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2">Nombre</label>
                                <InputText
                                    value={newPatient.emergencyContactName}
                                    onChange={(e) => setNewPatient({ ...newPatient, emergencyContactName: e.target.value })}
                                    className="w-full"
                                    placeholder="Nombre del contacto"
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Teléfono</label>
                                <InputText
                                    value={newPatient.emergencyContactPhone}
                                    onChange={(e) => setNewPatient({ ...newPatient, emergencyContactPhone: e.target.value })}
                                    className="w-full"
                                    placeholder="+34 600 000 000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            outlined
                            onClick={() => setCreatePatientDialog(false)}
                            className="flex-1"
                        />
                        <Button
                            label="Crear Paciente"
                            icon="pi pi-check"
                            loading={submitting}
                            onClick={handleCreatePatient}
                            severity="success"
                            className="flex-1"
                        />
                    </div>
                </div>
            </Dialog>
            </div>
        </div>
    );
};

export default DoctorDashboard;
