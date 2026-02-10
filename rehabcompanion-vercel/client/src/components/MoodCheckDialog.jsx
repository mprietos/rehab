import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';

const MoodCheckDialog = ({ visible, onHide, onSubmit, consecutiveBadDays = 0, user }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [showEmergencyPrompt, setShowEmergencyPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  const moods = [
    { value: 'GOOD', label: 'Bien', emoji: '😊', color: '#10b981', description: 'Me siento bien hoy' },
    { value: 'NEUTRAL', label: 'Regular', emoji: '😐', color: '#f59e0b', description: 'Un día normal' },
    { value: 'BAD', label: 'Mal', emoji: '😔', color: '#ef4444', description: 'No me siento bien' }
  ];

  const motivationalMessages = [
    "Recuerda que es normal tener días difíciles. Cada día es una nueva oportunidad.",
    "Tu esfuerzo diario cuenta. No estás solo en este camino.",
    "Los días complicados son parte del proceso. Sigue adelante, lo estás haciendo bien.",
    "Hoy puede ser difícil, pero mañana puede ser diferente. Un paso a la vez."
  ];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);

    // Si selecciona "mal" y tiene 2+ días consecutivos malos, mostrar prompt de emergencia
    if (mood === 'BAD' && consecutiveBadDays >= 2) {
      setShowEmergencyPrompt(true);
    } else {
      setShowEmergencyPrompt(false);
    }
  };

  const handleSubmit = async (requestEmergencyCall = false) => {
    if (!selectedMood) return;

    setLoading(true);
    await onSubmit({
      moodLevel: selectedMood,
      notes,
      requestedEmergencyCall: requestEmergencyCall
    });
    setLoading(false);

    // Reset
    setSelectedMood(null);
    setNotes('');
    setShowEmergencyPrompt(false);
  };

  const randomMotivationalMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="¿Cómo te encuentras hoy?"
      style={{ width: '600px', maxWidth: '95vw' }}
      modal
      closable={false}
    >
      <div className="space-y-6">
        {/* Mensaje motivacional si hay 2+ días malos */}
        {consecutiveBadDays >= 2 && (
          <div
            style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '12px',
              border: '2px solid #fbbf24',
              marginBottom: '1rem'
            }}
          >
            <p className="text-sm text-gray-800 flex items-center gap-2">
              <span style={{ fontSize: '1.5rem' }}>💛</span>
              <span style={{ fontWeight: '500' }}>{randomMotivationalMessage}</span>
            </p>
          </div>
        )}

        {/* Selector de estado de ánimo */}
        {!showEmergencyPrompt ? (
          <>
            <div>
              <p className="text-center text-gray-700 mb-4 text-lg font-medium">
                Selecciona cómo te sientes hoy:
              </p>

              <div className="grid grid-cols-3 gap-4">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => handleMoodSelect(mood.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedMood === mood.value
                        ? 'border-current scale-105 shadow-lg'
                        : 'border-gray-300 hover:border-gray-400 hover:scale-102'
                    }`}
                    style={{
                      borderColor: selectedMood === mood.value ? mood.color : undefined,
                      backgroundColor: selectedMood === mood.value ? `${mood.color}15` : 'white'
                    }}
                  >
                    <div className="text-center">
                      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{mood.emoji}</div>
                      <div style={{ fontWeight: '600', color: mood.color, marginBottom: '0.25rem' }}>
                        {mood.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {mood.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notas opcionales */}
            {selectedMood && (
              <div style={{ marginTop: '1.5rem' }}>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                  ¿Quieres añadir algo? (opcional)
                </label>
                <InputTextarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full"
                  placeholder="Escribe aquí cómo te sientes, qué te preocupa, etc..."
                  style={{ padding: '0.75rem', fontSize: '0.95rem' }}
                />
              </div>
            )}

            {/* Botón guardar */}
            {selectedMood && (
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  label="Guardar"
                  icon="pi pi-check"
                  onClick={() => handleSubmit(false)}
                  loading={loading}
                  style={{
                    padding: '0.75rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none'
                  }}
                />
              </div>
            )}
          </>
        ) : (
          /* Prompt de contacto de emergencia */
          <div className="space-y-4">
            <div
              style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                borderRadius: '12px',
                border: '2px solid #ef4444',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Notamos que llevas varios días sin sentirte bien
              </h3>
              <p className="text-gray-700 mb-4">
                Llevas {consecutiveBadDays + 1} días consecutivos con estado de ánimo bajo.
              </p>

              {user?.emergencyContactName && user?.emergencyContactPhone ? (
                <>
                  <p className="text-gray-700 mb-4">
                    ¿Te gustaría que te ayudáramos a contactar con tu persona de confianza?
                  </p>
                  <div
                    style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}
                  >
                    <p className="font-semibold text-gray-800">{user.emergencyContactName}</p>
                    <p className="text-gray-600">{user.emergencyContactPhone}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    También notificaremos a tu doctor para que esté al tanto.
                  </p>
                </>
              ) : (
                <p className="text-gray-700 mb-4">
                  Te recomendamos hablar con alguien de confianza. También notificaremos a tu doctor.
                </p>
              )}
            </div>

            {/* Notas adicionales */}
            <div>
              <label htmlFor="emergency-notes" className="block text-sm font-semibold text-gray-700 mb-2">
                ¿Quieres contarnos algo?
              </label>
              <InputTextarea
                id="emergency-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full"
                placeholder="Comparte cómo te sientes..."
                style={{ padding: '0.75rem', fontSize: '0.95rem' }}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                label="Ahora no"
                outlined
                onClick={() => handleSubmit(false)}
                loading={loading}
                style={{ padding: '0.75rem 1.5rem' }}
              />
              <Button
                label={user?.emergencyContactPhone ? "Sí, contactar" : "Notificar a mi doctor"}
                icon="pi pi-phone"
                onClick={() => handleSubmit(true)}
                loading={loading}
                severity="danger"
                style={{
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default MoodCheckDialog;
