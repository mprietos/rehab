import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Badge } from 'primereact/badge';
import GardenWidget from '../components/GardenWidget';
import TaskList from '../components/TaskList';
import MoodCheckDialog from '../components/MoodCheckDialog';
import MoodChart from '../components/MoodChart';
import { authAPI, messageAPI, moodAPI } from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const toast = useRef(null);
  const hasLoadedRef = useRef(false);
  const refreshGardenRef = useRef(null);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [moodHistory, setMoodHistory] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [doctorId, setDoctorId] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));

    // Only fetch messages and mood once on initial mount
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchDoctorId();
      fetchMessages();
      checkMoodStatus();
    }
  }, [navigate]);

  const fetchDoctorId = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.doctor?.id) {
        setDoctorId(response.data.doctor.id);
      }
    } catch (error) {
      console.error('Error fetching doctor id:', error);
    }
  };

  const fetchMessages = async (silent = false) => {
    try {
      const response = await messageAPI.getMessages();
      const allMessages = response.data.messages;

      // Find the doctor from messages
      const doctorMessage = allMessages.find(msg => msg.sender?.role === 'DOCTOR' || msg.receiver?.role === 'DOCTOR');
      if (doctorMessage) {
        const doctor = doctorMessage.sender?.role === 'DOCTOR' ? doctorMessage.sender : doctorMessage.receiver;
        setDoctorId(doctor.id);

        // Fetch full conversation with doctor
        const conversationResponse = await messageAPI.getConversation(doctor.id);
        setMessages(conversationResponse.data.messages);
        setUnreadCount(conversationResponse.data.unreadCount);
      } else {
        setMessages(allMessages);
        setUnreadCount(response.data.unreadCount);
      }

      // Show unread messages toast only on initial load
      if (!silent && response.data.unreadCount > 0) {
        toast.current?.show({
          severity: 'info',
          summary: 'Mensajes nuevos',
          detail: `Tienes ${response.data.unreadCount} mensaje(s) de tu doctor`,
          life: 5000
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await messageAPI.markAsRead(messageId);
      // Actualizar solo el estado local sin llamar fetchMessages
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo marcar el mensaje como leído',
        life: 3000
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessageText.trim() || !doctorId) return;

    try {
      setSendingMessage(true);
      await messageAPI.sendMessage(doctorId, newMessageText);
      setNewMessageText('');

      // Refresh messages
      await fetchMessages(true);

      toast.current?.show({
        severity: 'success',
        summary: 'Mensaje enviado',
        detail: 'Tu mensaje ha sido enviado al doctor',
        life: 3000
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo enviar el mensaje',
        life: 3000
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const checkMoodStatus = async () => {
    try {
      const response = await moodAPI.getHistory(7);
      setMoodHistory(response.data);

      // Show mood dialog if not submitted today
      if (!response.data.todaySubmitted) {
        setTimeout(() => setShowMoodDialog(true), 1000);
      }
    } catch (error) {
      console.error('Error checking mood status:', error);
    }
  };

  const handleMoodSubmit = async (moodData) => {
    try {
      const response = await moodAPI.submitMood(moodData);

      setShowMoodDialog(false);

      // Show success message with XP earned
      const xpEarned = response.data.xpEarned || 5;
      toast.current?.show({
        severity: 'success',
        summary: '¡Gracias!',
        detail: `Tu estado de ánimo ha sido registrado. +${xpEarned} XP ganados! 🌟`,
        life: 4000
      });

      // Show emergency notification if needed
      if (response.data.emergencyNotified) {
        toast.current?.show({
          severity: 'info',
          summary: 'Notificación enviada',
          detail: 'Hemos notificado a tu doctor. Estamos aquí para apoyarte.',
          life: 5000
        });
      }

      // Refresh mood history
      await checkMoodStatus();

      // Trigger garden refresh with a small delay to ensure backend updated
      setTimeout(() => {
        if (refreshGardenRef.current && typeof refreshGardenRef.current === 'function') {
          console.log('Refreshing garden after mood check...');
          refreshGardenRef.current();
        }
      }, 500);
    } catch (error) {
      console.error('Error submitting mood:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo registrar tu estado de ánimo',
        life: 3000
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleTaskComplete = () => {
    // Trigger garden refresh
    if (refreshGardenRef.current && typeof refreshGardenRef.current === 'function') {
      refreshGardenRef.current();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 flex items-center justify-center">
        <i className="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
      <Toast ref={toast} />

      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌱</span>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  adiccare
                </h1>
                <p className="text-sm text-gray-600">
                  Hola, {user.firstName} 👋
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={() => setShowMessagesDialog(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                  title="Mensajes"
                  style={{ fontSize: '1.3rem' }}
                >
                  💬
                </button>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                title="Ajustes"
                style={{ fontSize: '1.3rem' }}
              >
                ⚙️
              </button>
              <button
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                title="Cerrar Sesión"
                style={{ fontSize: '1.3rem' }}
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Garden Widget */}
          <div className="order-1 lg:order-1">
            <GardenWidget onUpdate={(fn) => { refreshGardenRef.current = fn; }} />
          </div>

          {/* Task List */}
          <div className="order-2 lg:order-2">
            <TaskList
              onTaskComplete={handleTaskComplete}
              toastRef={toast}
            />
          </div>
        </div>

        {/* Mood Chart */}
        <div className="mt-6">
          <MoodChart moodChecks={moodHistory?.moodChecks || []} />
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <i className="pi pi-heart-fill text-red-500 text-4xl mb-3"></i>
            <h3 className="font-bold text-gray-800 mb-2">Medicación</h3>
            <p className="text-sm text-gray-600">
              Completa tus medicaciones para ganar <strong className="text-primary-600">+20 XP</strong>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <i className="pi pi-bolt text-blue-500 text-4xl mb-3"></i>
            <h3 className="font-bold text-gray-800 mb-2">Actividades</h3>
            <p className="text-sm text-gray-600">
              Realiza ejercicios y actividades para ganar <strong className="text-primary-600">+30 XP</strong>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <i className="pi pi-sun text-yellow-500 text-4xl mb-3"></i>
            <h3 className="font-bold text-gray-800 mb-2">Check Emocional</h3>
            <p className="text-sm text-gray-600">
              Registra tu estado de ánimo diario para ganar <strong className="text-primary-600">+5 XP</strong>
            </p>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">
            ¡Cada pequeño paso cuenta! 🌟
          </h2>
          <p className="text-lg opacity-90">
            Tu recuperación es como cuidar un jardín: con paciencia, dedicación y cariño diario,
            verás cómo floreces.
          </p>
        </div>
      </div>

      {/* Messages Dialog */}
      <Dialog
        visible={showMessagesDialog}
        onHide={() => setShowMessagesDialog(false)}
        header="Conversación con tu Doctor"
        style={{ width: '600px', maxHeight: '80vh' }}
        modal
      >
        <div className="flex flex-col" style={{ height: '500px' }}>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4 p-2" style={{ maxHeight: '400px' }}>
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <i className="pi pi-inbox text-4xl mb-3"></i>
                <p>No tienes mensajes</p>
              </div>
            ) : (
              messages.map((message) => {
                const isFromMe = message.fromId === user?.id;
                const sender = isFromMe ? message.sender : message.sender;
                const isUnread = !isFromMe && !message.isRead;

                return (
                  <div
                    key={message.id}
                    className={`mb-3 flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${isFromMe
                          ? 'bg-blue-500 text-white'
                          : isUnread
                            ? 'bg-green-50 border-2 border-green-300'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <strong className="text-sm">
                          {isFromMe ? 'Tú' : `Dr. ${sender?.firstName} ${sender?.lastName}`}
                        </strong>
                        <small className={`text-xs ml-2 ${isFromMe ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(message.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {isUnread && (
                        <Button
                          label="Marcar como leído"
                          icon="pi pi-check"
                          size="small"
                          text
                          onClick={() => handleMarkAsRead(message.id)}
                          className="mt-2 p-0"
                          style={{ color: 'inherit' }}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <div className="border-t pt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Escribe un mensaje a tu doctor..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!doctorId || sendingMessage}
              />
              <Button
                icon="pi pi-send"
                onClick={handleSendMessage}
                disabled={!newMessageText.trim() || !doctorId || sendingMessage}
                loading={sendingMessage}
                severity="info"
                style={{ padding: '0.5rem 1rem' }}
              />
            </div>
          </div>
        </div>
      </Dialog>

      {/* Mood Check Dialog */}
      <MoodCheckDialog
        visible={showMoodDialog}
        onHide={() => setShowMoodDialog(false)}
        onSubmit={handleMoodSubmit}
        consecutiveBadDays={moodHistory?.consecutiveBadDays || 0}
        user={user}
      />
    </div>
  );
};

export default DashboardPage;
