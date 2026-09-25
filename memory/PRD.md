# Kocaeli Gaziantep Mutfağı — Ürün Gereksinim Dokümanı

## Original Problem Statement
“Merhaba ben evde yemek yapıp satıyorum. Bunun için bir site kurmanı istiyorum.”

## User Choices
- Ana amaç: Günlük menüyü/fiyat listesini gösterip WhatsApp’tan sipariş almak
- Ürünler: Meze, hamur işi ve tatlılar; yüklenen broşürdeki gerçek fiyat listesi
- İletişim: WhatsApp ve telefon
- Stil: Sıcak, samimi, ev yapımı; broşürdeki krem-kahve marka dili

## Architecture Decisions
- Frontend: React single-page vitrin, responsive ve kategori filtreli
- Backend: FastAPI `/api/menu` ve `/api/delivery-check` uçları
- Database: Mevcut MongoDB bağlantısı korunuyor; bu MVP’de sabit broşür kataloğu okunabilir API olarak sunuluyor
- Sipariş: WhatsApp deep-link; ürün adı ve fiyatı önceden dolduruluyor

## Implemented
- Kocaeli Gaziantep Mutfağı marka adı, 0541 440 80 94 telefon ve Instagram bağlantısı
- Broşürdeki 36 ürün ve fiyatı; hamur işi, zeytinyağlılar, köfteler & salatalar, kurabiyeler & tatlılar kategorileri
- Hero, fiyat listesi, ürün kartları, teslimat bölgesi kontrolü, hakkımızda, müşteri yorumu ve footer
- WhatsApp sipariş butonları ve ürün bazlı sipariş aksiyonu
- Mobil navigasyon, responsive kart düzeni ve stabil `data-testid` kimlikleri

## Prioritized Backlog
- P0: İşletme sahibinin kendi panelinden ürün/fiyat güncellemesi
- P1: Buzluk ürünleri ve özel gün siparişleri için ayrı sipariş formu
- P1: Teslimat ücretini mahalleye göre gösterme
- P2: Broşür QR kodunu doğrudan WhatsApp siparişine bağlama