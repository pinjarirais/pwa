import { MdCreditCard, MdLock } from 'react-icons/md';

const CARD_COLORS = {
  Visa: 'from-blue-900 via-blue-800 to-indigo-900',
  MasterCard: 'from-red-900 via-red-800 to-orange-900',
  Amex: 'from-green-900 via-green-800 to-teal-900',
  Discover: 'from-orange-900 via-orange-800 to-yellow-900',
  RuPay: 'from-purple-900 via-purple-800 to-indigo-900',
};

const STATUS_BADGE = {
  active: 'bg-green-500/20 text-green-400 border-green-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
  expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const CardItem = ({ card, onEdit, onDelete, onChangePin, onDownload }) => {
  const gradientClass = CARD_COLORS[card.cardType] || CARD_COLORS.Visa;

  const maskCard = (num) => {
    const clean = (num || '').replace(/\s/g, '');
    return `•••• •••• •••• ${clean.slice(-4)}`;
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Card Visual */}
      <div className={`relative bg-gradient-to-br ${gradientClass} p-6 text-white overflow-hidden`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs text-white/60">Credit Card</p>
            <p className="font-bold text-lg">{card.cardType}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border backdrop-blur-sm ${STATUS_BADGE[card.cardStatus]}`}>
            {card.cardStatus}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <MdLock className="w-4 h-4 text-white/40" />
          <p className="font-mono tracking-widest text-sm">{maskCard(card.cardNumber)}</p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-white/60">CARD HOLDER</p>
            <p className="font-semibold text-sm">{card.cardHolderName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">EXPIRES</p>
            <p className="font-mono text-sm">{card.expiryDate}</p>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Credit Limit</p>
            <p className="font-bold text-gray-900 dark:text-white">${card.creditLimit?.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
            <p className="font-bold text-green-600 dark:text-green-400">${card.availableBalance?.toLocaleString()}</p>
          </div>
        </div>

        {card.userId && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Owner: {card.userId?.firstName} {card.userId?.lastName}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={() => onEdit(card)} className="flex-1 btn-secondary text-xs py-1.5">Edit</button>
          <button onClick={() => onChangePin(card)} className="flex-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">PIN</button>
          <button onClick={() => onDownload(card)} className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">PDF</button>
          <button onClick={() => onDelete(card)} className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Del</button>
        </div>
      </div>
    </div>
  );
};

const CardList = ({ cards, loading, onEdit, onDelete, onChangePin, onDownload }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <div className="skeleton h-44" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-12" />
              <div className="skeleton h-8" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <MdCreditCard className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">No cards found</p>
        <p className="text-sm">Add a new card to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map((card) => (
        <CardItem
          key={card._id}
          card={card}
          onEdit={onEdit}
          onDelete={onDelete}
          onChangePin={onChangePin}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
};

export default CardList;
