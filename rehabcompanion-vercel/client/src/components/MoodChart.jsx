import React from 'react';

const MoodChart = ({ moodChecks = [] }) => {
  if (!moodChecks || moodChecks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          Estado de Ánimo Diario
        </h3>
        <div className="text-center py-8 text-gray-500">
          <p>Aún no hay datos de estado de ánimo.</p>
          <p className="text-sm mt-2">Completa tu primer registro hoy para ver tu progreso.</p>
        </div>
      </div>
    );
  }

  const getMoodEmoji = (level) => {
    switch (level) {
      case 'GOOD': return '😊';
      case 'NEUTRAL': return '😐';
      case 'BAD': return '😔';
      default: return '❓';
    }
  };

  const getMoodColor = (level) => {
    switch (level) {
      case 'GOOD': return '#10b981';
      case 'NEUTRAL': return '#f59e0b';
      case 'BAD': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  const getMoodLabel = (level) => {
    switch (level) {
      case 'GOOD': return 'Bien';
      case 'NEUTRAL': return 'Regular';
      case 'BAD': return 'Mal';
      default: return 'N/A';
    }
  };

  // Get last 7 days
  const last7Days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    last7Days.push(date);
  }

  // Map mood checks to dates
  const moodByDate = {};
  moodChecks.forEach(check => {
    const checkDate = new Date(check.date);
    checkDate.setHours(0, 0, 0, 0);
    const dateKey = checkDate.toISOString().split('T')[0];
    moodByDate[dateKey] = check;
  });

  // Calculate stats
  const goodDays = moodChecks.filter(m => m.moodLevel === 'GOOD').length;
  const neutralDays = moodChecks.filter(m => m.moodLevel === 'NEUTRAL').length;
  const badDays = moodChecks.filter(m => m.moodLevel === 'BAD').length;
  const total = moodChecks.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span style={{ fontSize: '1.5rem' }}>📊</span>
        Estado de Ánimo Diario
      </h3>

      {/* Timeline */}
      <div className="mb-6">
        <div className="flex items-end justify-between gap-2 h-32 mb-2">
          {last7Days.map((date, index) => {
            const dateKey = date.toISOString().split('T')[0];
            const mood = moodByDate[dateKey];
            const height = mood ? '100%' : '30%';

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-lg flex items-end justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    height: height,
                    backgroundColor: mood ? `${getMoodColor(mood.moodLevel)}20` : '#f3f4f6',
                    border: `2px solid ${mood ? getMoodColor(mood.moodLevel) : '#e5e7eb'}`,
                    minHeight: '40px'
                  }}
                  title={mood ? `${getMoodLabel(mood.moodLevel)}${mood.notes ? ` - ${mood.notes}` : ''}` : 'Sin registro'}
                >
                  <span style={{ fontSize: mood ? '2rem' : '1rem', paddingBottom: '0.25rem' }}>
                    {mood ? getMoodEmoji(mood.moodLevel) : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Days labels */}
        <div className="flex justify-between gap-2">
          {last7Days.map((date, index) => {
            const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
            const dayNumber = date.getDate();
            const isToday = date.toDateString() === today.toDateString();

            return (
              <div key={index} className="flex-1 text-center">
                <div className={`text-xs ${isToday ? 'font-bold text-green-600' : 'text-gray-600'}`}>
                  {dayName}
                </div>
                <div className={`text-xs ${isToday ? 'font-bold text-green-600' : 'text-gray-500'}`}>
                  {dayNumber}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="border-t-2 border-gray-100 pt-4">
        <p className="text-sm text-gray-600 mb-3 font-medium">Últimos {total} registros:</p>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.5rem' }}>😊</span>
            <span className="text-sm text-gray-700">
              <strong style={{ color: '#10b981' }}>{goodDays}</strong> días bien
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.5rem' }}>😐</span>
            <span className="text-sm text-gray-700">
              <strong style={{ color: '#f59e0b' }}>{neutralDays}</strong> días regular
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.5rem' }}>😔</span>
            <span className="text-sm text-gray-700">
              <strong style={{ color: '#ef4444' }}>{badDays}</strong> días mal
            </span>
          </div>
        </div>

        {goodDays > badDays && total >= 3 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <span>🌟</span>
              <span>¡Vas muy bien! Tienes más días positivos que negativos.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodChart;
