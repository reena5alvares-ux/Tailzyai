import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'sonner';
import { User, Mail, LogOut, Crown, PawPrint } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [stats, setStats] = useState({ activities: 0, health_records: 0, journal_entries: 0 });
  const [loading, setLoading] = useState(true);

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
      setStats({
        activities: activitiesRes.data.length,
        health_records: healthRes.data.length,
        journal_entries: journalRes.data.length
      });
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto" data-testid="profile-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-heading font-bold text-foreground mb-3">Your Profile</h1>
        <p className="text-lg text-muted-foreground">Manage your account and subscription</p>
      </motion.div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-[2rem] border-2 border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8"
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-heading font-bold mb-2">{user?.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-muted rounded-xl p-4 text-center">
              <div className="text-3xl font-heading font-bold text-primary mb-1">{pets.length}</div>
              <div className="text-sm text-muted-foreground">Pets</div>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <div className="text-3xl font-heading font-bold text-secondary mb-1">{stats.activities}</div>
              <div className="text-sm text-muted-foreground">Activities</div>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <div className="text-3xl font-heading font-bold text-accent mb-1">{stats.health_records}</div>
              <div className="text-sm text-muted-foreground">Records</div>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-full h-12 border-2 border-orange-200 hover:bg-destructive hover:text-white hover:border-destructive"
            data-testid="logout-button"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-[2rem] border-2 border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-6 h-6 text-accent" />
            <h3 className="text-2xl font-heading font-bold">Subscription Plans</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free Plan */}
            <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-6 border-2 border-orange-100">
              <div className="mb-4">
                <div className="inline-block bg-primary/10 px-3 py-1 rounded-full mb-3">
                  <span className="text-primary font-bold text-sm">Current Plan</span>
                </div>
                <h4 className="text-2xl font-heading font-bold mb-1">Free</h4>
                <p className="text-3xl font-heading font-bold text-primary">$0<span className="text-sm text-muted-foreground font-normal">/month</span></p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm">1 pet</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm">10 MB storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm">Activity & health tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm">Limited AI copilot</span>
                </div>
              </div>
            </div>

            {/* Monthly Plan */}
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 border-2 border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <div className="mb-4">
                <h4 className="text-2xl font-heading font-bold mb-1">Monthly</h4>
                <p className="text-3xl font-heading font-bold text-primary">$9<span className="text-sm text-muted-foreground font-normal">/month</span></p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">10 pets</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">10 GB storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">Unlimited tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">Full AI copilot access</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">Priority support</span>
                </div>
              </div>

              <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-white h-11">
                Upgrade Now
              </Button>
            </div>

            {/* Yearly Plan */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border-2 border-blue-500 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                BEST VALUE
              </div>
              <div className="mb-4">
                <h4 className="text-2xl font-heading font-bold mb-1">Yearly</h4>
                <p className="text-3xl font-heading font-bold text-blue-600">$99<span className="text-sm text-muted-foreground font-normal">/year</span></p>
                <p className="text-xs text-green-600 font-medium mt-1">Save $9 (8% off)</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">10 pets</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">10 GB storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">Unlimited tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">Fair use AI copilot*</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">Priority support</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-sm font-medium">Early access features</span>
                </div>
              </div>

              <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white h-11">
                Upgrade Now
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-6 text-center italic">
            * Fair use copilot tokens: Generous monthly allocation for AI queries. Contact support if you need more.
          </p>
        </motion.div>

        {pets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-[2rem] border-2 border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8"
          >
            <h3 className="text-2xl font-heading font-bold mb-6">Your Pets</h3>
            <div className="space-y-4">
              {pets.map((pet) => (
                <div key={pet.id} className="bg-muted rounded-xl p-4 flex items-center gap-4" data-testid={`profile-pet-${pet.id}`}>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xl">{pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading font-bold">{pet.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{pet.species} {pet.breed && `• ${pet.breed}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}