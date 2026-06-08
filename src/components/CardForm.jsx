import { useState, useEffect } from 'react';

const INITIAL = {
  cardHolderName: '', cardNumber: '', expiryDate: '', cvv: '', cardType: 'Visa',
  creditLimit: '', availableBalance: '', cardStatus: 'active', pin: '', userId: ''
};

// Defined OUTSIDE CardForm so it's never recreated on re-render
const Field = ({ label, name, type = 'text', placeholder, options, value, error, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    {options ? (
      <select name={name} value={value} onChange={onChange} className="input-field">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} className={`input-field ${error ? 'border-red-500' : ''}`}
      />
    )}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const CardForm = ({ card, onSubmit, onClose, users = [] }) => {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (card) {
      setForm({
        cardHolderName: card.cardHolderName || '',
        cardNumber: card.cardNumber || '',
        expiryDate: card.expiryDate || '',
        cvv: '',
        cardType: card.cardType || 'Visa',
        creditLimit: card.creditLimit || '',
        availableBalance: card.availableBalance || '',
        cardStatus: card.cardStatus || 'active',
        pin: '',
        userId: card.userId?._id || card.userId || ''
      });
    } else {
      setForm(INITIAL);
    }
  }, [card]);

  const validate = () => {
    const e = {};
    if (!form.cardHolderName.trim()) e.cardHolderName = 'Required';
    if (!form.cardNumber || form.cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = '16-digit card number required';
    if (!form.expiryDate || !/^\d{2}\/\d{2}$/.test(form.expiryDate)) e.expiryDate = 'Format: MM/YY';
    if (!card && (!form.cvv || form.cvv.length < 3)) e.cvv = '3-4 digit CVV required';
    if (!form.creditLimit || form.creditLimit < 0) e.creditLimit = 'Valid credit limit required';
    if (!form.availableBalance && form.availableBalance !== 0) e.availableBalance = 'Required';
    if (!card && (!form.pin || form.pin.length !== 4)) e.pin = '4-digit PIN required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatCardNumber = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'cardNumber' ? formatCardNumber(value) : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const payload = { ...form, cardNumber: form.cardNumber.replace(/\s/g, '') };
    if (card && !payload.cvv) delete payload.cvv;
    if (card && !payload.pin) delete payload.pin;
    await onSubmit(payload);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{card ? 'Edit Card' : 'New Credit Card'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Card Holder Name" name="cardHolderName" placeholder="John Doe"
                value={form.cardHolderName} error={errors.cardHolderName} onChange={handleChange} />
            </div>
            <div className="sm:col-span-2">
              <Field label="Card Number" name="cardNumber" placeholder="1234 5678 9012 3456"
                value={form.cardNumber} error={errors.cardNumber} onChange={handleChange} />
            </div>
            <Field label="Expiry Date" name="expiryDate" placeholder="MM/YY"
              value={form.expiryDate} error={errors.expiryDate} onChange={handleChange} />
            <Field label={card ? 'CVV (leave blank to keep)' : 'CVV'} name="cvv" type="password" placeholder="•••"
              value={form.cvv} error={errors.cvv} onChange={handleChange} />
            <Field label="Card Type" name="cardType"
              options={['Visa', 'MasterCard', 'Amex', 'Discover', 'RuPay'].map(t => ({ value: t, label: t }))}
              value={form.cardType} error={errors.cardType} onChange={handleChange} />
            <Field label="Card Status" name="cardStatus"
              options={['active', 'blocked', 'expired', 'pending'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
              value={form.cardStatus} error={errors.cardStatus} onChange={handleChange} />
            <Field label="Credit Limit ($)" name="creditLimit" type="number" placeholder="10000"
              value={form.creditLimit} error={errors.creditLimit} onChange={handleChange} />
            <Field label="Available Balance ($)" name="availableBalance" type="number" placeholder="8500"
              value={form.availableBalance} error={errors.availableBalance} onChange={handleChange} />
            <Field label={card ? 'PIN (leave blank to keep)' : 'PIN (4 digits)'} name="pin" type="password" placeholder="••••"
              value={form.pin} error={errors.pin} onChange={handleChange} />
            {users.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to User</label>
                <select name="userId" value={form.userId} onChange={handleChange} className="input-field">
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : (card ? 'Update Card' : 'Create Card')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardForm;
