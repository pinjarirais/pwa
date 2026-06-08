require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabase } = require('./config/db');

const seed = async () => {
  try {
    console.log('Connecting to Supabase...');

    const users = [
      {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@cardvault.com',
        password: await bcrypt.hash('admin123', 12),
        phone: '+1 800 123 4567',
        address: '1 Financial District, New York, NY',
        role: 'admin',
        status: 'active',
        profile_image: ''
      },
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'user@cardvault.com',
        password: await bcrypt.hash('user123', 12),
        phone: '+1 800 987 6543',
        address: '456 Main St, Los Angeles, CA',
        role: 'user',
        status: 'active',
        profile_image: ''
      }
    ];

    // Upsert on email to avoid duplicates
    const { error } = await supabase
      .from('users')
      .upsert(users, { onConflict: 'email' });

    if (error) throw error;

    console.log('✅ Seed completed successfully');
    console.log('Admin: admin@cardvault.com / admin123');
    console.log('User:  user@cardvault.com / user123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
