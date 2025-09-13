import React, { useState, useEffect } from 'react';
import { X, Edit3, Tag, Calendar, User, FileText, CheckCircle, AlertCircle, Save, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { Task } from '../../../types';

interface TaskEditTopSheetProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate?: () => void;
}

export const TaskEditTopSheet: React.FC<TaskEditTopSheetProps> = ({
  task,
  isOpen,
  onClose,
  onTaskUpdate,
}) => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<'partial' | 'complete'>('partial');
  const [selectedModificationType, setSelectedModificationType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // États pour modifications partielles
  const [priority, setPriority] = useState(task.priorite);
  const [deadline, setDeadline] = useState(task.deadline ? task.deadline.split('T')[0] : '');
  const [description, setDescription] = useState(task.description);
  const [department, setDepartment] = useState(task.department);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>(task.tags || []);

  // États pour modification complète
  const [completeForm, setCompleteForm] = useState({
    description: task.description,
    responsable: task.responsable,
    priorite: task.priorite,
    statut: task.statut,
    deadline: task.deadline ? task.deadline.split('T')[0] : '',
    department: task.department,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setPriority(task.priorite);
      setDeadline(task.deadline ? task.deadline.split('T')[0] : '');
      setDescription(task.description);
      setDepartment(task.department);
      setTags(task.tags || []);
      setSelectedModificationType('');
      setCompleteForm({
        description: task.description,
        responsable: task.responsable,
        priorite: task.priorite,
        statut: task.statut,
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        department: task.department,
      });
      setErrors({});
      setSuccessMessage('');
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handlers pour modifications partielles
  const handlePriorityChange = async () => {
    if (priority === task.priorite) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8002/tasks/${task.id}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });

      if (response.ok) {
        showSuccess('Priorité mise à jour avec succès');
        onTaskUpdate?.();
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch {
      setErrors({ priority: 'Erreur lors de la mise à jour de la priorité' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeadlineChange = async () => {
    const currentDeadline = task.deadline ? task.deadline.split('T')[0] : '';
    if (deadline === currentDeadline) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8002/tasks/${task.id}/deadline?deadline=${deadline || ''}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        showSuccess('Deadline mise à jour avec succès');
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        onTaskUpdate?.();
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch {
      setErrors({ deadline: 'Erreur lors de la mise à jour de la deadline' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDescriptionChange = async () => {
    if (description === task.description) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8002/tasks/${task.id}/description`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        showSuccess('Description mise à jour avec succès');
        onTaskUpdate?.();
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch {
      setErrors({ description: 'Erreur lors de la mise à jour de la description' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepartmentChange = async () => {
    if (department === task.department) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8002/tasks/${task.id}/department?department=${encodeURIComponent(department)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        showSuccess('Département mis à jour avec succès');
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        onTaskUpdate?.();
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch {
      setErrors({ department: 'Erreur lors de la mise à jour du département' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = async (tagToAdd?: string) => {
    const tag = tagToAdd || newTag.trim();
    if (!tag) return;

    if (tags.includes(tag)) {
      setErrors({ tags: 'Ce tag existe déjà' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8002/tasks/${task.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: [tag] }),
      });

      if (response.ok) {
        const newTags = [...tags, tag];
        setTags(newTags);
        setNewTag('');
        showSuccess('Tag ajouté avec succès');
        onTaskUpdate?.();
      } else {
        throw new Error('Erreur lors de l\'ajout du tag');
      }
    } catch {
      setErrors({ tags: 'Erreur lors de l\'ajout du tag' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8002/tasks/${task.id}/tags/${tagToRemove}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        showSuccess('Tag supprimé avec succès');
        onTaskUpdate?.();
      } else {
        throw new Error('Erreur lors de la suppression du tag');
      }
    } catch {
      setErrors({ tags: 'Erreur lors de la suppression du tag' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteUpdate = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8002/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: completeForm.description,
          responsable: completeForm.responsable,
          priorite: completeForm.priorite,
          statut: completeForm.statut,
          deadline: completeForm.deadline || null,
          department: completeForm.department,
        }),
      });

      if (response.ok) {
        showSuccess('Tâche mise à jour complètement avec succès');
        onTaskUpdate?.();
        onClose();
      } else {
        throw new Error('Erreur lors de la mise à jour complète');
      }
    } catch {
      setErrors({ complete: 'Erreur lors de la mise à jour complète' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-gradient-to-r from-red-500 to-pink-600 text-white border-red-300';
      case 'high': return 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-orange-300';
      case 'medium': return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-yellow-300';
      case 'low': return 'bg-gradient-to-r from-green-400 to-blue-400 text-white border-green-300';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-300';
      case 'in_progress': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300';
      case 'pending': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-300';
      case 'rejected': return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header avec gradient professionnel */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Modifier la tâche</h2>
            <p className="text-sm text-gray-600">#{task.id.slice(-8)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Success Message avec style amélioré */}
      {successMessage && (
        <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Section Tabs avec style professionnel */}
      <div className="flex border-b bg-gray-50/50">
        <button
          onClick={() => setActiveSection('partial')}
          className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
            activeSection === 'partial'
              ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Edit3 className="w-4 h-4" />
            <span>Modifications partielles</span>
          </div>
        </button>
        <button
          onClick={() => setActiveSection('complete')}
          className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
            activeSection === 'complete'
              ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50/50'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Modification complète</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto">

            {activeSection === 'partial' && (
              <div className="space-y-6">

                {/* Sélecteur de type de modification avec style amélioré */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Edit3 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Type de modification</h3>
                  </div>
                  <select
                    value={selectedModificationType}
                    onChange={(e) => setSelectedModificationType(e.target.value)}
                    className="w-full min-w-0 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 text-sm"
                    style={{ maxWidth: '100%' }}
                  >
                    <option value="">Sélectionner un type de modification...</option>
                    <option value="priority">🎯 Modifier la priorité</option>
                    <option value="deadline">📅 Modifier la deadline</option>
                    <option value="description">📝 Modifier la description</option>
                    <option value="department">🏢 Modifier le département</option>
                    <option value="tags">🏷️ Gérer les tags</option>
                  </select>
                </div>

                {/* Formulaire selon le type sélectionné avec style amélioré */}
                {selectedModificationType === 'priority' && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Modifier la priorité</h3>
                          <p className="text-sm text-gray-600">Sélectionnez le nouveau niveau de priorité</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'low', label: 'Faible', icon: '📝', color: 'from-green-400 to-blue-400' },
                          { value: 'medium', label: 'Moyenne', icon: '⚠️', color: 'from-yellow-400 to-orange-400' },
                          { value: 'high', label: 'Élevée', icon: '⚡', color: 'from-orange-400 to-red-500' },
                          { value: 'urgent', label: 'Urgente', icon: '🚨', color: 'from-red-500 to-pink-600' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setPriority(option.value as "urgent" | "high" | "medium" | "low")}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              priority === option.value
                                ? `bg-gradient-to-r ${option.color} text-white border-transparent shadow-lg transform scale-105`
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{option.icon}</span>
                              <div className="text-left">
                                <div className={`font-semibold ${priority === option.value ? 'text-white' : 'text-gray-900'}`}>
                                  {option.label}
                                </div>
                                <div className={`text-xs ${priority === option.value ? 'text-white/80' : 'text-gray-500'}`}>
                                  Priorité {option.value === 'low' ? 'basse' : option.value === 'medium' ? 'moyenne' : option.value === 'high' ? 'élevée' : 'urgente'}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handlePriorityChange}
                        disabled={isSubmitting || priority === task.priorite}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Modification en cours...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Modifier la priorité</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                    {errors.priority && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-sm text-red-700">{errors.priority}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedModificationType === 'deadline' && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Modifier la deadline</h3>
                          <p className="text-sm text-gray-600">Définissez la nouvelle date limite</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                        />
                      </div>
                      <button
                        onClick={handleDeadlineChange}
                        disabled={isSubmitting || deadline === (task.deadline ? task.deadline.split('T')[0] : '')}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Modification en cours...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Modifier la deadline</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                    {errors.deadline && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-sm text-red-700">{errors.deadline}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedModificationType === 'description' && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Modifier la description</h3>
                          <p className="text-sm text-gray-600">Mettez à jour la description de la tâche</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 resize-none"
                        placeholder="Nouvelle description..."
                      />
                      <button
                        onClick={handleDescriptionChange}
                        disabled={isSubmitting || description === task.description}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Modification en cours...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Modifier la description</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                    {errors.description && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-sm text-red-700">{errors.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedModificationType === 'department' && (
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Modifier le département</h3>
                          <p className="text-sm text-gray-600">Changez l'équipe responsable</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                          placeholder="Nouveau département..."
                        />
                      </div>
                      <button
                        onClick={handleDepartmentChange}
                        disabled={isSubmitting || department === task.department}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Modification en cours...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Modifier le département</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                    {errors.department && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-sm text-red-700">{errors.department}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedModificationType === 'tags' && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Gérer les tags</h3>
                        <p className="text-sm text-gray-600">Ajoutez ou supprimez des tags pour organiser la tâche</p>
                      </div>
                    </div>

                    {/* Tags existants */}
                    {tags.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Tags actuels</h4>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-medium shadow-sm"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                disabled={isSubmitting}
                                className="hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ajouter un nouveau tag */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Ajouter un tag</h4>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                            placeholder="Nouveau tag..."
                          />
                        </div>
                        <button
                          onClick={() => handleAddTag()}
                          disabled={isSubmitting || !newTag.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <div className="flex items-center space-x-2">
                            {isSubmitting ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            <span>Ajouter</span>
                          </div>
                        </button>
                      </div>
                    </div>
                    {errors.tags && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className="text-sm text-red-700">{errors.tags}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Message si aucun type sélectionné avec style amélioré */}
                {!selectedModificationType && (
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Edit3 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez un type de modification</h3>
                    <p className="text-gray-600">Choisissez le type de modification que vous souhaitez effectuer depuis le menu déroulant ci-dessus.</p>
                  </div>
                )}

              </div>
            )}

            {activeSection === 'complete' && (
              <div className="space-y-6">

                {/* Formulaire complet avec style amélioré */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-sm">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Save className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Modification complète de la tâche</h3>
                      <p className="text-sm text-gray-600">Modifiez tous les aspects de la tâche en une fois</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={completeForm.description}
                        onChange={(e) => setCompleteForm({...completeForm, description: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 resize-none"
                        placeholder="Description de la tâche..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Responsable *
                      </label>
                      <input
                        type="text"
                        value={completeForm.responsable}
                        onChange={(e) => setCompleteForm({...completeForm, responsable: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                        placeholder="Nom du responsable..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Priorité *
                        </label>
                        <select
                          value={completeForm.priorite}
                          onChange={(e) => setCompleteForm({...completeForm, priorite: e.target.value as "urgent" | "high" | "medium" | "low"})}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 ${getPriorityColor(completeForm.priorite)}`}
                        >
                          <option value="low">📝 Faible</option>
                          <option value="medium">⚠️ Moyenne</option>
                          <option value="high">⚡ Élevée</option>
                          <option value="urgent">🚨 Urgente</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Statut *
                        </label>
                        <select
                          value={completeForm.statut}
                          onChange={(e) => setCompleteForm({...completeForm, statut: e.target.value as "pending" | "in_progress" | "completed" | "rejected"})}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 ${getStatusColor(completeForm.statut)}`}
                        >
                          <option value="pending">⏳ En attente</option>
                          <option value="in_progress">🔄 En cours</option>
                          <option value="completed">✅ Terminée</option>
                          <option value="rejected">❌ Rejetée</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Deadline
                        </label>
                        <input
                          type="date"
                          value={completeForm.deadline}
                          onChange={(e) => setCompleteForm({...completeForm, deadline: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Département
                        </label>
                        <input
                          type="text"
                          value={completeForm.department}
                          onChange={(e) => setCompleteForm({...completeForm, department: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                          placeholder="Département..."
                        />
                      </div>
                    </div>
                  </div>

                  {errors.complete && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-700">{errors.complete}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCompleteUpdate}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center space-x-2">
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Mise à jour...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Mettre à jour complètement</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
