# PRD — Kocaeli Gaziantep Mutfağı

## Orijinal Problem
"Merhaba ben evde yemek yapıp satıyorum. Bunun için bir site kurmanı istiyorum" — Evde yemek yapıp satan bir kullanıcı için günlük menü (hamur işi, zeytinyağlı, köfte/salata, tatlı) sergileyen, WhatsApp üzerinden sipariş alan site.

## Kullanıcı Kişileri
- Müşteri: Menüye bakar, fiyat görür, WhatsApp/telefon ile sipariş verir, teslimat bölgesini sorgular, AI asistana soru sorar.
- İşletme sahibi: AI asistanın "İşletme" modu ile sosyal medya metni ve duyuru üretir.

## Mimari
- React frontend (App.js, özel App.css, sıcak/organik tasarım)
- FastAPI backend (server.py) — menü, teslimat kontrolü, AI sohbet (SSE streaming, gpt-5.4, Emergent LLM Key)
- MongoDB: `ai_messages` (sohbet geçmişi), `status_checks`

## Temel Gereksinimler (sabit)
- WhatsApp sipariş butonları (ürün bazlı ön doldurulmuş mesaj)
- Telefonla arama (0541 440 80 94)
- Mahalle teslimat kontrolü
- Sıcak, ev yapımı, artizan görsel dil
- Türkçe arayüz

## Tamamlananlar
- 2026-09: İlk sürüm — menü, WhatsApp, teslimat kontrolü, broşür fiyatları
- 2026-09: AI Asistan (müşteri + işletme modu, GPT-5.4, sohbet geçmişi)
- 2026-09-25: Ürün fotoğrafları düzeltildi — 8 farklı doğrulanmış kategori fotoğrafı (börek, poğaça, sarma, içli köfte, çiğ köfte/salata, şerbetli tatlı, sütlü tatlı, kurabiye/kek) hem backend hem frontend yedek menüsünde

## Kalan / Backlog
- P1: Teslimat bölgeleri şu an Kadıköy/Moda vb. (İstanbul); işletme Kocaeli'de — gerçek mahalle listesiyle güncellenmeli (kullanıcıdan liste bekleniyor)
- P2: Gerçek ürün fotoğrafları (işletmenin kendi çekimleri) yükleme özelliği
- P2: Sipariş sepeti ve toplam tutar ile WhatsApp mesajı
- P2: Admin panelinden menü düzenleme

## Sonraki Görevler
1. Kullanıcıdan Kocaeli teslimat mahalleleri listesini al
2. İşletmenin kendi ürün fotoğraflarını kabul edecek yükleme akışı
3. Yayına alma (Deploy)
