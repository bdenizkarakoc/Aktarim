# Aktarım

Bilgisayar ↔ telefon (iPhone/Samsung) dosya, fotoğraf, video, belge ve yazı aktarımı; yerel ağda çalışır.

- `Aktarim.ps1`: Windows sürümü (PowerShell 5.1 uyumlu). Dosya **UTF-8 BOM + CRLF** kalmalı; PS 5.1'e özgü olmayan
  sözdizimi (`??`, `?:`, `-AsHashtable`) kullanma.
- `aktarim.py`: aynı API ve veri biçimiyle Python sürümü (yalnızca standart kitaplık).
- `web/`: iki sürümün de sunduğu iOS görünümlü arayüz; dinamik metni yalnızca `textContent` ile yaz.
- `Kur.ps1`: tek satırlık kurulum (`irm .../Kur.ps1 | iex`) → `C:\Program Files\Aktarim`, Başlat menüsü/masaüstü
  kısayolu, Gönder menüsü, güvenlik duvarı, Uygulamalar kaydı; `Kaldir.ps1` geri alır. İkisi de ASCII kalmalı;
  `Kur.ps1`'deki `$files` listesine yeni dosyaları ekle.
- "Sonradan Sil": 7 / 14 / 30 gün, geri yüklenebilir, süre dolunca kalıcı silinir.
- API değişirse iki sunucuyu birlikte güncelle; testler: `python -m pytest tests -q`.
