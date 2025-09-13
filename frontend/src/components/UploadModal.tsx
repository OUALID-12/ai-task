import React, { useState } from 'react';
import { apiService } from '../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titre: '',
    transcription: '',
    participants: '',
    date_reunion: '',
    organisateur: '',
    departement: 'IT',
    projet_associe: '',
    type_reunion: 'planification'
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let result;

      if (file) {
        // Upload avec fichier
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('titre', formData.titre || file.name);
        uploadFormData.append('departement', formData.departement);
        uploadFormData.append('projet_associe', formData.projet_associe);
        uploadFormData.append('type_reunion', formData.type_reunion);

        result = await apiService.uploadMeetingTranscription(uploadFormData);
      } else {
        // Upload avec transcription texte
        if (!formData.transcription.trim()) {
          throw new Error('Veuillez saisir une transcription ou sélectionner un fichier');
        }

        const transcriptionData = {
          titre: formData.titre || 'Réunion sans titre',
          transcription: formData.transcription,
          participants: formData.participants ? formData.participants.split(',').map(p => p.trim()) : undefined,
          date_reunion: formData.date_reunion || new Date().toISOString().split('T')[0],
          organisateur: formData.organisateur || 'Non spécifié',
          departement: formData.departement,
          projet_associe: formData.projet_associe || 'Projet général'
        };

        result = await apiService.processMeetingTranscription(transcriptionData);
      }

      setSuccess(`Réunion traitée avec succès ! ${result.data.tasks_extracted} tâches extraites.`);

      // Reset form
      setFormData({
        titre: '',
        transcription: '',
        participants: '',
        date_reunion: '',
        organisateur: '',
        departement: 'IT',
        projet_associe: '',
        type_reunion: 'planification'
      });
      setFile(null);

      // Call success callback to refresh meetings list
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement de la réunion');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '2rem',
        borderRadius: '8px',
        border: '2px solid #333333',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2>Uploader une Réunion</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Titre de la réunion:
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                placeholder="Titre de la réunion"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                  backgroundColor: '#333333',
                  color: '#ffffff',
                  border: '1px solid #666666',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              Fichier de transcription (optionnel):
              <input
                type="file"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                  backgroundColor: '#333333',
                  color: '#ffffff',
                  border: '1px solid #666666',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              Transcription (si pas de fichier):
              <textarea
                name="transcription"
                value={formData.transcription}
                onChange={handleInputChange}
                placeholder="Collez ici la transcription de la réunion..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                  backgroundColor: '#333333',
                  color: '#ffffff',
                  border: '1px solid #666666',
                  borderRadius: '4px'
                }}
                disabled={!!file}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label>
                Date de la réunion:
                <input
                  type="date"
                  name="date_reunion"
                  value={formData.date_reunion}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.25rem',
                    backgroundColor: '#333333',
                    color: '#ffffff',
                    border: '1px solid #666666',
                    borderRadius: '4px'
                  }}
                />
              </label>
            </div>

            <div>
              <label>
                Organisateur:
                <input
                  type="text"
                  name="organisateur"
                  value={formData.organisateur}
                  onChange={handleInputChange}
                  placeholder="Nom de l'organisateur"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.25rem',
                    backgroundColor: '#333333',
                    color: '#ffffff',
                    border: '1px solid #666666',
                    borderRadius: '4px'
                  }}
                />
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label>
                Département:
                <select
                  name="departement"
                  value={formData.departement}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.25rem',
                    backgroundColor: '#333333',
                    color: '#ffffff',
                    border: '1px solid #666666',
                    borderRadius: '4px'
                  }}
                >
                  <option value="IT">IT</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Ventes">Ventes</option>
                  <option value="RH">RH</option>
                  <option value="Finance">Finance</option>
                </select>
              </label>
            </div>

            <div>
              <label>
                Type de réunion:
                <select
                  name="type_reunion"
                  value={formData.type_reunion}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.25rem',
                    backgroundColor: '#333333',
                    color: '#ffffff',
                    border: '1px solid #666666',
                    borderRadius: '4px'
                  }}
                >
                  <option value="planification">Planification</option>
                  <option value="retrospective">Rétrospective</option>
                  <option value="validation">Validation</option>
                  <option value="test">Test</option>
                  <option value="formation">Formation</option>
                </select>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              Projet associé:
              <input
                type="text"
                name="projet_associe"
                value={formData.projet_associe}
                onChange={handleInputChange}
                placeholder="Nom du projet"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                  backgroundColor: '#333333',
                  color: '#ffffff',
                  border: '1px solid #666666',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              Participants (séparés par des virgules):
              <input
                type="text"
                name="participants"
                value={formData.participants}
                onChange={handleInputChange}
                placeholder="Jean Dupont, Marie Martin, ..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                  backgroundColor: '#333333',
                  color: '#ffffff',
                  border: '1px solid #666666',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          {error && (
            <div style={{
              color: 'red',
              padding: '0.5rem',
              border: '1px solid red',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              color: 'green',
              padding: '0.5rem',
              border: '1px solid green',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Traitement...' : 'Uploader et Traiter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
