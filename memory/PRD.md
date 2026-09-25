# PRD — Kocaeli Gaziantep Mutfağı

## Orijinal Problem
"Merhaba ben evde yemek yapıp satıyorum. Bunun için bir site kurmanı istiyorum" — Evde yemek yapıp satan bir kullanıcı için günlük menü (hamur işi, zeytinyağlı, köfte/salata, tatlı) sergileyen, WhatsApp üzerinden sipariş alan site.

## Kullanıcı Kişileri
- Müşteri: Menüye bakar, sepete ekler, WhatsApp/telefon ile sipariş verir, teslimat bölgesini sorgular, AI asistana soru sorar.
- İşletme sahibi: Şifreli İşletme Paneli'nden ürün fotoğrafı yükler, teslimat mahallelerini yönetir, AI ile günlük duyuru üretir.

## Mimari
- React frontend (App.js, App.css, sıcak/organik tasarım) — sepet, işletme paneli modalı, AI sohbet paneli
- FastAPI backend (server.py) — menü (+foto override'ları), teslimat bölgeleri (Mongo), admin auth (JWT, ADMIN_PASSWORD), Emergent Object Storage'a fotoğraf yükleme, AI sohbet (SSE, gpt-5.4)
- MongoDB koleksiyonları: ai_messages, menu_overrides, delivery_zones, files, status_checks

## Temel Gereksinimler (sabit)
- WhatsApp sipariş (sepetli, toplam tutarlı mesaj)
- Telefonla arama (0541 440 80 94)
- Mahalle teslimat kontrolü (yönetilebilir liste)
- Sıcak, ev yapımı, artizan görsel dil; Türkçe arayüz

## Tamamlananlar
- 2026-09: İlk sürüm — menü, WhatsApp, teslimat kontrolü, broşür fiyatları
- 2026-09: AI Asistan (müşteri + işletme modu, GPT-5.4, sohbet geçmişi)
- 2026-09-25: Ürün fotoğrafları düzeltildi (8 doğrulanmış kategori fotoğrafı)
- 2026-09-25: Sipariş sepeti (adet, toplam, WhatsApp'a özetli gönderim)
- 2026-09-25: İşletme Paneli — şifreli giriş, ürün fotoğrafı yükleme (object storage), teslimat bölgesi ekle/sil, AI günlük duyuru oluşturucu
- 2026-09-25: İşletme Paneli'ne "Şifre" sekmesi — sahibi panelden kendi şifresini değiştirebiliyor (bcrypt ile Mongo'da saklanıyor)
- 2026-09-25: Teslimat bölgeleri Kocaeli/İzmit varsayılanlarına taşındı ve veritabanından yönetilir hale geldi

## Kalan / Backlog
- P1: Teslimat mahalle listesi kullanıcının gerçek listesiyle doğrulanmalı (panelden kendisi de düzenleyebilir)
- P1: Admin şifresi yayına almadan önce değiştirilmeli (backend/.env ADMIN_PASSWORD)
- P2: Menü ürün/fiyat düzenleme paneli
- P2: Günlük duyurunun her sabah otomatik hazırlanması (şu an tek tıkla manuel)
- P2: Siparişlerin kaydı/bildirimi

## Sonraki Görevler
1. Kullanıcı gerçek mahalle listesini panelden düzeltsin veya bize göndersin
2. İşletme kendi ürün fotoğraflarını panelden yüklesin
3. Yayına alma (Deploy) — önce admin şifresini değiştir
