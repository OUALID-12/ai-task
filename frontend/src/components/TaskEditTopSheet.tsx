import React, { useState, useEffect } from 'react';
import { X, Edit3, Tag, Calendar, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import type { Task } from '../types';

interface TaskEditTopSheetProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Partial<Task>) => void;
}

export const TaskEditTopSheet: React.FC<TaskEditTopSheetProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeSection, setActiveSection] = useState<'partial' | 'complete'>('partial');
  const [selectedModificationType, setSelectedModificationType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // États pour modifications partielles
  const [priority, setPriority] = useState(task.priorite || '');
  const [deadline, setDeadline] = useState(task.deadline ? task.deadline.split('T')[0] : '');
  const [description, setDescription] = useState(task.description || '');
  const [department, setDepartment] = useState(task.department || '');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>(task.tags || []);

  // États pour modification complète
  const [completeForm, setCompleteForm] = useState({
    description: task.description || '',
    responsable: task.responsable || '',
    priorite: task.priorite || '',
    statut: task.statut || '',
    deadline: task.deadline ? task.deadline.split('T')[0] : '',
    department: task.department || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setPriority(task.priorite || '');
      setDeadline(task.deadline ? task.deadline.split('T')[0] : '');
      setDescription(task.description || '');
      setDepartment(task.department || '');
      setTags(task.tags || []);
      setSelectedModificationType('');
      setCompleteForm({
        description: task.description || '',
        responsable: task.responsable || '',
        priorite: task.priorite || '',
        statut: task.statut || '',
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        department: task.department || '',
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
      const response = await fetch(`http://localhost:8000/tasks/${task.id}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });

      if (response.ok) {
        showSuccess('Priorité mise à jour avec succès');
        onSave({ ...task, priorite: priority });
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
      const response = await fetch(`http://localhost:8000/tasks/${task.id}/deadline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deadline: deadline || null }),
      });

      if (response.ok) {
        showSuccess('Deadline mise à jour avec succès');
        onSave({ ...task, deadline: deadline ? `${deadline}T00:00:00` : '' });
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
      const response = await fetch(`http://localhost:8000/tasks/${task.id}/description`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        showSuccess('Description mise à jour avec succès');
        onSave({ ...task, description });
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
      const response = await fetch(`http://localhost:8000/tasks/${task.id}/department`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department }),
      });

      if (response.ok) {
        showSuccess('Département mis à jour avec succès');
        onSave({ ...task, department });
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch {
      setErrors({ department: 'Erreur lors de la mise à jour du département' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    const tagToAdd = newTag.trim().toLowerCase();
    if (tags.includes(tagToAdd)) {
      setErrors({ tags: 'Ce tag existe déjà' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8000/tasks/${task.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: [tagToAdd] }),
      });

      if (response.ok) {
        const newTags = [...tags, tagToAdd];
        setTags(newTags);
        setNewTag('');
        showSuccess('Tag ajouté avec succès');
        onSave({ ...task, tags: newTags });
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
      const response = await fetch(`http://localhost:8000/tasks/${task.id}/tags/${tagToRemove}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        showSuccess('Tag supprimé avec succès');
        onSave({ ...task, tags: newTags });
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
      const response = await fetch(`http://localhost:8000/tasks/${task.id}`, {
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
        onSave({
          ...task,
          description: completeForm.description,
          responsable: completeForm.responsable,
          priorite: completeForm.priorite,
          statut: completeForm.statut,
          deadline: completeForm.deadline ? `${completeForm.deadline}T00:00:00` : '',
          department: completeForm.department,
        });
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
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <Edit3 className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Modifier la tâche</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex border-b bg-white">
        <button
          onClick={() => setActiveSection('partial')}
          className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'partial'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Modifications partielles
        </button>
        <button
          onClick={() => setActiveSection('complete')}
          className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'complete'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Modification complète
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6 max-w-4xl mx-auto">

            {activeSection === 'partial' && (
              <div className="space-y-6">

                {/* Sélecteur de type de modification */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Type de modification</h3>
                  <select
                    value={selectedModificationType}
                    onChange={(e) => setSelectedModificationType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un type de modification...</option>
                    <option value="priority">Modifier la priorité</option>
                    <option value="deadline">Modifier la deadline</option>
                    <option value="description">Modifier la description</option>
                    <option value="department">Modifier le département</option>
                    <option value="tags">Gérer les tags</option>
                  </select>
                </div>

                {/* Formulaire selon le type sélectionné */}
                {selectedModificationType === 'priority' && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900">Modifier la priorité</h3>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as "urgent" | "high" | "medium" | "low")}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getPriorityColor(priority)}`}
                      >
                        <option value="low">🟢 Faible</option>
                        <option value="medium">🟡 Moyenne</option>
                        <option value="high">🟠 Élevée</option>
                        <option value="urgent">🔴 Urgent</option>
                      </select>
                      <button
                        onClick={handlePriorityChange}
                        disabled={isSubmitting || priority === task.priorite}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? 'Modification en cours...' : 'Modifier la priorité'}
                      </button>
                    </div>
                    {errors.priority && <p className="text-red-600 text-sm mt-1">{errors.priority}</p>}
                  </div>
                )}

                {selectedModificationType === 'deadline' && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900">Modifier la deadline</h3>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleDeadlineChange}
                        disabled={isSubmitting || deadline === (task.deadline ? task.deadline.split('T')[0] : '')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? 'Modification en cours...' : 'Modifier la deadline'}
                      </button>
                    </div>
                    {errors.deadline && <p className="text-red-600 text-sm mt-1">{errors.deadline}</p>}
                  </div>
                )}

                {selectedModificationType === 'description' && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900">Modifier la description</h3>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Nouvelle description..."
                      />
                      <button
                        onClick={handleDescriptionChange}
                        disabled={isSubmitting || description === task.description}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? 'Modification en cours...' : 'Modifier la description'}
                      </button>
                    </div>
                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                  </div>
                )}

                {selectedModificationType === 'department' && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900">Modifier le département</h3>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nouveau département..."
                      />
                      <button
                        onClick={handleDepartmentChange}
                        disabled={isSubmitting || department === task.department}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? 'Modification en cours...' : 'Modifier le département'}
                      </button>
                    </div>
                    {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
                  </div>
                )}

                {selectedModificationType === 'tags' && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Tag className="w-4 h-4 text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-900">Gérer les tags</h3>
                    </div>

                    {/* Tags existants */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              disabled={isSubmitting}
                              className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Ajouter un tag */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nouveau tag..."
                      />
                      <button
                        onClick={handleAddTag}
                        disabled={isSubmitting || !newTag.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSubmitting ? 'Ajout...' : 'Ajouter'}
                      </button>
                    </div>
                    {errors.tags && <p className="text-red-600 text-sm mt-1">{errors.tags}</p>}
                  </div>
                )}

                {/* Message si aucun type sélectionné */}
                {!selectedModificationType && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <Edit3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Sélectionnez un type de modification</h3>
                    <p className="text-blue-700">Choisissez le type de modification que vous souhaitez effectuer depuis le menu déroulant ci-dessus.</p>
                  </div>
                )}

              </div>
            )}

            {activeSection === 'complete' && (
              <div className="space-y-6">

                {/* Formulaire complet */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Modification complète de la tâche</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        value={completeForm.description}
                        onChange={(e) => setCompleteForm({...completeForm, description: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Description de la tâche..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Responsable *</label>
                      <input
                        type="text"
                        value={completeForm.responsable}
                        onChange={(e) => setCompleteForm({...completeForm, responsable: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom du responsable..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priorité *</label>
                        <select
                          value={completeForm.priorite}
                          onChange={(e) => setCompleteForm({...completeForm, priorite: e.target.value as "urgent" | "high" | "medium" | "low"})}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getPriorityColor(completeForm.priorite)}`}
                        >
                          <option value="low">🟢 Faible</option>
                          <option value="medium">🟡 Moyenne</option>
                          <option value="high">🟠 Élevée</option>
                          <option value="urgent">🔴 Urgent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
                        <select
                          value={completeForm.statut}
                          onChange={(e) => setCompleteForm({...completeForm, statut: e.target.value as "pending" | "in_progress" | "completed" | "rejected"})}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getStatusColor(completeForm.statut)}`}
                        >
                          <option value="pending">🟡 En attente</option>
                          <option value="in_progress">🔵 En cours</option>
                          <option value="completed">🟢 Terminée</option>
                          <option value="rejected">🔴 Rejetée</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <input
                          type="date"
                          value={completeForm.deadline}
                          onChange={(e) => setCompleteForm({...completeForm, deadline: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                        <input
                          type="text"
                          value={completeForm.department}
                          onChange={(e) => setCompleteForm({...completeForm, department: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Département..."
                        />
                      </div>
                    </div>
                  </div>

                  {errors.complete && <p className="text-red-600 text-sm mt-4">{errors.complete}</p>}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCompleteUpdate}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Mise à jour...' : 'Mettre à jour complètement'}
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
