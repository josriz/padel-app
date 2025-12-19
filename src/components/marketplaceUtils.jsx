// src/components/marketplaceUtils.js

// Controlla se un articolo è "NUOVO" (pubblicato negli ultimi X giorni)
export const isNewItem = (createdAt, days = 3) => {
  if (!createdAt) return false;
  const itemDate = new Date(createdAt);
  const today = new Date();
  const diffDays = (today - itemDate) / (1000 * 60 * 60 * 24);
  return diffDays <= days;
};

// Categorie disponibili nel marketplace
export const categories = [
  { value: '', label: 'Tutte le categorie' },
  { value: 'racchette', label: '🏓 Racchette' },
  { value: 'scarpe', label: '👟 Scarpe' },
  { value: 'abbigliamento', label: '👕 Abbigliamento' },
  { value: 'borse', label: '🎒 Borse' },
  { value: 'altri', label: '⚽ Altri' },
];

// Funzioni di ordinamento comuni
export const sortItems = (items, option) => {
  if (!items || !Array.isArray(items)) return [];
  
  const sorted = [...items];
  
  switch (option) {
    case 'priceAsc':
      return sorted.sort((a, b) => parseFloat(a.prezzo || 0) - parseFloat(b.prezzo || 0));
    case 'priceDesc':
      return sorted.sort((a, b) => parseFloat(b.prezzo || 0) - parseFloat(a.prezzo || 0));
    case 'recent':
      return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    case 'nameAsc':
      return sorted.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    default:
      return sorted;
  }
};

// Filtra per categoria
export const filterByCategory = (items, category) => {
  if (!category || category === '') return items;
  return items.filter(item => item.categoria === category);
};

// Formatta prezzo
export const formatPrice = (price) => {
  return new Intl.NumberFormat('it-IT', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2 
  }).format(parseFloat(price) || 0);
};

// Truncate testo lungo
export const truncateText = (text, maxLength = 80) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
