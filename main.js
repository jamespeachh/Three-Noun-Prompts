const { Plugin, PluginSettingTab, Setting, Notice, normalizePath  } = require('obsidian');

wordListRaw = [
  "Abandonment", "Absolution", "Abyss", "Abyssal", "Adversity", "Affinity", "Aftermath",
  "Agony", "Alchemy", "Allegiance", "Alteration", "Altruism", "Ambiguity", "Amulet",
  "Anarchy", "Antagonist", "Anthem", "Anticipation", "Antipathy", "Anxiety", "Apocalypse",
  "Apotheosis", "Arcane", "Archetype", "Ardor", "Artistry", "Ascendance", "Ascent",
  "Aspiration", "Ashen", "Astral", "Aurora", "Avarice", "Awakening", "Awareness",

  "Balance", "Banishment", "Barriers", "Beacon", "Belief", "Beneath", "Benediction",
  "Benevolence", "Betrayal", "Bittersweet", "Blight", "Blissful", "Bloodline", "Blossoms",
  "Boon", "Bravery", "Breach", "Breeze", "Burden", "Burst",

  "Caged", "Calamity", "Calm", "Captivity", "Cascades", "Cataclysm", "Catalyst",
  "Celestial", "Change", "Chaos", "Charisma", "Charmed", "Chasing", "Chasm", "Childhood",
  "Chimeras", "Chronicles", "Cipher", "Clarity", "Climactic", "Cloak", "Cloister",
  "Closure", "Collage", "Companionship", "Compromise", "Compulsion", "Conquest",
  "Conflict", "Conflicted", "Confusion", "Connection", "Consciousness", "Contemplation",
  "Contradiction", "Corruption", "Covenant", "Creation", "Creativity", "Crestfallen",
  "Crisis", "Crossroads", "Crucible", "Cultivation", "Curiosity", "Curse", "Cyclic",
  "Cynicism",

  "Damned", "Dare", "Daring", "Darkness", "Dauntless", "Decay", "Decisions", "Deception",
  "Defiance", "Delirium", "Delusion", "Descent", "Desolation", "Detachment",
  "Determination", "Devotion", "Dichotomy", "Dilemma", "Discovery", "Dissonance", "Dread",
  "Dreamscape", "Duel", "Dusk",

  "Echoes", "Eclipse", "Eldritch", "Elevation", "Ember", "Embark", "Embrace", "Emissary",
  "Empathy", "Empowerment", "Endings", "Endless", "Enchantment", "Enigma", "Enlightenment",
  "Epiphany", "Equilibrium", "Essence", "Eternal", "Eternity", "Eulogy", "Euphoria",
  "Evasion", "Evocation", "Existence", "Exile", "Exodus", "Experience", "Exploration",

  "Fable", "Façade", "Fabled", "Fallen", "Fantasy", "Fate", "Fear", "Fearless", "Fever",
  "Fissure", "Flame", "Fleeting", "Flicker", "Focus", "Forsaken", "Fortune", "Fracture",
  "Fragile", "Fragility", "Fragments", "Freedom", "Frustration", "Fugitive", "Fugue",
  "Fusion", "Fury",

  "Galaxies", "Gates", "Gaze", "Generations", "Generosity", "Glimmer", "Glimpse", "Glint",
  "Glory", "Grace", "Gratitude", "Grit", "Grounded", "Guardian", "Grove",

  "Harbinger", "Harmonics", "Harmony", "Haven", "Haunt", "Heartstrings", "Honor", "Hope",

  "Illusion", "Immortality", "Impermanence", "Impostor", "Impression", "Impulse", "Indigo",
  "Inflection", "Innocence", "Inspiration", "Interconnectedness", "Introspection",
  "Intuition",

  "Journey",

  "Kaleidoscope",

  "Labyrinth", "Legacy", "Liberation", "Light", "Liminal", "Liminality", "Linger", "Lore",

  "Manifest", "Masquerade", "Merging", "Metamorphosis", "Mirage", "Miracle", "Momentum",
  "Monolith", "Mosaic", "Mortal", "Mysteries", "Mystic", "Mystique", "Myriad", "Mythos",

  "Nebula", "Nemesis", "Nexus", "Nocturne",

  "Oath", "Oblivion", "Odyssey", "Omens", "Optimism", "Oppression", "Oracle", "Origins",
  "Outcast",

  "Panic", "Paradigm", "Paradox", "Paragon", "Passage", "Patterns", "Peace", "Penance",
  "Perception", "Persistence", "Phantom", "Philosophy", "Phoenix", "Pinnacle", "Plight",
  "Poise", "Portal", "Prelude", "Prism", "Prologue", "Prophecy", "Prowess", "Pursuit",

  "Quasar", "Quest", "Quintessence",

  "Radiance", "Rapture", "Realm", "Rebirth", "Reckoning", "Redemption", "Reflection",
  "Regeneration", "Release", "Relic", "Remnant", "Resilience", "Resonance", "Retribution",
  "Reverie", "Rhapsody", "Rhythm", "Rite", "Ritual",

  "Sacrifice", "Saga", "Sanctuary", "Sanctum", "Saturation", "Seeker", "Sentinel",
  "Serenade", "Serendipity", "Shadow", "Shackle", "Shard", "Sigil", "Silhouette",
  "Soliloquy", "Solitude", "Sonnet", "Sorrow", "Sparks", "Specter", "Spectrum", "Spire",
  "Stories", "Strife", "Subtlety", "Symphony", "Synthesis",

  "Tales", "Tempest", "Temptation", "Temporal", "Theater", "Threshold", "Throne", "Tides",
  "Time", "Titan", "Transcendence", "Transformation", "Transmutation", "Trial",
  "Tranquility", "Tribute", "Truth", "Turbulence", "Twilight",

  "Ubiquity", "Umbral", "Unity", "Unraveled",

  "Vagabond", "Veil", "Vengeance", "Verdict", "Vestige", "Virtue", "Vision", "Void",
  "Vortex",

  "Wanderer", "Wanderlust", "Warden", "Whimsy", "Whirlwind", "Whispers", "Wisdom", "Wrath",

  "Yearning",

  "Zen", "Zenith", "Zephyr", "Zealot"
]


// settings
module.exports = class HeaderTimerPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, {
      secretKey: '',
      noteTitle: 'Note name with prompts',
      intervalInMs: 10,
      EnableHistoricalList: false
    }, await this.loadData());

    this.addSettingTab(new HeaderTimerSettingTab(this.app, this));
    
    this.startChangingHeader();

    await this.addRibbonIcon('dice', 'Three Nouns', async () => {
      new Notice('Opening or creating three prompt note!');
      await this.createOrOpenNote();
      this.startChangingHeader();
    });
  }

  onunload() {
    if (this.headerInterval) {
      clearInterval(this.headerInterval);
    }
  }

  async createOrOpenNote() {
    const { vault, workspace } = this.app;
    
    let file = vault.getAbstractFileByPath(normalizePath(this.settings.noteTitle + ".md"));
    
    if (!file) {
        file = await vault.create(normalizePath(this.settings.noteTitle + ".md"), "# Initial Header\n");
        const leaf = workspace.getLeaf(false);
        await leaf.openFile(file);
    } else {
        const content = await vault.read(file);
        if (!content.startsWith("#")) {
            await vault.modify(file, "# Initial Header\n" + content);
        }
        const leaf = workspace.getLeaf(false);
        await leaf.openFile(file);
    }
  }

  startChangingHeader() {
    this.headerInterval = setInterval(async () => {
      const file = this.app.vault.getAbstractFileByPath(normalizePath(this.settings.noteTitle + ".md"));
      
      if (file) {
        const content = await this.app.vault.read(file);
        const threeWords = await this.getThreeWords();
        let newContent = content.replace(/^#.*/, `# ${threeWords.join(' ')}`);
        
        // Add historical list if enabled
        if (this.settings.EnableHistoricalList) {
          newContent = this.updateHistoricalList(newContent, threeWords);
        }
        
        await this.app.vault.modify(file, newContent);
      }
    }, this.settings.intervalInMs * 1000);
  }

  updateHistoricalList(content, newWords) {
    const historicalSection = "## Historical List\n";
    const historicalRegex = /## Historical List\n([\s\S]*?)(?=\n#|$)/;
    const match = content.match(historicalRegex);
    
    let historicalContent = match ? match[1].trim() : "";
    const newEntry = `- ${newWords.join(' ')}\n`;
    
    if (historicalContent) {
      historicalContent = newEntry + historicalContent;
    } else {
      historicalContent = newEntry;
    }
    
    if (match) {
      // If the historical list already exists, update it
      return content.replace(historicalRegex, historicalSection + historicalContent + "\n\n");
    } else {
      // If the historical list doesn't exist, add it after the main header
      return content.replace(/^(#[^\n]*\n)/, `$1\n${historicalSection}${historicalContent}\n\n`);
    }
  }

  base32Decode(input) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let output = '';

    input = input.replace(/=+$/, '');

    for (let i = 0; i < input.length; i++) {
      const val = alphabet.indexOf(input.charAt(i).toUpperCase());
      if (val === -1) throw new Error('Invalid character found in base32 input');
      bits += val.toString(2).padStart(5, '0');
    }

    for (let i = 0; i + 8 <= bits.length; i += 8) {
      output += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
    }

    return output;
  }

  async hotp(key, counter, digits = 6, digest = 'sha-1') {
    const keyBuffer = new Uint8Array(this.base32Decode(key).split('').map(c => c.charCodeAt(0)));
    const counterBuffer = new ArrayBuffer(8);
    new DataView(counterBuffer).setBigUint64(0, BigInt(counter), false);

    const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'HMAC', hash: digest.toUpperCase() }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
    const hmac = new Uint8Array(signature);

    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary = ((hmac[offset] & 0x7f) << 24) |
                   ((hmac[offset + 1] & 0xff) << 16) |
                   ((hmac[offset + 2] & 0xff) << 8) |
                   (hmac[offset + 3] & 0xff);
    const otp = (binary % Math.pow(10, digits)).toString().padStart(digits, '0');
    return otp;
  }

  async generateTOTP(digits = 6, digest = 'sha-1') {
    const timeStep = this.settings.intervalInMs;
    const counter = Math.floor(Date.now() / 1000 / timeStep);
    return this.hotp(this.settings.secretKey, counter, digits, digest);
  }

  async getThreeWords() {
    const code = await this.generateTOTP();

    const wordList = wordListRaw;

    const words = [];
    const codeNum = parseInt(code, 10);
    for (let i = 0; i < 3; i++) {
        const index = (codeNum + i * 11) % wordList.length;
        words.push(wordList[index]);
    }

    return words;
  }
}

class HeaderTimerSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    let { containerEl } = this;
    containerEl.empty();
    
    new Setting(containerEl)
      .setName('Secret key')
      .setDesc('Enter the secret key for TOTP generation')
      .addText(text => text
        .setPlaceholder('Enter your secret key')
        .setValue(this.plugin.settings.secretKey)
        .onChange(async (value) => {
          this.plugin.settings.secretKey = value;
          await this.plugin.saveSettings();
        }));
    
    new Setting(containerEl)
      .setName('Note title')
      .setDesc('Enter the title of the note to update')
      .addText(text => text
        .setPlaceholder('Header Timer Note')
        .setValue(this.plugin.settings.noteTitle)
        .onChange(async (value) => {
          this.plugin.settings.noteTitle = value;
          await this.plugin.saveSettings();
        }));
    
    new Setting(containerEl)
      .setName('Update interval')
      .setDesc('Enter the interval in seconds between updates')
      .addText(text => text
        .setPlaceholder('10')
        .setValue(String(this.plugin.settings.intervalInMs))
        .onChange(async (value) => {
          const intValue = parseInt(value, 10);
          if (!isNaN(intValue) && intValue > 0) {
            this.plugin.settings.intervalInMs = intValue;
            await this.plugin.saveSettings();
            clearInterval(this.plugin.headerInterval);
            this.plugin.startChangingHeader();
          }
        }));

    new Setting(containerEl)
      .setName("Enable historical list")
      .setDesc("Writes a list of all the previous words into a new section at the top of file.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.EnableHistoricalList)
        .onChange(async (value) => {
          this.plugin.settings.EnableHistoricalList = value;
          await this.plugin.saveSettings();
          clearInterval(this.plugin.headerInterval);
          this.plugin.startChangingHeader();
        }));
  }
}
