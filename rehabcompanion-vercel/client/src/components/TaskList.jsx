import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { taskAPI } from '../services/api';

const TASK_TYPE_CONFIG = {
  MEDICATION: {
    icon: 'pi-heart-fill',
    color: 'text-red-500',
    label: 'Medicación',
    xp: 20
  },
  ACTIVITY: {
    icon: 'pi-bolt',
    color: 'text-blue-500',
    label: 'Actividad',
    xp: 30
  },
  EMOTION_CHECK: {
    icon: 'pi-sun',
    color: 'text-yellow-500',
    label: 'Check Emocional',
    xp: 15
  }
};

const TaskList = ({ onTaskComplete, toastRef }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState(null);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [moodAlert, setMoodAlert] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await taskAPI.getTasks(today);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las tareas',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskClick = (task) => {
    if (task.isCompleted) return;

    setSelectedTask(task);
    setNotes('');
    setMood(null);
    setShowNotesDialog(true);
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    if (selectedTask.type === 'EMOTION_CHECK' && !mood) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Por favor, selecciona cómo te sientes',
        life: 3000
      });
      return;
    }

    try {
      setCompleting(true);
      const response = await taskAPI.completeTask(selectedTask.id, { notes, mood });

      // Update task list
      setTasks(tasks.map(t =>
        t.id === selectedTask.id
          ? { ...t, isCompleted: true, completedAt: new Date(), mood: mood }
          : t
      ));

      // Check for mood alerts
      if (response.data.moodAlert) {
        setMoodAlert(response.data.moodAlert);
      } else {
        // Show normal success message
        const { reward, garden } = response.data;
        toastRef.current?.show({
          severity: 'success',
          summary: reward.leveledUp ? '🎉 ¡Nivel Subido!' : '✅ Tarea Completada',
          detail: reward.leveledUp
            ? `¡Tu planta evolucionó a ${garden.plantStage}! +${reward.xpGained} XP`
            : `+${reward.xpGained} XP ganados`,
          life: 5000
        });
      }

      // Notify parent to refresh garden
      if (onTaskComplete) {
        onTaskComplete();
      }

      setShowNotesDialog(false);
      setSelectedTask(null);
      setNotes('');
      setMood(null);
    } catch (error) {
      console.error('Error completing task:', error);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo completar la tarea',
        life: 3000
      });
    } finally {
      setCompleting(false);
    }
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;

  if (loading) {
    return (
      <Card className="shadow-lg">
        <div className="flex items-center justify-center h-64">
          <i className="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Tareas de Hoy
          </h2>
          <Badge
            value={`${completedCount}/${totalCount}`}
            severity={completedCount === totalCount ? 'success' : 'info'}
            className="text-lg"
          />
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="pi pi-inbox text-4xl mb-4"></i>
            <p>No tienes tareas para hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const config = TASK_TYPE_CONFIG[task.type];

              return (
                <div
                  key={task.id}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border-2 
                    transition-all cursor-pointer
                    ${task.isCompleted
                      ? 'bg-green-50 border-green-200 opacity-75'
                      : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-md'
                    }
                  `}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Checkbox
                      checked={task.isCompleted}
                      disabled={task.isCompleted}
                      className="pointer-events-none"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <i className={`pi ${config.icon} ${config.color}`}></i>
                        <span className="text-xs text-gray-500 font-semibold">
                          {config.label}
                        </span>
                      </div>
                      <p className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!task.isCompleted && (
                      <Badge
                        value={`+${config.xp} XP`}
                        severity="success"
                        className="text-xs"
                      />
                    )}
                    {task.isCompleted && (
                      <i className="pi pi-check-circle text-green-500 text-xl"></i>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {completedCount === totalCount && totalCount > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-lg p-4 text-center">
            <i className="pi pi-trophy text-yellow-500 text-3xl mb-2"></i>
            <p className="font-bold text-gray-800">
              ¡Todas las tareas completadas!
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Excelente trabajo hoy 🌟
            </p>
          </div>
        )}
      </Card>

      {/* Notes Dialog */}
      <Dialog
        visible={showNotesDialog}
        onHide={() => setShowNotesDialog(false)}
        header="Completar Tarea"
        style={{ width: '90vw', maxWidth: '500px' }}
        modal
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-800 mb-2">
                {selectedTask.description}
              </p>
              <p className="text-sm text-gray-600">
                Ganarás <strong className="text-primary-600">
                  +{TASK_TYPE_CONFIG[selectedTask.type].xp} XP
                </strong> al completar esta tarea
              </p>
            </div>

            {selectedTask.type === 'EMOTION_CHECK' && (
              <div className="py-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ¿Cómo te sientes hoy?
                </label>
                <div className="flex justify-between gap-2">
                  <Button
                    type="button"
                    label="Mal"
                    icon="pi pi-frown"
                    className={`flex-1 p-button-outlined ${mood === 'mal' ? 'p-button-danger bg-red-50' : 'p-button-secondary'}`}
                    onClick={() => setMood('mal')}
                  />
                  <Button
                    type="button"
                    label="Bien"
                    icon="pi pi-minus-circle"
                    className={`flex-1 p-button-outlined ${mood === 'bien' ? 'p-button-info bg-blue-50' : 'p-button-secondary'}`}
                    onClick={() => setMood('bien')}
                  />
                  <Button
                    type="button"
                    label="Excelente"
                    icon="pi pi-smile"
                    className={`flex-1 p-button-outlined ${mood === 'excelente' ? 'p-button-success bg-green-50' : 'p-button-secondary'}`}
                    onClick={() => setMood('excelente')}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <InputTextarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="¿Cómo te sentiste? ¿Alguna observación?"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tus notas están encriptadas y solo tú puedes verlas
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                label="Cancelar"
                outlined
                severity="secondary"
                onClick={() => setShowNotesDialog(false)}
                disabled={completing}
              />
              <Button
                label={completing ? 'Completando...' : 'Completar'}
                icon="pi pi-check"
                loading={completing}
                onClick={handleCompleteTask}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Mood Alert Dialog */}
      <Dialog
        visible={!!moodAlert}
        onHide={() => setMoodAlert(null)}
        header={moodAlert?.type === 'EMERGENCY' ? '🚨 Apoyo Requerido' : '🌟 Ánimo'}
        style={{ width: '90vw', maxWidth: '450px' }}
        modal
      >
        <div className="text-center py-4">
          <i className={`pi ${moodAlert?.type === 'EMERGENCY' ? 'pi-exclamation-triangle text-red-500' : 'pi-heart text-primary-500'} text-5xl mb-4`}></i>
          <p className="text-lg text-gray-800 mb-6 px-2">
            {moodAlert?.message}
          </p>

          {moodAlert?.type === 'EMERGENCY' && moodAlert.contactPhone && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600 font-semibold mb-1">Contacto de Emergencia:</p>
              <p className="text-xl font-bold text-gray-800">{moodAlert.contactName}</p>
              <a href={`tel:${moodAlert.contactPhone}`} className="text-2xl font-bold text-red-600 hover:underline">
                {moodAlert.contactPhone}
              </a>
            </div>
          )}

          <Button
            label="Entendido"
            className="w-full"
            onClick={() => setMoodAlert(null)}
          />
        </div>
      </Dialog>
    </>
  );
};

export default TaskList;
