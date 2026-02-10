import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Badge } from 'primereact/badge';
import { gardenAPI } from '../services/api';

const PLANT_STAGES = {
  SEED: {
    icon: '🌱',
    label: 'Semilla',
    color: '#86efac',
    description: 'Tu viaje está comenzando'
  },
  SPROUT: {
    icon: '🌿',
    label: 'Brote',
    color: '#4ade80',
    description: 'Estás creciendo cada día'
  },
  PLANT: {
    icon: '🪴',
    label: 'Planta',
    color: '#22c55e',
    description: 'Tu progreso es evidente'
  },
  FLOWER: {
    icon: '🌻',
    label: 'Flor',
    color: '#16a34a',
    description: '¡Has florecido completamente!'
  }
};

const GardenWidget = ({ onUpdate }) => {
  const [gardenState, setGardenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const fetchGarden = async () => {
    try {
      setLoading(true);
      const response = await gardenAPI.getGarden();

      // Check for level up animation
      if (gardenState && response.data.garden.plantStage !== gardenState.plantStage) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 600);
      }

      setGardenState(response.data.garden);
      setError(null);
    } catch (err) {
      setError('No se pudo cargar el jardín');
      console.error('Error fetching garden:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarden();
  }, []);

  // Allow parent to trigger refresh
  useEffect(() => {
    if (onUpdate) {
      onUpdate(fetchGarden);
    }
  }, [onUpdate]);

  if (loading && !gardenState) {
    return (
      <Card className="shadow-lg">
        <div className="flex items-center justify-center h-64">
          <i className="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <i className="pi pi-exclamation-triangle text-4xl mb-4"></i>
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  const currentStage = PLANT_STAGES[gardenState?.plantStage || 'SEED'];
  const progressPercentage = gardenState?.progressPercentage || 0;

  return (
    <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Tu Jardín de Recuperación
        </h2>

        {/* Plant Icon */}
        <div className={`plant-icon my-6 ${showLevelUp ? 'level-up-animation' : ''}`}>
          <span role="img" aria-label={currentStage.label}>
            {currentStage.icon}
          </span>
        </div>

        {/* Stage Info */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-1" style={{ color: currentStage.color }}>
            {currentStage.label}
          </h3>
          <p className="text-gray-600 text-sm italic">
            {currentStage.description}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-primary-600">
              {gardenState?.currentXP || 0}
            </div>
            <div className="text-xs text-gray-500">XP Total</div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              {gardenState?.streakDays || 0}
            </div>
            <div className="text-xs text-gray-500">Días Seguidos</div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {gardenState?.totalTasksCompleted || 0}
            </div>
            <div className="text-xs text-gray-500">Tareas Hechas</div>
          </div>
        </div>

        {/* Progress to Next Stage */}
        {gardenState?.plantStage !== 'FLOWER' && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Progreso a {PLANT_STAGES[getNextStage(gardenState?.plantStage)]?.label}
              </span>
              <span className="text-sm font-semibold text-primary-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <ProgressBar
              value={progressPercentage}
              showValue={false}
              className="h-3"
              style={{ backgroundColor: '#e5e7eb' }}
            />
            {gardenState?.nextStageXP && (
              <p className="text-xs text-gray-500 mt-1">
                {gardenState.nextStageXP - gardenState.currentXP} XP para siguiente nivel
              </p>
            )}
          </div>
        )}

        {gardenState?.plantStage === 'FLOWER' && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <i className="pi pi-star-fill text-yellow-500 text-2xl mb-2"></i>
            <p className="text-sm font-semibold text-gray-700">
              ¡Has alcanzado el nivel máximo!
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Sigue completando tareas para mantener tu jardín floreciendo
            </p>
          </div>
        )}

        {/* Streak Badge */}
        {gardenState?.streakDays >= 7 && (
          <div className="mt-4 flex justify-center">
            <Badge
              value={`🔥 ${gardenState.streakDays} días de racha!`}
              severity="warning"
              className="text-sm px-4 py-2"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

// Helper function to get next stage
const getNextStage = (currentStage) => {
  const stages = ['SEED', 'SPROUT', 'PLANT', 'FLOWER'];
  const currentIndex = stages.indexOf(currentStage);
  return stages[Math.min(currentIndex + 1, stages.length - 1)];
};

export default GardenWidget;
