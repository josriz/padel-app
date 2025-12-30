import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Loader2, ShoppingCart, Plus, MessageCircle, CheckCircle, X, Eye } from 'lucide-react';

export default function Marketplace() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    immagine: null,
    immaginePreview: null,
    nome: '',
    prezzo: '',
    nome_venditore: '',
    cognome_venditore: '',
    email: '',
    telefono: '',
    descrizione: '',
    note: ''
  });
  const fileInputRef = useRef(null);
  
  const [userRole] = useState('user');
  const [user] = useState(true);

  const mockItems = [
    {
      id: 1,
      nome: 'Pala Padel Bullpadel Vertex',
      prezzo: 280,
      nome_venditore: 'Mario',
      cognome_venditore: 'Rossi',
      email: 'mario@email.com',
      telefono: '3331234567',
      immagine_url: '/images/padel1.jpg',
      venduto: false
    },
    {
      id: 2,
      nome: 'Scarpe Padel Head Motion',
      prezzo: 120,
      nome_venditore: 'Luca',
      cognome_venditore: 'Bianchi',
      email: 'luca@email.com',
      telefono: '3409876543',
      immagine_url: '/images/claudio1.jpg',
      venduto: true
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setItems(mockItems);
      setLoading(false);
    }, 800);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewItem({ ...newItem, immagine: file, immaginePreview: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setNewItem(prev => ({ ...prev, immagine: null, immaginePreview: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPublishing(true);
    
    const newId = items.length + 1;
    const newItemData = {
      id: newId,
      nome: newItem.nome,
      prezzo: parseFloat(newItem.prezzo),
      nome_venditore: newItem.nome_venditore,
      cognome_venditore: newItem.cognome_venditore,
      email: newItem.email,
      telefono: newItem.telefono,
      immagine_url: newItem.immagine ? URL.createObjectURL(newItem.immagine) : '/images/claudio1.jpg',
      venduto: false
    };
    
    setTimeout(() => {
      setItems([newItemData, ...items]);
      setShowForm(false);
      setNewItem({ 
        immagine: null, 
        immaginePreview: null, 
        nome: '', 
        prezzo: '', 
        nome_venditore: '', 
        cognome_venditore: '', 
        email: '', 
        telefono: '', 
        descrizione: '', 
        note: '' 
      });
      resetFileInput();
      setPublishing(false);
    }, 1200);
  };

  const handleContact = (item) => {
    const cleanPhone = item.telefono.replace(/\D/g, '');
    window.open(`https://wa.me/39${cleanPhone}?text=Interessato a: ${item.nome}`);
  };

  const handleToggleSold = (id, currentStatus) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, venduto: !currentStatus } : item
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat pt-8 pb-20 px-4 flex items-center justify-center" 
           style={{backgroundImage: "url('/images/Sfondo-Marketplace.jpg')", backgroundColor: 'rgba(17,24,39,0.9)'}}>
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat pt-8 pb-20 px-4" 
         style={{backgroundImage: "url('/images/sfondo-marcketplace2.jpg')", backgroundColor: 'rgba(17,24,39,0.9)'}}>
      <div className="max-w-6xl mx-auto">
        {/* HEADER CON FOTO DIRECTOR */}
        <div className="flex items-center gap-4 mb-8">
          <ShoppingCart className="w-12 h-12 text-emerald-400 drop-shadow-2xl" />
          <div className="flex items-center gap-3">
            <img src="/images/Raniero.jpg" alt="Director" className="w-14 h-14 rounded-full object-cover shadow-2xl border-4 border-white/60 ring-4 ring-emerald-400/30" />
            <div>
              <h2 className="text-2xl font-extrabold text-white drop-shadow-2xl">Director Marketplace</h2>
              <h1 className="text-4xl font-black text-white drop-shadow-2xl leading-tight">MARKETPLACE</h1>
              <p className="text-emerald-300 font-bold text-lg">Raniero Pierno</p>
            </div>
          </div>
        </div>

        {/* PULSANTE INDIETRO */}
        <div className="flex items-center mb-4">
          <button onClick={() => navigate(-1)} 
                  className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2 text-base shadow-xl hover:shadow-2xl">
            <ArrowLeft className="w-5 h-5" /> Indietro
          </button>
        </div>

        {/* NUOVO ANNUNCIO */}
        {user && (
          <button onClick={() => setShowForm(!showForm)} 
                  className="w-full max-w-2xl mx-auto mb-8 px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-black rounded-2xl text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all flex items-center justify-center gap-3 backdrop-blur-sm border border-emerald-400/50">
            <Plus className="w-8 h-8" /> 
            <span className="tracking-wide">{showForm ? 'CHIUDI FORM' : '➕ NUOVO ANNUNCIO'}</span>
          </button>
        )}

        {/* DETTAGLI VENDITORE */}
        {selectedItem && (
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 mb-6 shadow-2xl border border-white/50 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xl text-gray-900">{selectedItem.nome}</h3>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-black text-lg text-gray-900">{selectedItem.nome_venditore} {selectedItem.cognome_venditore}</div>
                  <div className="text-sm text-emerald-700 font-semibold uppercase tracking-wide">Venditore</div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-green-500/90 rounded-lg flex items-center justify-center shadow-lg">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <a href={`tel:${selectedItem.telefono}`} className="font-bold text-lg text-green-600 hover:text-green-700">{selectedItem.telefono}</a>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 bg-blue-500/90 rounded-lg flex items-center justify-center shadow-lg">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <a href={`mailto:${selectedItem.email}`} className="font-bold text-lg text-blue-600 hover:text-blue-700 break-all">{selectedItem.email}</a>
                </div>
              </div>
              <div className="pt-4">
                <button onClick={() => handleContact(selectedItem)} 
                        className="w-full py-3 px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-xl text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                  <MessageCircle className="w-6 h-6" /> 📱 Contatta su WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORM */}
        {showForm && (
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-2xl border border-white/50">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-semibold text-base mb-2 flex items-center gap-2 text-gray-800">📸 Foto Prodotto</label>
                <input ref={fileInputRef} id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>
                <label htmlFor="image-upload" className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all p-8">
                  {newItem.immaginePreview ? (
                    <div className="w-full h-full relative rounded-lg overflow-hidden shadow-lg">
                      <img src={newItem.immaginePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={(e) => {e.preventDefault();e.stopPropagation();resetFileInput();}} 
                              className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-semibold text-gray-700 mb-1">Clicca per caricare foto</p>
                      <p className="text-sm text-gray-500">Formato JPG/PNG - Max 5MB</p>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="block font-semibold text-sm mb-2 text-gray-800">📝 Nome Articolo *</label>
                <input value={newItem.nome} onChange={(e) => setNewItem({...newItem, nome: e.target.value})} className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all" required />
              </div>
              <div>
                <label className="block font-semibold text-sm mb-2 text-gray-800">💰 Prezzo (€) *</label>
                <input type="number" step="0.01" min="0.01" value={newItem.prezzo} onChange={(e) => setNewItem({...newItem, prezzo: e.target.value})} className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all" required />
              </div>
              <div>
                <label className="block font-semibold text-sm mb-2 flex items-center gap-2 text-gray-800">
                  <User className="w-4 h-4"/> Nome Venditore *
                </label>
                <input value={newItem.nome_venditore} onChange={(e) => setNewItem({...newItem, nome_venditore: e.target.value})} className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all" required />
              </div>
              <div>
                <label className="block font-semibold text-sm mb-2 flex items-center gap-2 text-gray-800">
                  <User className="w-4 h-4"/> Cognome Venditore *
                </label>
                <input value={newItem.cognome_venditore} onChange={(e) => setNewItem({...newItem, cognome_venditore: e.target.value})} className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all" required />
              </div>
              <div>
                <label className="block font-semibold text-sm mb-2 flex items-center gap-2 text-gray-800">
                  <Mail className="w-4 h-4"/> Email *
                </label>
                <input type="email" value={newItem.email} onChange={(e) => setNewItem({...newItem, email: e.target.value})} className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all" required />
              </div>
              <div>
                <label className="block font-semibold text-sm mb-2 flex items-center gap-2 text-gray-800">
                  <Phone className="w-4 h-4"/> Telefono *
                </label>
                <input type="tel" value={newItem.telefono} onChange={(e) => setNewItem({...newItem, telefono: e.target.value})} className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all" required />
              </div>

              <div className="md:col-span-2">
                <button type="submit" disabled={publishing} className="w-full py-4 px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                  {publishing ? (<><Loader2 className="w-6 h-6 animate-spin" /> Pubblicando...</>) : (<>🚀 PUBBLICA ANNUNCIO</>)}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {items.map((item) => (
            <div key={item.id} className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all border border-white/50 group h-full flex flex-col">
              <div 
                className="h-48 rounded-2xl mb-4 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 cursor-pointer group-hover:scale-105 transition-all relative"
                onClick={() => setSelectedItem(item)}
              >
                <img src={item.immagine_url} alt={item.nome} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>
              
              <h3 className="font-black text-2xl text-gray-900 mb-4 leading-tight">{item.nome}</h3>
              <div className={`text-3xl font-black mb-6 px-4 py-3 rounded-2xl shadow-xl ${item.venduto ? 'text-gray-500 bg-gray-100' : 'text-emerald-600 bg-emerald-50'}`}>
                €{item.prezzo?.toFixed(2)}
              </div>

              <div className="space-y-3 mt-auto">
                {!item.venduto ? (
                  <button onClick={() => handleContact(item)} 
                          className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4" /> Contatta
                  </button>
                ) : (
                  <div className="w-full py-2 px-4 bg-gray-400 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl">
                    <CheckCircle className="w-4 h-4" /> Venduto
                  </div>
                )}
                
                {user && (
                  <button onClick={() => handleToggleSold(item.id, item.venduto)} 
                          className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4" /> {item.venduto ? 'Disponibile' : 'Venduto'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-24 text-white">
            <ShoppingCart className="w-24 h-24 mx-auto mb-8 opacity-75 animate-pulse" />
            <h3 className="text-4xl font-black mb-6 bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Nessun articolo</h3>
            <p className="text-xl text-gray-300 mb-8 font-semibold">Pubblica il primo annuncio!</p>
            {user && (
              <button onClick={() => setShowForm(true)} className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-2xl text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all flex items-center gap-3 mx-auto">
                <Plus className="w-6 h-6" /> Pubblica Ora!
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
