/* eslint-disable react/no-unescaped-entities */
import { useEffect, useMemo, useState } from "react";
import "@/App.css";
import axios from "axios";
import { ArrowRight, Bot, Check, ChevronDown, Clock3, Copy, Heart, ImagePlus, Instagram, MapPin, Menu, Minus, Phone, Plus, Send, ShoppingBag, Sparkles, Star, X } from "lucide-react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND}/api`;
const phone = "+905414408094";
const phoneLabel = "0541 440 80 94";
const categories = ["Tümü", "Hamur İşi", "Zeytinyağlılar", "Köfteler & Salatalar", "Kurabiyeler & Tatlılar"];
const categoryIds = { "Tümü": "tumu", "Hamur İşi": "hamur-isi", "Zeytinyağlılar": "zeytinyaglilar", "Köfteler & Salatalar": "kofteler-salatalar", "Kurabiyeler & Tatlılar": "kurabiyeler-tatlilar" };
const img = {
  borek: "https://images.pexels.com/photos/38356208/pexels-photo-38356208.jpeg?auto=compress&cs=tinysrgb&w=940",
  pogaca: "https://images.pexels.com/photos/17101845/pexels-photo-17101845.jpeg?auto=compress&cs=tinysrgb&w=940",
  sarma: "https://images.pexels.com/photos/31928139/pexels-photo-31928139.jpeg?auto=compress&cs=tinysrgb&w=940",
  kofte: "https://images.pexels.com/photos/32402079/pexels-photo-32402079.jpeg?auto=compress&cs=tinysrgb&w=940",
  cigkofte: "https://images.pexels.com/photos/9399948/pexels-photo-9399948.jpeg?auto=compress&cs=tinysrgb&w=940",
  salata: "https://images.pexels.com/photos/9399948/pexels-photo-9399948.jpeg?auto=compress&cs=tinysrgb&w=940",
  tatli: "https://images.pexels.com/photos/8681910/pexels-photo-8681910.jpeg?auto=compress&cs=tinysrgb&w=940",
  sutlu: "https://images.pexels.com/photos/14841923/pexels-photo-14841923.jpeg?auto=compress&cs=tinysrgb&w=940",
  kurabiye: "https://images.pexels.com/photos/14808333/pexels-photo-14808333.jpeg?auto=compress&cs=tinysrgb&w=940",
};
const fallbackMenu = [
  ["milfoy-tepsi", "Milföylü Tepsi Böreği", "Hamur İşi", 800, "tepsi", "Kat kat, çıtır ve fırından taze.", "borek"], ["katmer-pogaca", "Katmer Poğaça", "Hamur İşi", 600, "kg", "Tel tel açılan yumuşacık poğaça.", "pogaca"], ["peynirli-pogaca", "1 Tepsi Peynirli Poğaça", "Hamur İşi", 500, "tepsi", "Ev yapımı peynirli poğaça.", "pogaca"], ["sade-pogaca", "1 Tepsi Sade Poğaça", "Hamur İşi", 400, "tepsi", "Çayın yanına taptaze.", "pogaca"], ["sakalli-pogaca", "1 Tepsi Sakallı Poğaça", "Hamur İşi", 500, "tepsi", "Peynirli, yumuşak ve doyurucu.", "pogaca"], ["midye-borek", "Midye Börek", "Hamur İşi", 550, "kg", "Özel kıvrımıyla çıtır börek.", "borek"], ["gul-boregi", "Gül Böreği", "Hamur İşi", 550, "kg", "Peynirli veya patatesli hazırlanır.", "borek"], ["kalem-boregi", "Kalem Böreği", "Hamur İşi", 450, "kg", "Çıtır çıtır atıştırmalık.", "borek"], ["yaprak-sarma-cig", "Yaprak Sarma", "Zeytinyağlılar", 700, "çiğ kg", "İncecik sarılmış.", "sarma"], ["yaprak-sarma-pismis", "Yaprak Sarma", "Zeytinyağlılar", 750, "pişmiş kg", "Servise hazır.", "sarma"], ["kuru-dolma-cig", "Kuru Gaziantep Dolma", "Zeytinyağlılar", 650, "çiğ kg", "Geleneksel baharatlarıyla.", "sarma"], ["kuru-dolma-pismis", "Kuru Gaziantep Dolma", "Zeytinyağlılar", 700, "pişmiş kg", "Geleneksel tarifle.", "sarma"], ["lahana-sarma-cig", "Lahana Sarma", "Zeytinyağlılar", 700, "çiğ kg", "Taze lahanadan ev usulü.", "sarma"], ["lahana-sarma-pismis", "Lahana Sarma", "Zeytinyağlılar", 750, "pişmiş kg", "Pişmiş, servise hazır.", "sarma"], ["icli-kofte-dondurulmus", "İçli Köfte", "Köfteler & Salatalar", 75, "adet", "Dondurulmuş, pişirmeye hazır.", "kofte"], ["icli-kofte-kizartilmis", "İçli Köfte", "Köfteler & Salatalar", 85, "adet", "Kızartılmış, sıcak servis.", "kofte"], ["cig-kofte", "Çiğ Köfte", "Köfteler & Salatalar", 400, "kg", "Bol yeşillikli ev yapımı.", "cigkofte"], ["mercimek-kofte", "Mercimek Köftesi", "Köfteler & Salatalar", 500, "kg", "Nar ekşili, bol yeşillikli.", "cigkofte"], ["fellah-kofte", "Fellah Köftesi", "Köfteler & Salatalar", 550, "kg", "Sarımsaklı sosuyla nefis.", "cigkofte"], ["tavuklu-sehriye", "Tavuklu Şehriye Salatası", "Köfteler & Salatalar", 800, "kg", "Günlük ve taptaze.", "salata"], ["patates-salatasi", "Patates Salatası", "Köfteler & Salatalar", 500, "kg", "Ev usulü, bol yeşillikli.", "salata"], ["mor-lahana", "Mor Lahana Salatası", "Köfteler & Salatalar", 450, "kg", "Renkli, kıtır ve taze.", "salata"], ["kuskus-tarator", "Kuskuslu Havuç Tarator", "Köfteler & Salatalar", 600, "kg", "Yoğurtlu, hafif ve doyurucu.", "salata"], ["havuc-tarator", "Havuç Tarator", "Köfteler & Salatalar", 400, "kg", "Sarımsaklı yoğurtla.", "salata"], ["cheesecake", "Cheesecake", "Kurabiyeler & Tatlılar", 2000, "borcam", "İpeksi dokulu ev yapımı.", "sutlu"], ["trilece", "Trileçe", "Kurabiyeler & Tatlılar", 1000, "borcam", "Üç sütlü, hafif ve yumuşak.", "sutlu"], ["orman-meyveli-trilece", "Orman Meyveli Trileçe", "Kurabiyeler & Tatlılar", 1100, "borcam", "Meyveli ve ferah.", "sutlu"], ["islak-kek", "Islak Kek", "Kurabiyeler & Tatlılar", 800, "kg / borcam", "Bol çikolatalı ev keki.", "kurabiye"], ["aglayan-pasta", "Ağlayan Pasta", "Kurabiyeler & Tatlılar", 850, "kg / borcam", "Çikolata soslu yumuşak pasta.", "sutlu"], ["coco-star", "Coco Star", "Kurabiyeler & Tatlılar", 1100, "kg", "Hindistan cevizli özel tatlı.", "kurabiye"], ["latte-pasta", "Latte Pasta", "Kurabiyeler & Tatlılar", 1200, "borcam", "Kahve aromalı hafif pasta.", "sutlu"], ["sekerpare", "Şekerpare", "Kurabiyeler & Tatlılar", 600, "kg", "Şerbetini tam çekmiş.", "tatli"], ["misir-kurabiye", "Mısır Gevrekli Kurabiye", "Kurabiyeler & Tatlılar", 650, "kg", "Kıtır dokulu özel kurabiye.", "kurabiye"], ["elmali-kurabiye", "Elmalı Kurabiye", "Kurabiyeler & Tatlılar", 650, "kg", "Tarçınlı elmalı iç harç.", "kurabiye"], ["brownie", "Brownie Kurabiye", "Kurabiyeler & Tatlılar", 600, "kg", "Yoğun çikolatalı.", "kurabiye"], ["sutlu-kurabiye", "Sütlü Kurabiye", "Kurabiyeler & Tatlılar", 600, "kg", "Ağızda dağılan yumuşaklık.", "kurabiye"], ["hatay-kombe", "Hatay Kömbe (Sade)", "Kurabiyeler & Tatlılar", 600, "kg", "Geleneksel baharatlı kurabiye.", "kurabiye"], ["mah.-tuzlu", "Mahlepli Tuzlu Kurabiye", "Kurabiyeler & Tatlılar", 500, "kg", "Çayın yanına kıtır.", "kurabiye"], ["dondurma-kasik", "Dondurma Kaşık Kurabiye", "Kurabiyeler & Tatlılar", 600, "kg", "Nefis ev kurabiyesi.", "kurabiye"], ["mantar-kurabiye", "Mantar Kurabiye", "Kurabiyeler & Tatlılar", 500, "kg", "Ağızda dağılan klasik.", "kurabiye"], ["pismaniye", "Pişmaniye Kurabiye", "Kurabiyeler & Tatlılar", 500, "kg", "Hafif ve narin.", "kurabiye"], ["sade-kek", "Sade / Havuçlu Kek", "Kurabiyeler & Tatlılar", 500, "kg", "Çocukluğunuzdan gelen tat.", "kurabiye"], ["bonibon", "Bonibonlu Kurabiye", "Kurabiyeler & Tatlılar", 600, "kg", "Renkli ve neşeli.", "kurabiye"],
].map(([id, name, category, price, unit, description, kind]) => ({ id, name, category, price, unit, description, image: img[kind] }));

const resolveImg = (src) => (src && src.startsWith("/") ? BACKEND + src : src);
const whatsappLink = (text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
const getSessionId = () => { let id = window.localStorage.getItem("ai-session"); if (!id) { id = crypto.randomUUID(); window.localStorage.setItem("ai-session", id); } return "web-" + id; };

async function streamChat(message, mode, onDelta) {
  const response = await fetch(`${API}/ai/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, mode, session_id: getSessionId() }) });
  if (!response.ok || !response.body) throw new Error("AI unavailable");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";
    chunks.forEach((chunk) => {
      const line = chunk.split("\n").find((entry) => entry.startsWith("data: "));
      if (!line) return;
      const payload = line.slice(6);
      if (payload === "[DONE]") return;
      const data = JSON.parse(payload);
      if (data.error) throw new Error(data.error);
      onDelta(data.content);
    });
  }
}

function Home() {
  const [menu, setMenu] = useState(fallbackMenu);
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [neighborhood, setNeighborhood] = useState("");
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMode, setAiMode] = useState("customer");
  const [aiInput, setAiInput] = useState("");
  const [aiSending, setAiSending] = useState(false);
  const [aiMessages, setAiMessages] = useState([{ role: "assistant", content: "Merhaba! Menü ve fiyatlar hakkında merak ettiğiniz her şeyi sorabilirsiniz." }]);
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [ownerToken, setOwnerToken] = useState(() => window.sessionStorage.getItem("owner-token") || "");
  const [ownerPass, setOwnerPass] = useState("");
  const [ownerError, setOwnerError] = useState("");
  const [ownerTab, setOwnerTab] = useState("photo");
  const [photoItem, setPhotoItem] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoMsg, setPhotoMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [zones, setZones] = useState([]);
  const [zoneInput, setZoneInput] = useState("");
  const [announceText, setAnnounceText] = useState("");
  const [announcing, setAnnouncing] = useState(false);

  const orderText = "Merhaba, Kocaeli Gaziantep Mutfağı'ndan sipariş vermek istiyorum.";
  const authH = () => ({ Authorization: `Bearer ${ownerToken}` });

  useEffect(() => { axios.get(`${API}/menu`).then((response) => setMenu(response.data)).catch(() => {}); }, []);
  useEffect(() => { if (ownerToken && ownerOpen) axios.get(`${API}/delivery/zones`).then((r) => setZones(r.data.zones)).catch(() => {}); }, [ownerToken, ownerOpen]);

  const filteredMenu = useMemo(() => activeCategory === "Tümü" ? menu : menu.filter((item) => item.category === activeCategory), [activeCategory, menu]);
  const cartItems = useMemo(() => Object.entries(cart).map(([id, qty]) => { const found = menu.find((i) => i.id === id); return found ? { ...found, qty } : null; }).filter(Boolean), [cart, menu]);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const addToCart = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const changeQty = (id, delta) => setCart((c) => { const q = (c[id] || 0) + delta; const next = { ...c }; if (q <= 0) delete next[id]; else next[id] = q; return next; });
  const cartText = "Merhaba, Kocaeli Gaziantep Mutfağı'ndan sipariş vermek istiyorum:\n\n" + cartItems.map((i) => `${i.qty} x ${i.name} (${i.unit}) — ${(i.price * i.qty).toLocaleString("tr-TR")} TL`).join("\n") + `\n\nToplam: ${cartTotal.toLocaleString("tr-TR")} TL`;

  const sendAI = async (event) => {
    event.preventDefault();
    const text = aiInput.trim();
    if (!text || aiSending) return;
    setAiInput(""); setAiSending(true);
    setAiMessages((items) => [...items, { role: "user", content: text }, { role: "assistant", content: "" }]);
    try {
      await streamChat(text, aiMode, (chunk) => setAiMessages((items) => { const next = [...items]; next[next.length - 1] = { role: "assistant", content: next[next.length - 1].content + chunk }; return next; }));
    } catch {
      setAiMessages((items) => { const next = [...items]; next[next.length - 1] = { role: "assistant", content: "Şu an yanıt veremiyorum. WhatsApp'tan bize yazabilirsiniz." }; return next; });
    } finally { setAiSending(false); }
  };

  const checkZone = async (event) => {
    event.preventDefault();
    if (!neighborhood.trim()) return;
    setChecking(true);
    try { const response = await axios.post(`${API}/delivery-check`, { neighborhood }); setDeliveryResult(response.data); }
    catch { setDeliveryResult({ available: false, message: "Şu an kontrol edemedik, WhatsApp'tan bize yazabilirsiniz." }); }
    finally { setChecking(false); }
  };

  const ownerLogin = async (event) => {
    event.preventDefault();
    setOwnerError("");
    try {
      const response = await axios.post(`${API}/admin/login`, { password: ownerPass });
      window.sessionStorage.setItem("owner-token", response.data.token);
      setOwnerToken(response.data.token);
      setOwnerPass("");
    } catch { setOwnerError("Şifre hatalı, tekrar deneyin."); }
  };

  const uploadPhoto = async (event) => {
    event.preventDefault();
    if (!photoItem || !photoFile || uploading) return;
    setUploading(true); setPhotoMsg("");
    try {
      const form = new FormData();
      form.append("file", photoFile);
      await axios.post(`${API}/admin/menu/${photoItem}/image`, form, { headers: authH() });
      const refreshed = await axios.get(`${API}/menu`);
      setMenu(refreshed.data);
      setPhotoMsg("Fotoğraf güncellendi, sitede yayında.");
      setPhotoFile(null);
    } catch { setPhotoMsg("Yükleme başarısız, tekrar deneyin."); }
    finally { setUploading(false); }
  };

  const addZone = async (event) => {
    event.preventDefault();
    if (!zoneInput.trim()) return;
    try { const response = await axios.post(`${API}/admin/delivery/zones`, { name: zoneInput.trim() }, { headers: authH() }); setZones(response.data.zones); setZoneInput(""); } catch {}
  };
  const removeZone = async (name) => {
    try { const response = await axios.delete(`${API}/admin/delivery/zones/${encodeURIComponent(name)}`, { headers: authH() }); setZones(response.data.zones); } catch {}
  };

  const makeAnnouncement = async () => {
    if (announcing) return;
    setAnnouncing(true); setAnnounceText("");
    try {
      await streamChat("Bugünün günlük menüsü için müşterilerimle WhatsApp durumunda ve Instagram'da paylaşacağım kısa, sıcak bir duyuru yaz. Menüden 4-5 ürünü fiyatlarıyla öne çıkar, ev yapımı olduğunu vurgula ve sipariş için WhatsApp'a yönlendir.", "owner", (chunk) => setAnnounceText((t) => t + chunk));
    } catch { setAnnounceText("Şu an oluşturulamadı. Sağ alttaki AI Asistan'ın İşletme modunu deneyebilirsiniz."); }
    finally { setAnnouncing(false); }
  };

  return <div className="site-shell">
    <div className="top-note"><Sparkles size={14} /> Ev yapımı günlük lezzetler <span>•</span> Özel gün siparişleri alınır</div>
    <header className="navbar"><a className="brand" href="#anasayfa" data-testid="brand-home-link"><span className="brand-mark">KG</span><span>Kocaeli <em>Gaziantep Mutfağı</em></span></a><button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} data-testid="mobile-menu-button">{mobileOpen ? <X /> : <Menu />}</button><nav className={mobileOpen ? "nav-links open" : "nav-links"}><a href="#menu" data-testid="nav-menu-link">Fiyat Listesi</a><a href="#hakkimda" data-testid="nav-about-link">Hakkımızda</a><a href="#teslimat" data-testid="nav-delivery-link">Sipariş</a><a href={`tel:${phone}`} className="nav-phone" data-testid="nav-phone-link"><Phone size={16} /> {phoneLabel}</a><a href={whatsappLink(orderText)} target="_blank" rel="noreferrer" className="whatsapp-btn" data-testid="nav-whatsapp-link">WhatsApp'tan Yaz</a></nav></header>
    <main id="anasayfa">
      <section className="hero section-wrap"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line" /> Kocaeli'den sofranıza</p><h1>Ev yapımı,<br /><i>günlük</i> lezzetler.</h1><p className="hero-text">Gaziantep'in eşsiz tatlarını, evimizin mutfağında özenle hazırlıyoruz. Hamur işleri, zeytinyağlılar, köfteler ve tatlılar.</p><div className="hero-actions"><a href="#menu" className="primary-btn" data-testid="hero-menu-button">Fiyat listesini gör <ArrowRight size={17} /></a><a href={whatsappLink(orderText)} target="_blank" rel="noreferrer" className="text-link" data-testid="hero-whatsapp-link">WhatsApp'tan sipariş ver <span>↗</span></a></div><div className="hero-meta"><div><strong><Star size={15} fill="currentColor" /> Taze</strong><span>günlük hazırlanır</span></div><div><strong><Heart size={15} fill="currentColor" /> Ev yapımı</strong><span>sevgiyle hazırlanır</span></div></div></div><div className="hero-visual"><div className="hero-image-wrap"><img src="https://images.pexels.com/photos/37444219/pexels-photo-37444219.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200" alt="Ev yapımı Türk yemekleri ve börekler" data-testid="hero-food-image" /><div className="image-note"><span className="note-icon">✦</span><span><b>Bugün mutfakta</b><br />El açması börek var</span></div></div><div className="hero-stamp">KG<br /><span>MUTFAĞI</span></div></div></section>
      <section className="menu-section section-wrap" id="menu"><div className="section-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> Broşürdeki güncel fiyatlar</p><h2>Fiyat <i>listesi</i></h2></div><p>Her ürün evimizde, siparişiniz<br />üzerine özenle hazırlanır.</p></div><div className="category-tabs">{categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={activeCategory === category ? "active" : ""} data-testid={`category-${categoryIds[category]}-button`}>{category}</button>)}</div><div className="menu-grid">{filteredMenu.map((item) => <article className="menu-card" key={item.id} data-testid={`menu-card-${item.id}`}><div className="card-image"><img src={resolveImg(item.image)} alt={item.name} /><button className="quick-order" onClick={() => addToCart(item.id)} data-testid={`add-cart-${item.id}-button`}><ShoppingBag size={16} /> Sepete ekle</button></div><div className="card-content"><div className="card-title"><h3>{item.name}</h3><strong>{item.price.toLocaleString("tr-TR")} <small>TL</small></strong></div><p>{item.description}</p><span className="unit">{item.unit}</span></div></article>)}</div><a href={whatsappLink(orderText)} target="_blank" rel="noreferrer" className="all-menu-link" data-testid="all-menu-whatsapp-link">Menünün tamamını WhatsApp'tan sor <ArrowRight size={16} /></a></section>
      <section className="delivery-band" id="teslimat"><div className="section-wrap delivery-layout"><div><p className="eyebrow light"><span className="eyebrow-line" /> Sipariş & detaylı bilgi</p><h2>Lezzet kapında,<br /><i>mutluluk</i> sofranda.</h2><p className="delivery-intro">Özel günler ve günlük sofralarınız için sipariş alıyoruz. Teslimat detaylarını WhatsApp'tan öğrenebilirsiniz.</p></div><div className="delivery-card"><div className="delivery-card-head"><MapPin size={20} /><div><h3>Bölgeni kontrol et</h3><p>Teslimat alanımızda mısın?</p></div></div><form onSubmit={checkZone}><div className="input-wrap"><MapPin size={16} /><input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} placeholder="Mahalle adı yazın" data-testid="neighborhood-input" /><ChevronDown size={16} /></div><button className="primary-btn" type="submit" disabled={checking} data-testid="delivery-check-button">{checking ? "Kontrol ediliyor..." : "Kontrol et"}</button></form>{deliveryResult && <div className={deliveryResult.available ? "delivery-result success" : "delivery-result"} data-testid="delivery-result">{deliveryResult.available && <Check size={16} />}{deliveryResult.message}</div>}<div className="pickup-note"><Check size={14} /> Özel gün siparişleri alınır</div></div></div></section>
      <section className="about-section section-wrap" id="hakkimda"><div className="about-image"><img src="https://images.pexels.com/photos/8902024/pexels-photo-8902024.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=900" alt="Ev mutfağında yemek hazırlayan aşçı" data-testid="about-chef-image" /><span>Mutfağımızdan<br /><i>sevgiyle</i></span></div><div className="about-copy"><p className="eyebrow"><span className="eyebrow-line" /> Mutfağımızdan bir not</p><h2>“Gaziantep'in lezzeti,<br /><i>evimizin sıcaklığıyla.</i>”</h2><p>Her gün mutfağımızda, sevdiklerimiz için hazırlıyormuş gibi özenle çalışıyoruz. Geleneksel tarifleri, taze malzemeler ve ev yapımı dokunuşlarla sofralarınıza taşıyoruz.</p><p>Çünkü iyi yemek, biraz zaman ve bolca sevgi ister.</p><div className="signature">Kocaeli Gaziantep Mutfağı <span>♡</span></div></div></section>
      <section className="quote-section"><div className="quote-mark">“</div><blockquote>“Ev yapımı lezzeti arayan herkese<br />gönülden tavsiye ederim.”</blockquote><div className="quote-author"><span>KG</span><div><b>Memnun müşterilerimiz</b><small>Kocaeli, Türkiye</small></div><div className="stars">★★★★★</div></div></section>
    </main>
    <footer className="footer"><div className="footer-brand"><a className="brand" href="#anasayfa"><span className="brand-mark">KG</span><span>Kocaeli <em>Gaziantep Mutfağı</em></span></a><p>Ev yapımı günlük lezzetler.</p><button className="owner-link" onClick={() => setOwnerOpen(true)} data-testid="owner-login-button">İşletme Girişi</button></div><div><h4>Bizi bul</h4><a href={`tel:${phone}`} data-testid="footer-phone-link"><Phone size={14} /> {phoneLabel}</a><a href="https://instagram.com/kocaeli_gaziantep_mutfagi" target="_blank" rel="noreferrer" data-testid="footer-instagram-link"><Instagram size={14} /> @kocaeli_gaziantep_mutfagi</a></div><div><h4>Sipariş</h4><p><Clock3 size={14} /> Özel gün ve günlük<br /><span>siparişler alınır</span></p></div><a href={whatsappLink(orderText)} target="_blank" rel="noreferrer" className="footer-order" data-testid="footer-whatsapp-link">WhatsApp'tan sipariş ver <ArrowRight size={16} /></a></footer>

    {cartCount > 0 && <button className="cart-fab" onClick={() => setCartOpen(true)} data-testid="cart-open-button"><ShoppingBag size={17} /> Sepet ({cartCount}) — {cartTotal.toLocaleString("tr-TR")} TL</button>}
    {cartOpen && <div className="drawer-overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" data-testid="cart-drawer" onClick={(event) => event.stopPropagation()}>
      <div className="cart-head"><b>Sepetin</b><button onClick={() => setCartOpen(false)} data-testid="cart-close-button"><X size={18} /></button></div>
      <div className="cart-items">
        {cartItems.length === 0 && <p className="cart-empty" data-testid="cart-empty-note">Sepetiniz boş. Menüden ürün ekleyin.</p>}
        {cartItems.map((item) => <div className="cart-item" key={item.id} data-testid={`cart-item-${item.id}`}>
          <img src={resolveImg(item.image)} alt={item.name} />
          <div className="cart-item-info"><b>{item.name}</b><small>{item.price.toLocaleString("tr-TR")} TL / {item.unit}</small></div>
          <div className="qty"><button onClick={() => changeQty(item.id, -1)} data-testid={`cart-decrease-${item.id}`}><Minus size={12} /></button><span data-testid={`cart-qty-${item.id}`}>{item.qty}</span><button onClick={() => changeQty(item.id, 1)} data-testid={`cart-increase-${item.id}`}><Plus size={12} /></button></div>
          <span className="cart-item-price">{(item.price * item.qty).toLocaleString("tr-TR")} TL</span>
        </div>)}
      </div>
      {cartItems.length > 0 && <div className="cart-foot">
        <div className="cart-total"><span>Toplam</span><strong data-testid="cart-total">{cartTotal.toLocaleString("tr-TR")} TL</strong></div>
        <a href={whatsappLink(cartText)} target="_blank" rel="noreferrer" className="primary-btn" data-testid="cart-whatsapp-order">Siparişi WhatsApp'tan gönder <ArrowRight size={15} /></a>
        <button className="cart-clear" onClick={() => setCart({})} data-testid="cart-clear-button">Sepeti boşalt</button>
      </div>}
    </aside></div>}

    {ownerOpen && <div className="drawer-overlay" onClick={() => setOwnerOpen(false)}><div className="owner-modal" data-testid="owner-panel" onClick={(event) => event.stopPropagation()}>
      <button className="owner-close" onClick={() => setOwnerOpen(false)} data-testid="owner-close-button"><X size={18} /></button>
      <h3>İşletme Paneli</h3>
      <p className="sub">Fotoğraf, teslimat bölgesi ve duyuru yönetimi</p>
      {!ownerToken ? <form onSubmit={ownerLogin}>
        <input type="password" value={ownerPass} onChange={(event) => setOwnerPass(event.target.value)} placeholder="İşletme şifresi" data-testid="owner-password-input" />
        <button className="primary-btn" type="submit" data-testid="owner-login-submit">Giriş yap</button>
        {ownerError && <p className="owner-error" data-testid="owner-login-error">{ownerError}</p>}
      </form> : <>
        <div className="owner-tabs">
          <button className={ownerTab === "photo" ? "active" : ""} onClick={() => setOwnerTab("photo")} data-testid="owner-tab-photo">Fotoğraf</button>
          <button className={ownerTab === "zones" ? "active" : ""} onClick={() => setOwnerTab("zones")} data-testid="owner-tab-zones">Teslimat Bölgeleri</button>
          <button className={ownerTab === "announce" ? "active" : ""} onClick={() => setOwnerTab("announce")} data-testid="owner-tab-announce">Günlük Duyuru</button>
        </div>
        {ownerTab === "photo" && <form onSubmit={uploadPhoto}>
          <select value={photoItem} onChange={(event) => setPhotoItem(event.target.value)} data-testid="owner-product-select"><option value="">Ürün seçin</option>{menu.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>)}</select>
          <label className="file-drop" data-testid="owner-file-drop"><ImagePlus size={17} /> {photoFile ? photoFile.name : "Fotoğraf seç"}<input type="file" accept="image/*" hidden data-testid="owner-file-input" onChange={(event) => setPhotoFile(event.target.files[0] || null)} /></label>
          <button className="primary-btn" type="submit" disabled={uploading || !photoItem || !photoFile} data-testid="owner-upload-button">{uploading ? "Yükleniyor..." : "Fotoğrafı güncelle"}</button>
          {photoMsg && <p className="owner-note" data-testid="owner-upload-status">{photoMsg}</p>}
        </form>}
        {ownerTab === "zones" && <div className="owner-body">
          <div className="zone-list" data-testid="zone-list">{zones.map((zone, index) => <span className="zone-chip" key={zone} data-testid={`zone-chip-${index}`}>{zone}<button onClick={() => removeZone(zone)} data-testid={`zone-remove-${index}`} aria-label={`${zone} sil`}><X size={12} /></button></span>)}</div>
          <form onSubmit={addZone} className="zone-form"><input value={zoneInput} onChange={(event) => setZoneInput(event.target.value)} placeholder="Yeni mahalle adı" data-testid="owner-zone-input" /><button type="submit" data-testid="owner-zone-add-button" aria-label="Mahalle ekle"><Plus size={15} /></button></form>
          <p className="owner-note">Bu liste, sitedeki "Bölgeni kontrol et" sorgusunda kullanılır.</p>
        </div>}
        {ownerTab === "announce" && <div className="owner-body">
          <button className="primary-btn" onClick={makeAnnouncement} disabled={announcing} data-testid="announce-generate-button">{announcing ? "AI yazıyor..." : "Günlük duyuruyu oluştur"}</button>
          <textarea readOnly value={announceText} placeholder="Duyuru metni burada belirecek" data-testid="announce-text" />
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(announceText)} disabled={!announceText} data-testid="announce-copy-button"><Copy size={14} /> Metni kopyala</button>
        </div>}
      </>}
    </div></div>}

    <button className="ai-launcher" onClick={() => setAiOpen(!aiOpen)} data-testid="ai-assistant-launcher" aria-label="AI asistanı aç">{aiOpen ? <X /> : <Bot />}<span>AI Asistan</span></button>
    {aiOpen && <aside className="ai-panel" data-testid="ai-assistant-panel"><div className="ai-header"><div><span className="ai-icon"><Bot size={18} /></span><div><b>{aiMode === "customer" ? "Menü Asistanı" : "İşletme Yardımcısı"}</b><small>{aiMode === "customer" ? "Fiyat ve ürün sorabilirsiniz" : "İçerik fikirleri üretir"}</small></div></div><button onClick={() => setAiOpen(false)} data-testid="ai-close-button"><X size={17} /></button></div><div className="ai-mode"><button className={aiMode === "customer" ? "active" : ""} onClick={() => setAiMode("customer")} data-testid="ai-customer-mode-button">Müşteri</button><button className={aiMode === "owner" ? "active" : ""} onClick={() => setAiMode("owner")} data-testid="ai-owner-mode-button">İşletme</button></div><div className="ai-messages" data-testid="ai-message-list">{aiMessages.map((message, index) => <div className={`ai-message ${message.role}`} key={`${message.role}-${index}`} data-testid={`ai-message-${index}`}>{message.content || (aiSending ? "Yazıyor..." : "")}</div>)}</div><form className="ai-form" onSubmit={sendAI}><input value={aiInput} onChange={(event) => setAiInput(event.target.value)} placeholder={aiMode === "customer" ? "Örn. Cheesecake kaç TL?" : "Örn. Instagram metni yaz"} data-testid="ai-message-input" /><button type="submit" disabled={aiSending} data-testid="ai-send-button"><Send size={16} /></button></form></aside>}
  </div>;
}
function App() { return <Home />; }
export default App;
