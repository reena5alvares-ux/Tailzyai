import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'sonner';
import { Plus, Activity as ActivityIcon, Heart, Stethoscope, BookOpen, Calendar as CalendarIcon, ChevronDown, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar } from '../components/ui/calendar';
import { format, isSameDay, differenceInYears } from 'date-fns';

export default function Home() {
  const [pets, setPets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPetId, setSelectedPetId] = useState('all');
  const [showAddPet, setShowAddPet] = useState(false);
  const [showEditPet, setShowEditPet] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddHealth, setShowAddHealth] = useState(false);
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [petForm, setPetForm] = useState({ 
    name: '', 
    species: '', 
    breed: '', 
    dob: '', 
    photo_url: '',
    microchip_id: '',
    weight: '',
    allergies: '',
    health_conditions: ''
  });
  const [activityForm, setActivityForm] = useState({ pet_id: '', type: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
  const [healthForm, setHealthForm] = useState({ pet_id: '', type: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
  const [journalForm, setJournalForm] = useState({ pet_id: '', content: '', mood: '', date: format(new Date(), 'yyyy-MM-dd') });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [petsRes, activitiesRes, healthRes, journalRes] = await Promise.all([
        api.get('/pets'),
        api.get('/activities'),
        api.get('/health-records'),
        api.get('/journal')
      ]);
      setPets(petsRes.data);
      setActivities(activitiesRes.data);
      setHealthRecords(healthRes.data);
      setJournalEntries(journalRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pets', petForm);
      toast.success('Pet added successfully!');
      setShowAddPet(false);
      setPetForm({ 
        name: '', 
        species: '', 
        breed: '', 
        dob: '', 
        photo_url: '',
        microchip_id: '',
        weight: '',
        allergies: '',
        health_conditions: ''
      });
      loadData();
    } catch (error) {
      toast.error('Failed to add pet');
    }
  };

  const handleEditPet = (pet) => {
    setPetForm({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      dob: pet.dob || '',
      photo_url: pet.photo_url || '',
      microchip_id: pet.microchip_id || '',
      weight: pet.weight || '',
      allergies: pet.allergies || '',
      health_conditions: pet.health_conditions || ''
    });
    setEditingPetId(pet.id);
    setShowEditPet(true);
  };

  const handleUpdatePet = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/pets/${editingPetId}`, petForm);
      toast.success('Pet updated successfully!');
      setShowEditPet(false);
      setEditingPetId(null);
      setPetForm({ 
        name: '', 
        species: '', 
        breed: '', 
        dob: '', 
        photo_url: '',
        microchip_id: '',
        weight: '',
        allergies: '',
        health_conditions: ''
      });
      loadData();
    } catch (error) {
      toast.error('Failed to update pet');
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      await api.post('/activities', activityForm);
      toast.success('Activity added!');
      setShowAddActivity(false);
      setActivityForm({ pet_id: '', type: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to add activity');
    }
  };

  const handleAddHealth = async (e) => {
    e.preventDefault();
    try {
      await api.post('/health-records', healthForm);
      toast.success('Health record added!');
      setShowAddHealth(false);
      setHealthForm({ pet_id: '', type: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
    } catch (error) {
      toast.error('Failed to add health record');
    }
  };

  const handleAddJournal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/journal', journalForm);
      toast.success('Journal entry added!');
      setShowAddJournal(false);
      setJournalForm({ pet_id: '', content: '', mood: '', date: format(new Date(), 'yyyy-MM-dd') });
      loadData();
    } catch (error) {
      toast.error('Failed to add journal entry');
    }
  };

  // Helper functions for pet filtering
  const getFilteredActivities = () => {
    if (selectedPetId === 'all') return activities;
    return activities.filter(a => a.pet_id === selectedPetId);
  };

  const getFilteredHealthRecords = () => {
    if (selectedPetId === 'all') return healthRecords;
    return healthRecords.filter(h => h.pet_id === selectedPetId);
  };

  const getFilteredJournalEntries = () => {
    if (selectedPetId === 'all') return journalEntries;
    return journalEntries.filter(j => j.pet_id === selectedPetId);
  };

  const getSelectedPet = () => {
    if (selectedPetId === 'all') return null;
    return pets.find(p => p.id === selectedPetId);
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    try {
      const age = differenceInYears(new Date(), new Date(dob));
      return age;
    } catch {
      return null;
    }
  };

  // Get entries for selected date (filtered by selected pet)
  const getEntriesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const filteredActivities = getFilteredActivities();
    const filteredHealth = getFilteredHealthRecords();
    const filteredJournal = getFilteredJournalEntries();
    
    const dayActivities = filteredActivities.filter(a => a.date === dateStr);
    const dayHealth = filteredHealth.filter(h => h.date === dateStr);
    const dayJournal = filteredJournal.filter(j => j.date === dateStr);
    return { activities: dayActivities, health: dayHealth, journal: dayJournal };
  };

  // Check if a date has any entries (filtered by selected pet)
  const dateHasEntries = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const filteredActivities = getFilteredActivities();
    const filteredHealth = getFilteredHealthRecords();
    const filteredJournal = getFilteredJournalEntries();
    
    return filteredActivities.some(a => a.date === dateStr) || 
           filteredHealth.some(h => h.date === dateStr) || 
           filteredJournal.some(j => j.date === dateStr);
  };

  // Get entry types for a date (for colored indicators, filtered by selected pet)
  // Get entry types for a date (for colored indicators, filtered by selected pet)
  const getDateEntryTypes = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const filteredActivities = getFilteredActivities();
    const filteredHealth = getFilteredHealthRecords();
    const filteredJournal = getFilteredJournalEntries();
    
    const types = [];
    if (filteredActivities.some(a => a.date === dateStr)) types.push('activity');
    if (filteredHealth.some(h => h.date === dateStr)) types.push('health');
    if (filteredJournal.some(j => j.date === dateStr)) types.push('journal');
    return types;
  };

  const selectedDateEntries = getEntriesForDate(selectedDate);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8" data-testid="home-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-heading font-bold text-foreground mb-3">Your Pet Dashboard</h1>
        <p className="text-lg text-muted-foreground">Track, care, and cherish every moment</p>
      </motion.div>

      {pets.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-[2rem] border-2 border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center"
        >
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-heading font-bold mb-3">Add Your First Pet</h3>
          <p className="text-muted-foreground mb-6">Start tracking your pet's health and activities</p>
          <Dialog open={showAddPet} onOpenChange={setShowAddPet}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[4px]" data-testid="add-first-pet-button">
                <Plus className="w-5 h-5 mr-2" />
                Add Pet
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">Add New Pet</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPet} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} required className="rounded-2xl" data-testid="pet-name-input" />
                </div>
                <div>
                  <Label>Species</Label>
                  <Select value={petForm.species} onValueChange={(v) => setPetForm({ ...petForm, species: v })} required>
                    <SelectTrigger className="rounded-2xl" data-testid="pet-species-select">
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Breed (Optional)</Label>
                  <Input value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} className="rounded-2xl" />
                </div>
                <div>
                  <Label>Date of Birth (Optional)</Label>
                  <Input type="date" value={petForm.dob} onChange={(e) => setPetForm({ ...petForm, dob: e.target.value })} className="rounded-2xl" />
                </div>
                <div>
                  <Label>Microchip ID (Optional)</Label>
                  <Input value={petForm.microchip_id} onChange={(e) => setPetForm({ ...petForm, microchip_id: e.target.value })} className="rounded-2xl" placeholder="e.g., 123456789012345" />
                </div>
                <div>
                  <Label>Weight (Optional)</Label>
                  <Input value={petForm.weight} onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })} className="rounded-2xl" placeholder="e.g., 10 kg" />
                </div>
                <div>
                  <Label>Allergies (Optional)</Label>
                  <Input value={petForm.allergies} onChange={(e) => setPetForm({ ...petForm, allergies: e.target.value })} className="rounded-2xl" placeholder="e.g., Chicken, Dairy" />
                </div>
                <div>
                  <Label>Health Conditions (Optional)</Label>
                  <Textarea value={petForm.health_conditions} onChange={(e) => setPetForm({ ...petForm, health_conditions: e.target.value })} className="rounded-2xl" placeholder="Any ongoing health conditions" rows={2} />
                </div>
                <Button type="submit" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12" data-testid="submit-pet-button">Add Pet</Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>
      )}

      {pets.length > 0 && (
        <>
          {/* Pet Selection and Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-[2rem] border-2 border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold">Pet Profile</h2>
              <div className="flex items-center gap-3">
                <Dialog open={showAddPet} onOpenChange={setShowAddPet}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full bg-primary hover:bg-primary/90 text-white h-10 px-4" data-testid="add-pet-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Pet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2rem] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-2xl">Add New Pet</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddPet} className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} required className="rounded-2xl" />
                      </div>
                      <div>
                        <Label>Species</Label>
                        <Select value={petForm.species} onValueChange={(v) => setPetForm({ ...petForm, species: v })} required>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue placeholder="Select species" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dog">Dog</SelectItem>
                            <SelectItem value="cat">Cat</SelectItem>
                            <SelectItem value="bird">Bird</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Breed (Optional)</Label>
                        <Input value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} className="rounded-2xl" />
                      </div>
                      <div>
                        <Label>Date of Birth (Optional)</Label>
                        <Input type="date" value={petForm.dob} onChange={(e) => setPetForm({ ...petForm, dob: e.target.value })} className="rounded-2xl" />
                      </div>
                      <div>
                        <Label>Microchip ID (Optional)</Label>
                        <Input value={petForm.microchip_id} onChange={(e) => setPetForm({ ...petForm, microchip_id: e.target.value })} className="rounded-2xl" placeholder="e.g., 123456789012345" />
                      </div>
                      <div>
                        <Label>Weight (Optional)</Label>
                        <Input value={petForm.weight} onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })} className="rounded-2xl" placeholder="e.g., 10 kg" />
                      </div>
                      <div>
                        <Label>Allergies (Optional)</Label>
                        <Input value={petForm.allergies} onChange={(e) => setPetForm({ ...petForm, allergies: e.target.value })} className="rounded-2xl" placeholder="e.g., Chicken, Dairy" />
                      </div>
                      <div>
                        <Label>Health Conditions (Optional)</Label>
                        <Textarea value={petForm.health_conditions} onChange={(e) => setPetForm({ ...petForm, health_conditions: e.target.value })} className="rounded-2xl" placeholder="Any ongoing health conditions" rows={2} />
                      </div>
                      <Button type="submit" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12">Add Pet</Button>
                    </form>
                  </DialogContent>
                </Dialog>
                {selectedPetId !== 'all' && (
                  <Button 
                    onClick={() => {
                      const pet = getSelectedPet();
                      if (pet) handleEditPet(pet);
                    }}
                    className="rounded-full bg-white hover:bg-muted border-2 border-orange-100 text-foreground h-10 px-4" 
                    data-testid="edit-pet-header-button"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Pet
                  </Button>
                )}
                <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                  <SelectTrigger className="w-48 rounded-full border-2 border-orange-100">
                    <SelectValue placeholder="Select pet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pets</SelectItem>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPetId === 'all' ? (
              /* Show all pets summary */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pets.map((pet) => {
                  const age = calculateAge(pet.dob);
                  return (
                    <div key={pet.id} className="bg-muted rounded-[1.5rem] p-4 relative" data-testid={`pet-card-${pet.id}`}>
                      <button
                        onClick={() => handleEditPet(pet)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                        data-testid={`edit-pet-${pet.id}`}
                      >
                        <Edit className="w-4 h-4 text-primary" />
                      </button>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xl">{pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}</span>
                        </div>
                        <div>
                          <h3 className="font-heading font-bold">{pet.name}</h3>
                          <p className="text-xs text-muted-foreground capitalize">{pet.species} {pet.breed && `• ${pet.breed}`}</p>
                        </div>
                      </div>
                      {age !== null && (
                        <p className="text-sm text-muted-foreground">Age: {age} {age === 1 ? 'year' : 'years'}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Show selected pet details */
              (() => {
                const pet = getSelectedPet();
                if (!pet) return null;
                const age = calculateAge(pet.dob);
                
                return (
                  <div className="relative">
                    <button
                      onClick={() => handleEditPet(pet)}
                      className="absolute top-0 right-0 w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                      data-testid="edit-pet-detail"
                    >
                      <Edit className="w-5 h-5 text-primary" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-4xl">{pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-heading font-bold">{pet.name}</h3>
                            <p className="text-muted-foreground capitalize">{pet.species} {pet.breed && `• ${pet.breed}`}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted/50 rounded-xl p-3">
                            <p className="text-xs text-muted-foreground mb-1">Species</p>
                            <p className="font-medium capitalize">{pet.species}</p>
                        </div>
                        {pet.breed && (
                          <div className="bg-muted/50 rounded-xl p-3">
                            <p className="text-xs text-muted-foreground mb-1">Breed</p>
                            <p className="font-medium">{pet.breed}</p>
                          </div>
                        )}
                        {age !== null && (
                          <div className="bg-muted/50 rounded-xl p-3">
                            <p className="text-xs text-muted-foreground mb-1">Age</p>
                            <p className="font-medium">{age} {age === 1 ? 'year' : 'years'}</p>
                          </div>
                        )}
                        {pet.weight && (
                          <div className="bg-muted/50 rounded-xl p-3">
                            <p className="text-xs text-muted-foreground mb-1">Weight</p>
                            <p className="font-medium">{pet.weight}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {pet.microchip_id && (
                        <div className="bg-muted/50 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Microchip ID</p>
                          <p className="font-medium font-mono">{pet.microchip_id}</p>
                        </div>
                      )}
                      {pet.allergies && (
                        <div className="bg-muted/50 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Allergies</p>
                          <p className="font-medium">{pet.allergies}</p>
                        </div>
                      )}
                      {pet.health_conditions && (
                        <div className="bg-muted/50 rounded-xl p-4">
                          <p className="text-xs text-muted-foreground mb-1">Health Conditions</p>
                          <p className="font-medium">{pet.health_conditions}</p>
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Edit Pet Dialog */}
            <Dialog open={showEditPet} onOpenChange={setShowEditPet}>
              <DialogContent className="rounded-[2rem] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">Edit Pet</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdatePet} className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} required className="rounded-2xl" />
                  </div>
                  <div>
                    <Label>Species</Label>
                    <Select value={petForm.species} onValueChange={(v) => setPetForm({ ...petForm, species: v })} required>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Breed (Optional)</Label>
                    <Input value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} className="rounded-2xl" />
                  </div>
                  <div>
                    <Label>Date of Birth (Optional)</Label>
                    <Input type="date" value={petForm.dob} onChange={(e) => setPetForm({ ...petForm, dob: e.target.value })} className="rounded-2xl" />
                  </div>
                  <div>
                    <Label>Microchip ID (Optional)</Label>
                    <Input value={petForm.microchip_id} onChange={(e) => setPetForm({ ...petForm, microchip_id: e.target.value })} className="rounded-2xl" placeholder="e.g., 123456789012345" />
                  </div>
                  <div>
                    <Label>Weight (Optional)</Label>
                    <Input value={petForm.weight} onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })} className="rounded-2xl" placeholder="e.g., 10 kg" />
                  </div>
                  <div>
                    <Label>Allergies (Optional)</Label>
                    <Input value={petForm.allergies} onChange={(e) => setPetForm({ ...petForm, allergies: e.target.value })} className="rounded-2xl" placeholder="e.g., Chicken, Dairy" />
                  </div>
                  <div>
                    <Label>Health Conditions (Optional)</Label>
                    <Textarea value={petForm.health_conditions} onChange={(e) => setPetForm({ ...petForm, health_conditions: e.target.value })} className="rounded-2xl" placeholder="Any ongoing health conditions" rows={2} />
                  </div>
                  <Button type="submit" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12">Update Pet</Button>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Calendar and Quick Actions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-[2rem] border-2 border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8"
          >
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Calendar */}
              <div className="flex-shrink-0">
                <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Calendar
                </h3>
                <div className="w-full max-w-[400px]">
                  <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-xl border-2 border-orange-100"
                  modifiers={{
                    hasEntries: (date) => dateHasEntries(date)
                  }}
                  modifiersStyles={{
                    hasEntries: {
                      position: 'relative',
                      fontWeight: 'bold'
                    }
                  }}
                  components={{
                    DayContent: ({ date }) => {
                      const entryTypes = getDateEntryTypes(date);
                      return (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <span>{format(date, 'd')}</span>
                          {entryTypes.length > 0 && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {entryTypes.includes('activity') && (
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                              )}
                              {entryTypes.includes('health') && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              )}
                              {entryTypes.includes('journal') && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  }}
                />
                </div>
              </div>

              {/* Quick Actions - Vertical Layout on Right */}
              <div className="flex flex-col gap-3 lg:ml-8">
                <h3 className="text-xl font-heading font-bold mb-1">Quick Actions</h3>
                  <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
                    <DialogTrigger asChild>
                      <Button className="w-40 justify-center rounded-full bg-secondary hover:bg-secondary/90 text-white h-12" data-testid="add-activity-button">
                        <ActivityIcon className="w-5 h-5 mr-2" />
                        Activity
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem]">
                      <DialogHeader>
                        <DialogTitle className="font-heading text-2xl">Add Activity</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddActivity} className="space-y-4">
                        <div>
                          <Label>Pet</Label>
                          <Select value={activityForm.pet_id} onValueChange={(v) => setActivityForm({ ...activityForm, pet_id: v })} required>
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Select pet" />
                            </SelectTrigger>
                            <SelectContent>
                              {pets.map((pet) => (
                                <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Input value={activityForm.type} onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })} required className="rounded-2xl" placeholder="e.g., Walk, Play, Training" />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} required className="rounded-2xl" />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input type="date" value={activityForm.date} onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })} required className="rounded-2xl" />
                        </div>
                        <Button type="submit" className="w-full rounded-full bg-secondary hover:bg-secondary/90 h-12">Add Activity</Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Health Dialog */}
                  <Dialog open={showAddHealth} onOpenChange={setShowAddHealth}>
                    <DialogTrigger asChild>
                      <Button className="w-40 justify-center rounded-full bg-primary hover:bg-primary/90 text-white h-12" data-testid="add-health-button">
                        <Stethoscope className="w-5 h-5 mr-2" />
                        Health
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem]">
                      <DialogHeader>
                        <DialogTitle className="font-heading text-2xl">Add Health Record</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddHealth} className="space-y-4">
                        <div>
                          <Label>Pet</Label>
                          <Select value={healthForm.pet_id} onValueChange={(v) => setHealthForm({ ...healthForm, pet_id: v })} required>
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Select pet" />
                            </SelectTrigger>
                            <SelectContent>
                              {pets.map((pet) => (
                                <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Input value={healthForm.type} onChange={(e) => setHealthForm({ ...healthForm, type: e.target.value })} required className="rounded-2xl" placeholder="e.g., Vaccination, Checkup" />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea value={healthForm.description} onChange={(e) => setHealthForm({ ...healthForm, description: e.target.value })} required className="rounded-2xl" />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input type="date" value={healthForm.date} onChange={(e) => setHealthForm({ ...healthForm, date: e.target.value })} required className="rounded-2xl" />
                        </div>
                        <Button type="submit" className="w-full rounded-full bg-primary hover:bg-primary/90 h-12">Add Record</Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Journal Dialog */}
                  <Dialog open={showAddJournal} onOpenChange={setShowAddJournal}>
                    <DialogTrigger asChild>
                      <Button className="w-40 justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white h-12" data-testid="add-journal-button">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Journal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem]">
                      <DialogHeader>
                        <DialogTitle className="font-heading text-2xl">Add Journal Entry</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddJournal} className="space-y-4">
                        <div>
                          <Label>Pet</Label>
                          <Select value={journalForm.pet_id} onValueChange={(v) => setJournalForm({ ...journalForm, pet_id: v })} required>
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue placeholder="Select pet" />
                            </SelectTrigger>
                            <SelectContent>
                              {pets.map((pet) => (
                                <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea value={journalForm.content} onChange={(e) => setJournalForm({ ...journalForm, content: e.target.value })} required className="rounded-2xl" rows={5} />
                        </div>
                        <div>
                          <Label>Mood (Optional)</Label>
                          <Input value={journalForm.mood} onChange={(e) => setJournalForm({ ...journalForm, mood: e.target.value })} className="rounded-2xl" placeholder="e.g., Happy, Playful" />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input type="date" value={journalForm.date} onChange={(e) => setJournalForm({ ...journalForm, date: e.target.value })} required className="rounded-2xl" />
                        </div>
                        <Button type="submit" className="w-full rounded-full bg-blue-500 hover:bg-blue-600 h-12">Add Entry</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
              </div>
            </div>

            {/* Daily Snapshot Section - Merged into same block */}
            <div className="mt-8 pt-8 border-t-2 border-orange-100">
              <h2 className="text-2xl font-heading font-bold mb-6">
                Daily Snapshot - {format(selectedDate, 'MMMM d, yyyy')}
              </h2>

              {selectedDateEntries.activities.length === 0 && 
               selectedDateEntries.health.length === 0 && 
               selectedDateEntries.journal.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No entries for this date</p>
                </div>
              ) : (
              <div className="space-y-6">
                {/* Activities */}
                {selectedDateEntries.activities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-heading font-bold mb-3 flex items-center gap-2">
                      <ActivityIcon className="w-5 h-5 text-secondary" />
                      Activities
                    </h3>
                    <div className="space-y-3">
                      {selectedDateEntries.activities.map((activity) => (
                        <div key={activity.id} className="bg-secondary/10 rounded-xl p-4 border-2 border-secondary/20" data-testid={`activity-${activity.id}`}>
                          <div className="flex items-start gap-3">
                            <div className="bg-secondary/20 p-2 rounded-lg">
                              <ActivityIcon className="w-4 h-4 text-secondary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{activity.description}</p>
                              <p className="text-sm text-muted-foreground mt-1">{activity.type}</p>
                              {activity.notes && (
                                <p className="text-sm text-muted-foreground mt-2">{activity.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health Records */}
                {selectedDateEntries.health.length > 0 && (
                  <div>
                    <h3 className="text-lg font-heading font-bold mb-3 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      Health Records
                    </h3>
                    <div className="space-y-3">
                      {selectedDateEntries.health.map((record) => (
                        <div key={record.id} className="bg-primary/10 rounded-xl p-4 border-2 border-primary/20" data-testid={`health-${record.id}`}>
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/20 p-2 rounded-lg">
                              <Stethoscope className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{record.description}</p>
                              <p className="text-sm text-muted-foreground mt-1">{record.type}</p>
                              {record.notes && (
                                <p className="text-sm text-muted-foreground mt-2">{record.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Journal Entries */}
                {selectedDateEntries.journal.length > 0 && (
                  <div>
                    <h3 className="text-lg font-heading font-bold mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      Journal Entries
                    </h3>
                    <div className="space-y-3">
                      {selectedDateEntries.journal.map((entry) => (
                        <div key={entry.id} className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200" data-testid={`journal-${entry.id}`}>
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <BookOpen className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-foreground whitespace-pre-wrap">{entry.content}</p>
                              {entry.mood && (
                                <p className="text-sm text-muted-foreground mt-2">Mood: {entry.mood}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}