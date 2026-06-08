const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');

// Strip password from returned user object
const sanitize = (user) => {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
};

const User = {
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return { ...data, matchPassword: (pwd) => bcrypt.compare(pwd, data.password), toJSON: () => sanitize(data) };
  },

  async findOne({ email }) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    if (error || !data) return null;
    return { ...data, matchPassword: (pwd) => bcrypt.compare(pwd, data.password), toJSON: () => sanitize(data) };
  },

  async create(userData) {
    const hashed = await bcrypt.hash(userData.password, 12);
    const { data, error } = await supabase
      .from('users')
      .insert({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email.toLowerCase(),
        password: hashed,
        phone: userData.phone || null,
        address: userData.address || null,
        role: userData.role || 'user',
        status: userData.status || 'active',
        profile_image: userData.profileImage || ''
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapUser(data);
  },

  async findByIdAndUpdate(id, updates) {
    const fields = {};
    if (updates.firstName !== undefined) fields.first_name = updates.firstName;
    if (updates.lastName !== undefined) fields.last_name = updates.lastName;
    if (updates.email !== undefined) fields.email = updates.email.toLowerCase();
    if (updates.phone !== undefined) fields.phone = updates.phone;
    if (updates.address !== undefined) fields.address = updates.address;
    if (updates.role !== undefined) fields.role = updates.role;
    if (updates.status !== undefined) fields.status = updates.status;
    if (updates.profileImage !== undefined) fields.profile_image = updates.profileImage;
    if (updates.password !== undefined) fields.password = await bcrypt.hash(updates.password, 12);
    if (updates.lastLogin !== undefined) fields.last_login = updates.lastLogin;
    fields.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapUser(data);
  },

  async findByIdAndDelete(id) {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return mapUser(data);
  },

  async find({ query = {}, page = 1, limit = 10, sort = 'created_at' } = {}) {
    let qb = supabase.from('users').select('*', { count: 'exact' });

    if (query.search) {
      qb = qb.or(
        `first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%,email.ilike.%${query.search}%`
      );
    }

    const ascending = !sort.startsWith('-');
    const col = sort.replace(/^-/, '');
    const dbCol = col === 'createdAt' ? 'created_at' : col;
    qb = qb.order(dbCol, { ascending });
    qb = qb.range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await qb;
    if (error) throw new Error(error.message);
    return { users: (data || []).map(mapUser), total: count || 0 };
  },

  async countDocuments() {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (error) return 0;
    return count || 0;
  }
};

// Map snake_case DB columns → camelCase app fields
function mapUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    password: row.password,
    phone: row.phone,
    address: row.address,
    role: row.role,
    status: row.status,
    profileImage: row.profile_image,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    matchPassword: (pwd) => bcrypt.compare(pwd, row.password),
    toJSON() {
      const { password, matchPassword, toJSON, ...safe } = this;
      return safe;
    }
  };
}

module.exports = User;
