// =================================================================
// METİN İÇERİĞİ VE ARAYÜZ KONFİGÜRASYONU
// =================================================================

export const GameTexts = {
  // Normal mod gökyüzü yazıları
  skyPuns: [
    "Bir gün taş yukarıda kalırsa… ne yapacağımı bilmiyorum.",
    "Yarın kesin başlayacağım diyete.",
    "Taşı ittiriyorum, çünkü mutluluk hareket halinde... Yalan, sadece işim bu.",
    "İş ilanı: Sonsuz sabır, ağır kaldırma. Maaş? Absürd.",
    "Bir sosyal medya uygulaması, öbür sosyal medya uygulaması; yarın yeniden",
    "Maaş->Kira->Vergi->Mesai->Maaş->Fatura...",
    "Taş yuvarlanınca ‘sen yeterince motive değilsin’ dediler.",
    "Cumhurbaşkanı adayın gözaltına alındı. Başa dön.",
    "Görev listem taşın kuzeni: Biter bitmez başa sarıyor.",
    "Taşı yukarı bırakıp gittim. Yine önümdeydi.",
    "Tepelere didinmek mi? Mutluluk, düşerken ‘en azından manzara güzeldi’ diyebilmek.",
    "Bugün taş hiç yuvarlanmadı. Çünkü ben hiç ittemedim.",
    "Rüzgar esince taş biraz oynadı. Ona imrendim.",
    "Şirket vizyonu: Taş hep yukarı. Misyonu: Sen hep aşağı.",
    "Tepede durdum. Sonra neden durduğumu unuttum.",
    "Yol bittiğinde taş hala önümdeydi.",
    "Taş yuvarlanırken ben de yuvarlandım. İkimiz de sustuk."
  ],

  // Oyun durum mesajları
  messages: {
    // Yarış modu mesajları
    raceStart: "Yarışa başlamak için SOL veya SAĞ ok tuşuna bas!",
    raceActive: "Yarış için SOL & SAĞ ok tuşlarına hızlıca bas!",
    raceGetReady: "Hazır ol, yarış başlıyor!",
    raceFinished: (time) => `${time} saniyede bitirdin! Normal moda dönülüyor...`,
    raceNewRecord: (time) => `Yeni rekor! ${time} saniye`,
    raceScoreSaved: "Skor kaydedildi! Normal moda dönülüyor...",

    // Geçiş mesajları
    backToGrind: "Rutinine geri dön...",
    fallingToRace: "Hazır ol, yarış başlıyor!",
    
    // Ok ipuçları
    arrowHint: "Yarış için ← → tuşlarına bas!",
    arrowSpamHint: "Mümkün olduğunca hızlı ← → tuşlarına bas!",

    // İsim girişi
    nameInputTitle: "Adını Gir (En fazla 3 karakter)",
    nameInputInstructions: "Harf/rakam yaz, ENTER ile onayla",
    nameInputSubmit: "[ GÖNDER ]",

    // Arayüz butonları
    quitButton: "[ ÇIKIŞ ]",
    backToGrind: "[ Rutine Dön ]",

    // Zamanlayıcı ve skor tablosu
    timerFormat: (time) => `Süre: ${time}`,
    leaderboardTitle: "SKOR TABLOSU\n",
    leaderboardEntry: (rank, name, time) => `${rank}. ${name} - ${time}sn\n`
  },

  // Karanlık / Varoluşçu Jenerik
  credits: [
    'SİSİFOS',
    '',
    'Absürdün İçinde Bir Oyun',
    '',
    'TASARIM & KOD',
    'Ben & Yapay Zeka Araçları',
    '(daha çok yapay zeka araçları)',
    '',
    'TEŞEKKÜRLER',
    'Taş — sabrı için',
    'Yokuş — hiç pes etmediği için',
    'Sen — tekrar tekrar denediğin için',
    '',
    'Her bitiş, yeniden başlamaktır.',
    'Taş aşağı yuvarlanıyor...'
  ]
};

// =================================================================
// ARAYÜZ STİL KONFİGÜRASYONU
// =================================================================

export const UIStyles = {
  // Gökyüzü yazısı stili
  skyText: {
    fontFamily: 'monospace',
    fontSize: '20px',
    color: '#ffffff',
    align: 'center',
    stroke: '#2c2c4c',
    strokeThickness: 4
  },

  // Yarış arayüz stili
  raceUI: {
    fontFamily: 'monospace',
    fontSize: '24px',
    color: '#ffffff',
    align: 'right',
    stroke: '#000',
    strokeThickness: 4
  },

  // Jenerik stili
  credits: {
    fontFamily: 'monospace',
    fontSize: '28px',
    color: '#ffffff',
    align: 'center',
    stroke: '#000',
    strokeThickness: 4
  },

  // Buton stilleri
  button: {
    fontFamily: 'monospace',
    fontSize: '24px',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },

  backButton: {
    fontFamily: 'monospace',
    fontSize: '24px',
    color: '#fff',
    backgroundColor: '#111'
  },

  // İsim girişi stilleri
  nameInput: {
    title: {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    },
    field: {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    },
    instructions: {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#cccccc',
      align: 'center'
    },
    submit: {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#444444'
    }
  },

  // Panel stilleri
  skyPanel: {
    fillColor: 0x000000,
    fillAlpha: 0.35,
    lineColor: 0xffffff,
    lineAlpha: 0.35,
    lineWidth: 2,
    cornerRadius: 16
  },

  nameInputPanel: {
    fillColor: 0x000000,
    fillAlpha: 0.8,
    lineColor: 0xffffff,
    lineAlpha: 0.8,
    lineWidth: 2,
    cornerRadius: 16
  },

  inputFieldBg: {
    fillColor: 0x333333,
    fillAlpha: 1,
    lineColor: 0x666666,
    lineAlpha: 1,
    lineWidth: 2,
    cornerRadius: 8
  }
};

// =================================================================
// ARAYÜZ YERLEŞİM KONFİGÜRASYONU
// =================================================================

export const UILayout = {
  // Gökyüzü panel boyutları
  skyPanel: {
    margin: 24,
    height: 96
  },

  // İsim girişi dialog boyutları
  nameInput: {
    width: 400,
    height: 200,
    fieldWidth: 200,
    fieldHeight: 30
  },

  // Buton pozisyonları
  quitButton: {
    x: 20, // sağ kenardan mesafe
    y: 20,
    padding: { x: 10, y: 5 }
  },

  // Yarış arayüz pozisyonları
  raceTimer: {
    x: 20, // sağ kenardan mesafe
    y: 120 // alttan mesafe
  },

  leaderboard: {
    x: 20, // sağ kenardan mesafe  
    y: 200 // alttan mesafe
  }
};

// =================================================================
// METİN YÖNETİM SİSTEMİ
// =================================================================

export class TextManager {
  constructor(scene) {
    this.scene = scene;
    this.currentPunIndex = 0;
    this.punTimer = null;
    this.isRaceModeActive = false; // Yarış modu kontrolü için flag
    this.isPunCyclePaused = false; // Pun döngüsü geçici olarak durduruldu mu?
    this.savedSkyText = null; // Geçici olarak kaydedilen pun metni
    this.remainingTime = null; // Timer'ın kalan süresi
  }

  // Gökyüzü yazısı getir (index ya da sırayla)
  getSkyPun(index = null) {
    if (index === null) {
      return GameTexts.skyPuns[this.currentPunIndex];
    }
    return GameTexts.skyPuns[index % GameTexts.skyPuns.length];
  }

  // Yarış modu durumunu ayarla
  setRaceMode(isActive) {
    this.isRaceModeActive = isActive;
    if (isActive) {
      // Yarış modu başladığında pun döngüsünü durdur
      this.stopPunCycle();
    }
  }

  // Pun döngüsünü geçici olarak durdur (yarış mesajları için)
  pausePunCycle(skyTextElement) {
    if (!this.punTimer || this.isRaceModeActive) return;
    
    // Mevcut pun'ı kaydet
    if (skyTextElement) {
      this.savedSkyText = skyTextElement.text;
    }
    
    this.isPunCyclePaused = true;
    
    // Timer'ın kalan süresini hesapla
    this.remainingTime = this.punTimer.delay - this.punTimer.elapsed;
    
    // Timer'ı tamamen durdur
    this.punTimer.remove();
    this.punTimer = null;
  }

  // Pun döngüsünü devam ettir
  resumePunCycle(skyTextElement) {
    if (!this.isPunCyclePaused || this.isRaceModeActive) return;
    
    this.isPunCyclePaused = false;
    
    // Kaydedilen pun'ı geri yükle
    if (skyTextElement && this.savedSkyText) {
      skyTextElement.setText(this.savedSkyText);
      this.savedSkyText = null;
    }
    
    // Timer'ı kalan süre ile yeniden başlat
    const delayToUse = this.remainingTime || 5000;
    
    this.punTimer = this.scene.time.addEvent({
      delay: delayToUse,
      callback: () => {
        // İlk tetiklenmeden sonra normal döngüye geç
        this.punTimer.delay = 5000;
        this.punTimer.elapsed = 0;
        
        // Yarış modu kontrol et
        if (this.isRaceModeActive) {
          this.stopPunCycle();
          return;
        }
        
        // Döngü duraklatıldıysa atla
        if (this.isPunCyclePaused) {
          return;
        }
        
        // Yeni pun göster
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * GameTexts.skyPuns.length);
        } while (nextIndex === this.currentPunIndex && GameTexts.skyPuns.length > 1);
        
        this.currentPunIndex = nextIndex;
        skyTextElement.setText(GameTexts.skyPuns[this.currentPunIndex]);
      },
      loop: true
    });
    
    this.remainingTime = null;
  }

  // Yarış mesajını geçici olarak göster
  showTemporaryRaceMessage(skyTextElement, message, duration = 3000) {
    if (!skyTextElement) return;
    
    // Pun döngüsünü geçici durdur
    this.pausePunCycle(skyTextElement);
    
    // Yarış mesajını göster
    skyTextElement.setText(message);
    
    // Belirtilen süre sonra pun'lara geri dön
    this.scene.time.delayedCall(duration, () => {
      this.resumePunCycle(skyTextElement);
    });
  }

  // Gökyüzü yazısı döngüsünü başlat
  startPunCycle(skyTextElement) {
    if (!skyTextElement) return;
    
    // Yarış modu aktifse pun döngüsünü başlatma
    if (this.isRaceModeActive) return;
    
    // İlk rastgele pun'ı göster
    this.currentPunIndex = Math.floor(Math.random() * GameTexts.skyPuns.length);
    skyTextElement.setText(GameTexts.skyPuns[this.currentPunIndex]);
    
    if (this.punTimer) this.punTimer.remove(false);
    
    this.punTimer = this.scene.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => {
        // Yarış modu kontrol et - aktifse döngüyü durdur
        if (this.isRaceModeActive) {
          this.stopPunCycle();
          return;
        }
        
        // Döngü duraklatıldıysa atla
        if (this.isPunCyclePaused) {
          return;
        }
        
        // Önceki pun'dan farklı rastgele bir pun seç
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * GameTexts.skyPuns.length);
        } while (nextIndex === this.currentPunIndex && GameTexts.skyPuns.length > 1);
        
        this.currentPunIndex = nextIndex;
        skyTextElement.setText(GameTexts.skyPuns[this.currentPunIndex]);
      }
    });
  }

  // Gökyüzü yazısı döngüsünü durdur
  stopPunCycle() {
    if (this.punTimer) {
      this.punTimer.remove();
      this.punTimer = null;
    }
    this.isPunCyclePaused = false;
    this.savedSkyText = null;
  }

  // Zamanlayıcı metni biçimlendir
  formatTimer(time) {
    return GameTexts.messages.timerFormat(
      (time / 1000).toFixed(2)
    );
  }

  // Skor tablosu biçimlendir
  formatLeaderboard(leaderboard) {
    let board = GameTexts.messages.leaderboardTitle;
    leaderboard.forEach((score, index) => {
      board += GameTexts.messages.leaderboardEntry(
        index + 1,
        score.name,
        score.time.toFixed(2)
      );
    });
    return board;
  }

  // Jenerik metni getir
  getCredits() {
    return GameTexts.credits;
  }
}
