import React, { useEffect, useState } from 'react';
import type { Meeting } from '../types';
import { apiService } from '../services/api';
import UploadModal from './UploadModal';

interface MeetingsListProps {
  onSelectMeeting: (meetingId: string) => void;
}

const MeetingsList: React.FC<MeetingsListProps> = ({ onSelectMeeting }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    departement: '',
    type_reunion: '',
    statut: ''
  });
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getMeetingsWithFilters({
        departement: filters.departement || undefined,
        type_reunion: filters.type_reunion || undefined,
        statut: filters.statut || undefined,
      });

      setMeetings(response.meetings || []);
    } catch (err) {
      setError('Erreur lors du chargement des réunions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Liste des Réunions</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Nouvelle Réunion
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Département:
          <input
            type="text"
            name="departement"
            value={filters.departement}
            onChange={handleFilterChange}
            placeholder="Filtrer par département"
          />
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Type de réunion:
          <input
            type="text"
            name="type_reunion"
            value={filters.type_reunion}
            onChange={handleFilterChange}
            placeholder="Filtrer par type"
          />
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Statut:
          <select name="statut" value={filters.statut} onChange={handleFilterChange}>
            <option value="">Tous</option>
            <option value="non_traité">Non traité</option>
            <option value="traité">Traité</option>
          </select>
        </label>
      </div>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {meetings.map((meeting) => (
          <li key={meeting.id} style={{ cursor: 'pointer' }} onClick={() => onSelectMeeting(meeting.id)}>
            <strong>{meeting.titre}</strong> - {meeting.date_reunion} - {meeting.departement} - Statut: {meeting.statut_traitement}
          </li>
        ))}
      </ul>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchMeetings}
      />
    </div>
  );
};

export default MeetingsList;
