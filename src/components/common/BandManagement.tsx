import React, { useState, useEffect } from 'react';
import { Band } from '../../core/types';
import { storageService } from '../../services/storageService';
import { loggingService } from '../../services/loggingService';

interface BandManagementProps {
  profileId: string;
  onClose?: () => void;
}

const BandManagement: React.FC<BandManagementProps> = ({ profileId, onClose }) => {
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBand, setEditingBand] = useState<Band | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    memberRole: '',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBands();
  }, [profileId]);

  const loadBands = async () => {
    try {
      setLoading(true);
      const bandsData = await storageService.getBands(profileId);
      setBands(bandsData);
    } catch (error) {
      loggingService.error('Error loading bands', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBand = () => {
    setEditingBand(null);
    setFormData({
      name: '',
      genre: '',
      memberRole: '',
      isActive: true
    });
    setErrors({});
    setShowForm(true);
  };

  const handleEditBand = (band: Band) => {
    setEditingBand(band);
    setFormData({
      name: band.name,
      genre: band.genre,
      memberRole: band.memberRole,
      isActive: band.isActive
    });
    setErrors({});
    setShowForm(true);
  };

  const handleDeleteBand = async (band: Band) => {
    // TODO: Replace with proper modal confirmation component
    // For now, keeping window.confirm but should be replaced with accessible modal
    if (window.confirm(`Are you sure you want to delete "${band.name}"? This action cannot be undone.`)) {
      try {
        await storageService.deleteBand(profileId, band.id);
        setBands(prev => prev.filter(b => b.id !== band.id));
        loggingService.info('Band deleted successfully', { bandId: band.id });
      } catch (error) {
        loggingService.error('Error deleting band', error as Error);
        // TODO: Replace alert with proper toast notification
        alert('Failed to delete band. Please try again.');
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Band name is required';
    }

    if (!formData.genre.trim()) {
      newErrors.genre = 'Genre is required';
    }

    if (!formData.memberRole.trim()) {
      newErrors.memberRole = 'Your role in the band is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const bandData: Band = {
        id: editingBand?.id || Date.now().toString(),
        name: formData.name.trim(),
        genre: formData.genre.trim(),
        profileId,
        memberRole: formData.memberRole.trim(),
        isActive: formData.isActive,
        createdAt: editingBand?.createdAt || new Date(),
        updatedAt: new Date()
      };

      await storageService.saveBand(profileId, bandData);
      
      if (editingBand) {
        setBands(prev => prev.map(b => b.id === bandData.id ? bandData : b));
      } else {
        setBands(prev => [...prev, bandData]);
      }

      setShowForm(false);
      setEditingBand(null);
      loggingService.info('Band saved successfully', { bandId: bandData.id });
    } catch (error) {
      loggingService.error('Error saving band', error as Error);
      alert('Failed to save band. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="band-management">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading bands...</span>
          </div>
          <p className="mt-2 text-muted">Loading your bands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="band-management">
      <div className="band-management-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4>Band Management</h4>
            <p className="text-muted mb-0">Manage your bands and musical projects</p>
          </div>
          <div>
            <button
              className="btn btn-primary me-2"
              onClick={handleCreateBand}
            >
              <i className="fas fa-plus me-2"></i>
              Add Band
            </button>
            {onClose && (
              <button
                className="btn btn-outline-secondary"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="band-form-modal">
          <div className="band-form-overlay" onClick={() => setShowForm(false)}></div>
          <div className="band-form-container">
            <div className="band-form-header">
              <h5>{editingBand ? 'Edit Band' : 'Add New Band'}</h5>
              <button
                className="btn-close"
                onClick={() => setShowForm(false)}
              ></button>
            </div>
            
            <form onSubmit={handleSubmit} className="band-form">
              <div className="form-group">
                <label htmlFor="bandName">Band Name *</label>
                <input
                  type="text"
                  id="bandName"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'form-control is-invalid' : 'form-control'}
                  placeholder="e.g., The Rock Stars"
                  required
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="bandGenre">Genre *</label>
                <input
                  type="text"
                  id="bandGenre"
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className={errors.genre ? 'form-control is-invalid' : 'form-control'}
                  placeholder="e.g., Rock, Jazz, Pop"
                  required
                />
                {errors.genre && <div className="invalid-feedback">{errors.genre}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="memberRole">Your Role *</label>
                <input
                  type="text"
                  id="memberRole"
                  value={formData.memberRole}
                  onChange={(e) => handleInputChange('memberRole', e.target.value)}
                  className={errors.memberRole ? 'form-control is-invalid' : 'form-control'}
                  placeholder="e.g., Lead Guitar, Vocals, Drums"
                  required
                />
                {errors.memberRole && <div className="invalid-feedback">{errors.memberRole}</div>}
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="form-check-input"
                />
                <label htmlFor="isActive" className="form-check-label">
                  Active Band
                </label>
                <small className="form-text text-muted d-block">
                  Inactive bands won't appear in selection lists
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingBand ? 'Update Band' : 'Create Band'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bands-list">
        {bands.length === 0 ? (
          <div className="empty-state text-center py-5">
            <i className="fas fa-users fa-3x text-muted mb-3"></i>
            <h5>No Bands Yet</h5>
            <p className="text-muted">
              Create your first band to start tracking band-specific activities and goals.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleCreateBand}
            >
              <i className="fas fa-plus me-2"></i>
              Add Your First Band
            </button>
          </div>
        ) : (
          <div className="row">
            {bands.map((band) => (
              <div key={band.id} className="col-md-6 col-lg-4 mb-3">
                <div className={`band-card card h-100 ${!band.isActive ? 'inactive' : ''}`}>
                  <div className="card-body">
                    <div className="band-card-header">
                      <h6 className="band-name">{band.name}</h6>
                      <div className="band-actions">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEditBand(band)}
                          title="Edit band"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteBand(band)}
                          title="Delete band"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="band-details">
                      <div className="band-genre">
                        <i className="fas fa-music me-2"></i>
                        {band.genre}
                      </div>
                      <div className="band-role">
                        <i className="fas fa-user me-2"></i>
                        {band.memberRole}
                      </div>
                      <div className="band-status">
                        <i className={`fas fa-circle me-2 ${band.isActive ? 'text-success' : 'text-muted'}`}></i>
                        {band.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BandManagement;