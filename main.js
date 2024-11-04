const { Plugin, PluginSettingTab, Setting, Notice  } = require('obsidian');

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

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async createOrOpenNote() {
    const { vault, workspace } = this.app;
    
    let file = vault.getAbstractFileByPath(this.settings.noteTitle + ".md");
    
    if (!file) {
      file = await vault.create(this.settings.noteTitle + ".md", "# Initial Header\n");
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
      const file = this.app.vault.getAbstractFileByPath(this.settings.noteTitle + ".md");
      
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
    // Generate TOTP code
    const code = await this.generateTOTP();

    // Load word list from JSON file
    let wordList;
    try {
        const wordListJson = await this.app.vault.adapter.read(
            `${this.app.vault.configDir}/plugins/three-noun-prompts/word-list.json`
        );
        wordList = JSON.parse(wordListJson);
    } catch (error) {
        console.error('Error loading word list:', error);
        return ['Error', 'loading', 'words'];
    }

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
      .setName('Secret Key')
      .setDesc('Enter the secret key for TOTP generation')
      .addText(text => text
        .setPlaceholder('Enter your secret key')
        .setValue(this.plugin.settings.secretKey)
        .onChange(async (value) => {
          this.plugin.settings.secretKey = value;
          await this.plugin.saveSettings();
        }));
    
    new Setting(containerEl)
      .setName('Note Title')
      .setDesc('Enter the title of the note to update')
      .addText(text => text
        .setPlaceholder('Header Timer Note')
        .setValue(this.plugin.settings.noteTitle)
        .onChange(async (value) => {
          this.plugin.settings.noteTitle = value;
          await this.plugin.saveSettings();
        }));
    
    new Setting(containerEl)
      .setName('Update Interval')
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
      .setName("Enable Historical List")
      .setDesc("Writes a list of all the previous words into a new section at the top of file.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.EnableHistoricalList)
        .onChange(async (value) => {
          this.plugin.settings.EnableHistoricalList = value;
          await this.plugin.saveSettings();
          clearInterval(this.plugin.headerInterval);
          this.plugin.startChangingHeader();
        }));

    new Setting(containerEl)
      .setName('Save All Settings')
      .setDesc('Click to save all settings and apply changes')
      .addButton((button) => button
        .setButtonText('Save and Apply')
        .onClick(async () => {
          await this.plugin.saveSettings();
          clearInterval(this.plugin.headerInterval);
          this.plugin.startChangingHeader();
          new Notice('All settings saved and applied');
        }));
  }
}
