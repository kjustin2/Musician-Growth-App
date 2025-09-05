<script lang="ts">
  import { onMount } from 'svelte';
  import { gigService, venueService } from '../../../../backend/database/db.js';
  import type {
    User,
    Gig,
    Venue,
    CreateGig,
    GIG_STATUSES,
  } from '../../../../backend/database/types.js';

  export let gig: Gig | null = null;
  export let user: User;
  export let bandId: number | null = null;
  export let onSave: () => void;
  export let onCancel: () => void;

  let title = '';
  let venueId: number | null = null;
  let venueName = '';
  let date = '';
  let startTime = '';
  let endTime = '';
  let earnings: number | null = null;
  let notes = '';
  let status: 'scheduled' | 'completed' | 'cancelled' = 'scheduled';

  let venues: Venue[] = [];
  let isSubmitting = false;
  let showVenueForm = false;
  let newVenueName = '';
  let newVenueAddress = '';
  let newVenueCity = '';

  onMount(async () => {
    await loadVenues();
    if (gig) {
      populateForm();
    } else {
      // Set default date to today
      const today = new Date();
      date = today.toISOString().split('T')[0];
    }
  });

  function populateForm(): void {
    if (!gig) {
      return;
    }

    title = gig.title;
    venueId = gig.venueId || null;
    venueName = gig.venueName || '';
    date = new Date(gig.date).toISOString().split('T')[0];
    startTime = gig.startTime || '';
    endTime = gig.endTime || '';
    earnings = gig.earnings || null;
    notes = gig.notes || '';
    status = gig.status;
  }

  async function loadVenues(): Promise<void> {
    try {
      venues = await venueService.getAll();
    } catch (error) {
      console.error('Failed to load venues:', error);
    }
  }

  async function handleSubmit(): Promise<void> {
    if (!title.trim() || !date) {
      alert('Please fill in required fields (title and date)');
      return;
    }

    try {
      isSubmitting = true;

      const gigData: CreateGig = {
        title: title.trim(),
        venueId,
        venueName: venueName.trim() || undefined,
        date: new Date(date),
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        earnings: earnings || undefined,
        notes: notes.trim() || undefined,
        status,
        userId: user.id!,
        bandId: bandId || undefined,
      };

      if (gig) {
        await gigService.update(gig.id!, gigData);
      } else {
        await gigService.add(gigData);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save gig:', error);
      alert('Failed to save gig. Please try again.');
    } finally {
      isSubmitting = false;
    }
  }

  async function handleCreateVenue(): Promise<void> {
    if (!newVenueName.trim()) {
      alert('Please enter a venue name');
      return;
    }

    try {
      const venueData = {
        name: newVenueName.trim(),
        address: newVenueAddress.trim() || undefined,
        city: newVenueCity.trim() || undefined,
      };

      const venueIdCreated = await venueService.add(venueData);
      await loadVenues();

      // Select the newly created venue
      venueId = venueIdCreated;
      venueName = '';

      // Reset and hide form
      newVenueName = '';
      newVenueAddress = '';
      newVenueCity = '';
      showVenueForm = false;
    } catch (error) {
      console.error('Failed to create venue:', error);
      alert('Failed to create venue. Please try again.');
    }
  }

  function handleVenueChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedVenueId = target.value && !isNaN(parseInt(target.value)) && parseInt(target.value) > 0 ? parseInt(target.value) : null;

    if (selectedVenueId) {
      venueId = selectedVenueId;
      venueName = '';
    } else {
      venueId = null;
    }
  }
</script>

<div class="gig-form">
  <div class="form-header">
    <h3>{gig ? 'Edit Gig' : 'New Gig'}</h3>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="form-content">
    <div class="form-grid">
      <!-- Title -->
      <div class="form-group full-width">
        <label for="title">Title *</label>
        <input
          id="title"
          type="text"
          bind:value={title}
          placeholder="e.g. Live at The Blue Note"
          required
        />
      </div>

      <!-- Venue Selection -->
      <div class="form-group full-width">
        <label for="venue">Venue</label>
        <div class="venue-input-group">
          <select id="venue" on:change={handleVenueChange} value={venueId?.toString() || ''}>
            <option value="">Select venue or enter custom name</option>
            {#each venues as venue}
              <option value={venue.id?.toString()}>
                {venue.name}
                {#if venue.city}
                  - {venue.city}
                {/if}
              </option>
            {/each}
          </select>

          <button
            type="button"
            class="add-venue-button"
            on:click={() => (showVenueForm = !showVenueForm)}
          >
            {showVenueForm ? 'Cancel' : '+ New Venue'}
          </button>
        </div>

        {#if !venueId}
          <input
            type="text"
            bind:value={venueName}
            placeholder="Or enter venue name manually"
            class="custom-venue-input"
          />
        {/if}
      </div>

      {#if showVenueForm}
        <div class="venue-form full-width">
          <h4>Create New Venue</h4>
          <div class="venue-form-fields">
            <input type="text" bind:value={newVenueName} placeholder="Venue name *" required />
            <input type="text" bind:value={newVenueAddress} placeholder="Address (optional)" />
            <input type="text" bind:value={newVenueCity} placeholder="City (optional)" />
            <button type="button" on:click={handleCreateVenue} class="create-venue-button">
              Create Venue
            </button>
          </div>
        </div>
      {/if}

      <!-- Date and Time -->
      <div class="form-group">
        <label for="date">Date *</label>
        <input id="date" type="date" bind:value={date} required />
      </div>

      <div class="form-group">
        <label for="startTime">Start Time</label>
        <input id="startTime" type="time" bind:value={startTime} />
      </div>

      <div class="form-group">
        <label for="endTime">End Time</label>
        <input id="endTime" type="time" bind:value={endTime} />
      </div>

      <!-- Status -->
      <div class="form-group">
        <label for="status">Status</label>
        <select id="status" bind:value={status}>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <!-- Earnings -->
      <div class="form-group">
        <label for="earnings">Earnings (USD)</label>
        <input
          id="earnings"
          type="number"
          step="0.01"
          min="0"
          bind:value={earnings}
          placeholder="0.00"
        />
      </div>

      <!-- Notes -->
      <div class="form-group full-width">
        <label for="notes">Notes</label>
        <textarea
          id="notes"
          bind:value={notes}
          placeholder="Additional notes about this gig..."
          rows="3"
        ></textarea>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" on:click={onCancel} class="cancel-button"> Cancel </button>
      <button type="submit" class="save-button" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : gig ? 'Update Gig' : 'Create Gig'}
      </button>
    </div>
  </form>
</div>

<style>
  .gig-form {
    padding: 1.5rem;
  }

  .form-header h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  label {
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  }

  input,
  select,
  textarea {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    background: white;
    transition: border-color 0.2s;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .venue-input-group {
    display: flex;
    gap: 0.5rem;
    align-items: stretch;
  }

  .venue-input-group select {
    flex: 1;
  }

  .add-venue-button {
    padding: 0.75rem 1rem;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .add-venue-button:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }

  .custom-venue-input {
    margin-top: 0.5rem;
  }

  .venue-form {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #e9ecef;
  }

  .venue-form h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  .venue-form-fields {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .create-venue-button {
    padding: 0.75rem 1rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .create-venue-button:hover {
    background: #059669;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .cancel-button,
  .save-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  .cancel-button {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .cancel-button:hover {
    background: #e5e7eb;
  }

  .save-button {
    background: #3b82f6;
    color: white;
  }

  .save-button:hover:not(:disabled) {
    background: #2563eb;
  }

  .save-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .gig-form {
      padding: 1rem;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .venue-input-group {
      flex-direction: column;
    }

    .form-actions {
      flex-direction: column;
    }

    .cancel-button,
    .save-button {
      width: 100%;
    }
  }
</style>
