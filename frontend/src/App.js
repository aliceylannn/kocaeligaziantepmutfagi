import { useEffect, useMemo, useState } from "react";
import "@/App.css";
import axios from "axios";
import { ArrowRight, Check, ChevronDown, Clock3, Heart, Instagram, MapPin, Menu, Phone, ShoppingBag, Sparkles, Star, X } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const phone = "+905551234567";
const phoneLabel = "+90 555 123 45 67";
const fallbackMenu = [
  { id: "haydari", name: "Sarımsaklı Haydari", category: "Meze", description: "Süzme yoğurt, taze nane ve zeytinyağıyla.", price: 135, unit: "500 g", image: "https://images.pexels.com/photos/36425899/pexels-photo-36425899.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", badge: "Çok sevilen" },
  { id: "mercimek-kofte", name: "Mercimek Köftesi", category: "Meze", description: "Bol yeşillik, nar ekşisi ve ev yapımı lezzet.", price: 160, unit: "20 adet", image: "https://images.pexels.com/photos/36425899/pexels-photo-36425899.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { id: "kol-borek", name: "El Açması Kol Böreği", category: "Hamur İşi", description: "İncecik açılmış yufka, peynir ve maydanoz.", price: 220, unit: "6 dilim", image: "https://images.pexels.com/photos/38356208/pexels-photo-38356208.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", badge: "Bugünün favorisi" },
  { id: "su-borek", name: "Peynirli Su Böreği", category: "Hamur İşi", description: "Kat kat, yumuşacık ve fırından yeni çıkmış.", price: 240, unit: "6 dilim", image: "https://images.pexels.com/photos/38356208/pexels-photo-38356208.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { id: "baklava", name: "Ev Baklavası", category: "Tatlı", description: "Antep fıstığı, tereyağı ve çıtır ince yufkalar.", price: 280, unit: "500 g", image: "https://images.unsplash.com/photo-1749549028894-fb0adae64a67?auto=format&fit=crop&w=900&q=85" },
  { id: "irmik-helvasi", name: "Çam Fıstıklı İrmik Helvası", category: "Tatlı", description: "Tereyağlı, mis kokulu ve tam kıvamında.", price: 180, unit: "500 g", image: "https://images.unsplash.com/photo-1749549028894-fb0adae64a67?auto=format&fit=crop&w=900&q=85" },
];

const whatsappLink = (text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

function Home() {
  const [menu, setMenu] = useState(fallbackMenu);
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [neighborhood, setNeighborhood] = useState("");
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    axios.get(`${API}/menu`).then((response) => setMenu(response.data)).catch(() => {});
  }, []);

  const filteredMenu = useMemo(() => activeCategory === "Tümü" ? menu : menu.filter((item) => item.category === activeCategory), [activeCategory, menu]);
  const orderText = "Merhaba, Ev Lezzetleri'nden sipariş vermek istiyorum.";

  const checkZone = async (event) => {
    event.preventDefault();
    if (!neighborhood.trim()) return;
    setChecking(true);
    try { const response = await axios.post(`${API}/delivery-check`, { neighborhood }); setDeliveryResult(response.data); } catch { setDeliveryResult({ available: false, message: "Şu an kontrol edemedik, WhatsApp'tan bize yazabilirsiniz." }); } finally { setChecking(false); }
  };

  return (
    <div className="site-shell">
      <div className="top-note"><Sparkles size={14} /> Her sabah taze hazırlanır <span>•</span> Aynı gün teslimat</div>
      <header className="navbar"><a className="brand" href="#anasayfa" data-testid="brand-home-link"><span className="brand-mark">E</span><span>Ev <em>Lezzetleri</em></span></a><button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} data-testid="mobile-menu-button">{mobileOpen ? <X /> : <Menu />}</button><nav className={mobileOpen ? "nav-links open" : "nav-links"}><a href="#menu" data-testid="nav-menu-link">Günlük Menü</a><a href="#hakkimda" data-testid="nav-about-link">Hakkımda</a><a href="#teslimat" data-testid="nav-delivery-link">Teslimat</a><a href={`tel:${phone}`} className="nav-phone" data-testid="nav-phone-link"><Phone size={16} /> {phoneLabel}</a><a href={whatsappLink(orderText)} target="_blank" rel="noreferrer" className="whatsapp-btn" data-testid="nav-whatsapp-link">WhatsApp'tan Yaz</a></nav></header>

      <main id="anasayfa">
        <section className="hero section-wrap"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line" /> Kadıköy'den sofranıza</p><h1>Ev sıcaklığında,<br /><i>kalpten</i> sofralar.</h1><p className="hero-text">Her gün kendi mutfağımızda, mevsimin en güzel malzemeleriyle hazırladığımız meze, börek ve tatlılar.</p><div className="hero-actions"><a href="#menu" className="primary-btn" data-testid="hero-menu-button">Bugünün menüsünü gör <ArrowRight size={17} /></a><a href={whatsappLink(orderText)} target="_blank" rel="noreferrer" className="text-link" data-testid="hero-whatsapp-link">WhatsApp'tan sipariş ver <span>↗</span></a></div><div className="hero-meta"><div><strong><Star size={15} fill="currentColor" /> 4.9</strong><span>komşularımızın puanı</span></div><div><strong><Heart size={15} fill="currentColor" /> 100%</strong><span>sevgiyle hazırlanır</span></div></div></div><div className="hero-visual"><div className="hero-image-wrap"><img src="https://images.pexels.com/photos/37444219/pexels-photo-37444219.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200" alt="Ev yapımı Türk yemekleri ve börekler" data-testid="hero-food-image" /><div className="image-note"><span className="note-icon">✦</span><span><b>Bugün mutfakta</b><br />El açması börek var</span></div></div><div className="hero-stamp">EV<br /><span>YAPIMI</span></div></div></section>

        <section className="menu-section section-wrap" id="menu"><div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> Her gün değişir</p><h2>Bugünün <i>menüsü</i></h2></div><p>Az ve öz hazırlıyoruz; her tabak<br />tazeliğini korusun diye.</p></div><div className="category-tabs">{["Tümü", "Meze", "Hamur İşi", "Tatlı"].map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={activeCategory === category ? "active" : ""} data-testid={`category-${category.toLowerCase().replaceAll(" ", "-")}-button`}>{category}</button>)}</div><div className="menu-grid">{filteredMenu.map((item) => <article className="menu-card" key={item.id} data-testid={`menu-card-${item.id}`}><div className="card-image"><img src={item.image} alt={item.name} />{item.badge && <span className="card-badge">{item.badge}</span>}<button className="quick-order" onClick={() => window.open(whatsappLink(`${orderText}\n\n${item.name} - ${item.price} TL`), "_blank")} data-testid={`quick-order-${item.id}-button`}><ShoppingBag size={16} /> Sipariş ver</button></div><div className="card-content"><div className="card-title"><h3>{item.name}</h3><strong>{item.price} <small>TL</small></strong></div><p>{item.description}</p><span className="unit">{item.unit}</span></div></article>)}</div><a href={whatsappLink(orderText)} target="_blank" rel="noreferrer" className="all-menu-link" data-testid="all-menu-whatsapp-link">Menünün tamamını WhatsApp'tan sor <ArrowRight size={16} /></a></section>

        <section className="delivery-band" id="teslimat"><div className="section-wrap delivery-layout"><div><p className="eyebrow light"><span className="eyebrow-line" /> Sana nasıl ulaşalım?</p><h2>Kapına kadar mı,<br /><i>sofrana mı</i> bekliyoruz?</h2><p className="delivery-intro">Kadıköy ve çevresine teslim ediyor, dilerseniz Moda'daki mutfağımızdan elden teslim de yapıyoruz.</p></div><div className="delivery-card"><div className="delivery-card-head"><MapPin size={20} /><div><h3>Bölgeni kontrol et</h3><p>Teslimat alanımızda mısın?</p></div></div><form onSubmit={checkZone}><div className="input-wrap"><MapPin size={16} /><input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} placeholder="Mahalle adı yazın" data-testid="neighborhood-input" /><ChevronDown size={16} /></div><button className="primary-btn" type="submit" disabled={checking} data-testid="delivery-check-button">{checking ? "Kontrol ediliyor..." : "Kontrol et"}</button></form>{deliveryResult && <div className={deliveryResult.available ? "delivery-result success" : "delivery-result"} data-testid="delivery-result">{deliveryResult.available && <Check size={16} />}{deliveryResult.message}</div>}<div className="pickup-note"><Check size={14} /> Elden teslim seçeneği her zaman açık</div></div></div></section>

        <section className="about-section section-wrap" id="hakkimda"><div className="about-image"><img src="https://images.pexels.com/photos/8902024/pexels-photo-8902024.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=900" alt="Ev mutfağında yemek hazırlayan aşçı" data-testid="about-chef-image" /><span>Mutfağımızdan<br /><i>sevgiyle</i></span></div><div className="about-copy"><p className="eyebrow"><span className="eyebrow-line" /> Mutfağımızdan bir not</p><h2>“Annemin tarifleri,<br /><i>benim ellerimle.</i>”</h2><p>Ben Zeynep. Yıllardır sevdiklerime yaptığım yemekleri şimdi komşularımla paylaşmak için buradayım. Her sabah erkenden mutfağa giriyor, hiçbir şeyi aceleye getirmeden hazırlıyorum.</p><p>Çünkü iyi yemek, biraz zaman ve bolca sevgi ister.</p><div className="signature">Zeynep <span>♡</span></div></div></section>

        <section className="quote-section"><div className="quote-mark">“</div><blockquote>“Börekleri o kadar taze ve lezzetli ki,<br />sanki annem yapmış gibi.”</blockquote><div className="quote-author"><span>FD</span><div><b>Fatma D.</b><small>Moda, İstanbul</small></div><div className="stars">★★★★★</div></div></section>
      </main>
      <footer className="footer"><div className="footer-brand"><a className="brand" href="#anasayfa"><span className="brand-mark">E</span><span>Ev <em>Lezzetleri</em></span></a><p>Ev sıcaklığında, kalpten sofralar.</p></div><div><h4>Bizi bul</h4><a href={`tel:${phone}`} data-testid="footer-phone-link"><Phone size={14} /> {phoneLabel}</a><a href="https://instagram.com" target="_blank" rel="noreferrer" data-testid="footer-instagram-link"><Instagram size={14} /> @evlezzetleri</a></div><div><h4>Çalışma saatleri</h4><p><Clock3 size={14} /> Pazartesi – Cumartesi<br /><span>09:00 – 19:00</span></p></div><a href={whatsappLink(orderText)} target="_blank" rel="noreferrer" className="footer-order" data-testid="footer-whatsapp-link">WhatsApp'tan sipariş ver <ArrowRight size={16} /></a></footer>
    </div>
  );
}

function App() {
  return (
    <Home />
  );
}

export default App;
