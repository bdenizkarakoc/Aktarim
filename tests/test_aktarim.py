import io
import json
import sys
import threading
import time
import urllib.request
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import aktarim  # noqa: E402


@pytest.fixture
def store(tmp_path):
    return aktarim.Store(tmp_path)


def test_device_detection():
    assert aktarim.device_from_ua("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)") == "iPhone"
    assert aktarim.device_from_ua("Mozilla/5.0 (Linux; Android 14; SM-S921B)") == "Samsung"
    assert aktarim.device_from_ua("Mozilla/5.0 (Linux; Android 14; Pixel 8)") == "Android"
    assert aktarim.device_from_ua("Mozilla/5.0 (Windows NT 10.0; Win64; x64)") == "Bilgisayar"


def test_safe_name():
    assert aktarim.safe_name("../../etc/passwd") == "passwd"
    assert aktarim.safe_name("C:\\a\\b:c?.txt") == "b_c_.txt"
    assert aktarim.safe_name("") == "dosya"


def test_add_delete_restore_purge(store):
    data = b"merhaba" * 100
    it = store.add_file_stream("foto.jpg", io.BytesIO(data), len(data), "iPhone")
    assert store.path_of(it) == store.root / "Gelenler" / "foto.jpg"
    assert store.path_of(it).read_bytes() == data
    it2 = store.add_file_stream("foto.jpg", io.BytesIO(b"x"), 1, "iPhone")
    assert it2["name"] == "foto (2).jpg"
    out = store.add_file_stream("rapor.pdf", io.BytesIO(b"x"), 1, "Bilgisayar")
    assert store.path_of(out).parent.name == "Gönderilenler"
    assert it["mime"] == "image/jpeg"
    store.soft_delete(it["id"], 7)
    lst = store.listing()
    assert it["id"] not in [i["id"] for i in lst["items"]] and lst["bin"][0]["retention_days"] == 7
    assert store.path_of(it).parent.name == "Sonradan Sil"
    store.restore(it["id"])
    assert store.path_of(it) == store.root / "Gelenler" / "foto.jpg"
    store.soft_delete(it["id"], 14)
    assert store.purge_expired(now=time.time() + 13 * aktarim.DAY) == 0
    assert store.purge_expired(now=time.time() + 15 * aktarim.DAY) == 1
    assert not store.path_of(it).exists() and store.get(it["id"]) is None


def test_bad_retention_and_partial_upload(store):
    t = store.add_text("not", "Samsung")
    with pytest.raises(ValueError):
        store.soft_delete(t["id"], 3)
    with pytest.raises(IOError):
        store.add_file_stream("x.bin", io.BytesIO(b"abc"), 10, "iPhone")
    assert not list(store.root.rglob("*.part"))


def test_persistence(tmp_path):
    s = aktarim.Store(tmp_path)
    t = s.add_text("kalıcı", "iPhone")
    s2 = aktarim.Store(tmp_path)
    assert s2.get(t["id"])["text"] == "kalıcı"
    assert s2.cfg["token"] == s.cfg["token"]


def test_http_roundtrip(store):
    srv = aktarim.make_server(store, host="127.0.0.1", port=0)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}"
    key = {"X-Aktarim-Key": store.cfg["token"]}
    try:
        with pytest.raises(urllib.error.HTTPError) as e:
            urllib.request.urlopen(base + "/api/items")
        assert e.value.code == 401
        body = b"\x00\x01" * 5000
        req = urllib.request.Request(base + "/api/upload", data=body, method="POST", headers={
            **key, "X-Filename": "belge%20%C3%A7.pdf", "Content-Type": "application/pdf",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)"})
        it = json.loads(urllib.request.urlopen(req).read())
        assert it["name"] == "belge ç.pdf" and it["source"] == "iPhone"
        req = urllib.request.Request(base + f"/api/file/{it['id']}", headers={**key, "Range": "bytes=10-19"})
        r = urllib.request.urlopen(req)
        assert r.status == 206 and r.read() == body[10:20]
        req = urllib.request.Request(base + "/api/delete", data=json.dumps({"id": it["id"], "days": 30}).encode(),
                                     method="POST", headers={**key, "Content-Type": "application/json"})
        assert json.loads(urllib.request.urlopen(req).read())["retention_days"] == 30
        assert json.loads(urllib.request.urlopen(base + "/api/ping").read())["app"] == "aktarim"
        lst = json.loads(urllib.request.urlopen(urllib.request.Request(base + "/api/items", headers=key)).read())
        assert any(d["name"] == "iPhone" for d in lst["devices"])
        r = urllib.request.urlopen(base + f"/?k={store.cfg['token']}")
        assert "aktarim=" in r.headers["Set-Cookie"]
    finally:
        srv.shutdown()
        srv.server_close()


PS1 = Path(__file__).resolve().parents[1] / "Aktarim.ps1"


def test_powershell_script_encoding_and_routes():
    raw = PS1.read_bytes()
    # Windows PowerShell 5.1 BOM'suz UTF-8'i ANSI okur; Türkçe metin bozulmasın
    assert raw.startswith(b"\xef\xbb\xbf")
    text = raw.decode("utf-8-sig")
    app = (PS1.parent / "web" / "app.js").read_text("utf-8")
    import re
    for route in set(re.findall(r'"(/api/[a-z-]+)"', app)):
        assert f"'{route}'" in text, route
    assert "PositionalBinding = $false" in text
    # kaba sözdizimi denetimi: süslü parantezler dengeli
    code = re.sub(r"'[^'\r\n]*'", "''", text)
    assert code.count("{") == code.count("}")


def test_installer_scripts():
    root = PS1.parent
    import re
    for name in ("Kur.ps1", "Kaldir.ps1"):
        raw = (root / name).read_bytes()
        assert raw.isascii(), f"{name} ASCII olmalı (irm | iex ve PS 5.1 kod sayfası)"
        code = re.sub(r"'[^'\r\n]*'", "''", raw.decode())
        assert code.count("{") == code.count("}"), name
    kur = (root / "Kur.ps1").read_text()
    listed = re.search(r"\$files = @\((.*?)\)", kur, re.S).group(1)
    for f in re.findall(r"'([^']+)'", listed):
        assert (root / f).is_file(), f"Kur.ps1 indiriyor ama depoda yok: {f}"
    assert "ProgramFiles" in kur and "Uninstall" in kur


def test_legacy_item_path(store):
    legacy = {"id": "abcdefabcdef", "kind": "file", "file": "abcdefabcdef.jpg", "name": "x.jpg"}
    assert store.path_of(legacy) == store.root / "files" / "abcdefabcdef.jpg"


def test_port_not_factory():
    assert aktarim.DEFAULT_PORT != 8765


def test_powershell_port_and_folders():
    text = PS1.read_bytes().decode("utf-8-sig")
    assert "port = 47800" in text and "$InDir = 'Gelenler'" in text
    assert "'/api/ping'" in text and "NotifyIcon" in text
    vbs = (PS1.parent / "Aktarim.vbs").read_bytes()
    assert vbs.isascii() and b"Aktarim.ps1" in vbs


@pytest.mark.skipif(not __import__("shutil").which("openssl"), reason="openssl yok")
def test_https_same_port(store):
    import ssl
    srv = aktarim.make_server(store, host="127.0.0.1", port=0)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    port = srv.server_address[1]
    key = {"X-Aktarim-Key": store.cfg["token"]}
    try:
        der = urllib.request.urlopen(f"http://127.0.0.1:{port}/aktarim-ca.cer").read()
        assert der[:1] == b"\x30"  # DER
        ctx = ssl.create_default_context(cafile=str(store.root / ".sertifika" / "ca.pem"))
        r = urllib.request.urlopen(urllib.request.Request(f"https://127.0.0.1:{port}/api/info", headers=key), context=ctx)
        info = json.loads(r.read())
        assert info["secure"] is True and info["ca"] == "/aktarim-ca.cer"
        info = json.loads(urllib.request.urlopen(urllib.request.Request(f"http://127.0.0.1:{port}/api/info", headers=key)).read())
        assert info["secure"] is False and info["https_urls"][0].startswith("https://")
    finally:
        srv.shutdown()
        srv.server_close()


def test_powershell_https_and_gallery():
    text = PS1.read_bytes().decode("utf-8-sig")
    assert "'/aktarim-ca.cer'" in text and "SslStream" in text and "New-SelfSignedCertificate" in text
    assert "https_urls" in text and "filename=`\"$asciiName`\"" in text
    app = (PS1.parent / "web" / "app.js").read_text("utf-8")
    assert "navigator.share({ files })" in app and "Galeri'ye" in app


def test_batch_goes_to_one_folder(store):
    a = store.add_file_stream("1.jpg", io.BytesIO(b"a"), 1, "iPhone", batch="abcdef0123", batch_name="Tatil")
    b = store.add_file_stream("2.jpg", io.BytesIO(b"b"), 1, "iPhone", batch="abcdef0123", batch_name="Tatil")
    assert store.path_of(a).parent == store.path_of(b).parent == store.root / "Gelenler" / "Tatil"
    assert a["batch_name"] == "Tatil" and b["batch"] == "abcdef0123"
    c = store.add_file_stream("3.jpg", io.BytesIO(b"c"), 1, "iPhone", batch="99887766aa", batch_name="Tatil")
    assert store.path_of(c).parent.name == "Tatil (2)"
    store.soft_delete(a["id"], 7)
    store.restore(a["id"])
    assert store.path_of(a).parent == store.root / "Gelenler" / "Tatil"
    auto = store.add_file_stream("x.png", io.BytesIO(b"x"), 1, "Bilgisayar", batch="1234567890")
    assert store.path_of(auto).parent.parent.name == "Gönderilenler" and auto["batch_name"].startswith("Bilgisayar ")


def test_powershell_batch_support():
    text = PS1.read_bytes().decode("utf-8-sig")
    assert "function Get-BatchDir" in text and "$Req.Headers['x-batch']" in text and "batch_dir" in text
    app = (PS1.parent / "web" / "app.js").read_text("utf-8")
    assert 'setRequestHeader("X-Batch"' in app and "function albumCard" in app
