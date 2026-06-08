const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');

function mapCard(row, userRow) {
  if (!row) return null;
  const card = {
    _id: row.id,
    id: row.id,
    cardHolderName: row.card_holder_name,
    cardNumber: row.card_number,
    expiryDate: row.expiry_date,
    cvv: row.cvv,
    cardType: row.card_type,
    creditLimit: row.credit_limit,
    availableBalance: row.available_balance,
    cardStatus: row.card_status,
    pin: row.pin,
    userId: userRow
      ? {
          _id: userRow.id,
          firstName: userRow.first_name,
          lastName: userRow.last_name,
          email: userRow.email,
          phone: userRow.phone
        }
      : row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    matchPin: (entered) => bcrypt.compare(entered, row.pin),
    toJSON() {
      const { pin, cvv, matchPin, toJSON, ...safe } = this;
      return safe;
    }
  };
  return card;
}

const CreditCard = {
  async findById(id) {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*, users(id, first_name, last_name, email, phone)')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    const { users: u, ...row } = data;
    return mapCard(row, u);
  },

  async create(cardData) {
    const hashedPin = await bcrypt.hash(String(cardData.pin), 12);
    const hashedCvv = await bcrypt.hash(String(cardData.cvv), 12);
    const { data, error } = await supabase
      .from('credit_cards')
      .insert({
        card_holder_name: cardData.cardHolderName,
        card_number: cardData.cardNumber,
        expiry_date: cardData.expiryDate,
        cvv: hashedCvv,
        card_type: cardData.cardType,
        credit_limit: cardData.creditLimit,
        available_balance: cardData.availableBalance,
        card_status: cardData.cardStatus || 'active',
        pin: hashedPin,
        user_id: cardData.userId
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapCard(data, null);
  },

  async findByIdAndUpdate(id, updates) {
    const fields = {};
    if (updates.cardHolderName !== undefined) fields.card_holder_name = updates.cardHolderName;
    if (updates.cardNumber !== undefined) fields.card_number = updates.cardNumber;
    if (updates.expiryDate !== undefined) fields.expiry_date = updates.expiryDate;
    if (updates.cardType !== undefined) fields.card_type = updates.cardType;
    if (updates.creditLimit !== undefined) fields.credit_limit = updates.creditLimit;
    if (updates.availableBalance !== undefined) fields.available_balance = updates.availableBalance;
    if (updates.cardStatus !== undefined) fields.card_status = updates.cardStatus;
    if (updates.userId !== undefined) fields.user_id = updates.userId;
    if (updates.pin !== undefined) fields.pin = await bcrypt.hash(String(updates.pin), 12);
    fields.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('credit_cards')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapCard(data, null);
  },

  async findByIdAndDelete(id) {
    const { data, error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return mapCard(data, null);
  },

  async find({ query = {}, page = 1, limit = 10, sort = 'created_at' } = {}) {
    let qb = supabase
      .from('credit_cards')
      .select('*, users(id, first_name, last_name, email, phone)', { count: 'exact' });

    if (query.search) qb = qb.ilike('card_holder_name', `%${query.search}%`);
    if (query.cardStatus) qb = qb.eq('card_status', query.cardStatus);

    const ascending = !sort.startsWith('-');
    const col = sort.replace(/^-/, '');
    const dbCol = col === 'createdAt' ? 'created_at' : col;
    qb = qb.order(dbCol, { ascending });
    qb = qb.range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await qb;
    if (error) throw new Error(error.message);

    const cards = (data || []).map(({ users: u, ...row }) => mapCard(row, u));
    return { cards, total: count || 0 };
  },

  async countDocuments(filter = {}) {
    let qb = supabase.from('credit_cards').select('*', { count: 'exact', head: true });
    if (filter.cardStatus) qb = qb.eq('card_status', filter.cardStatus);
    const { count, error } = await qb;
    if (error) return 0;
    return count || 0;
  },

  async aggregate(group) {
    // Used for status stats — query distinct statuses with counts
    const { data, error } = await supabase.rpc('card_status_counts');
    if (error) return [];
    return data.map(r => ({ _id: r.card_status, count: r.count }));
  },

  async monthlyRegistrations() {
    const { data, error } = await supabase.rpc('monthly_user_registrations');
    if (error) return [];
    return data.map(r => ({
      _id: { year: r.year, month: r.month },
      count: r.count
    }));
  }
};

module.exports = CreditCard;
