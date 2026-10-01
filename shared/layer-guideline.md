# Shared Layer Guideline

### [此層職責]
定義跨端（Client & Server）共用的型別、介面與常數。確保資料結構在通訊過程中的一致性。

### [依賴限制]
* **嚴禁** 引用任何與平台相關的程式碼（如 Phaser, Express, Socket.io, DOM API）。
* 此層應為「純資料定義層」，不包含複雜邏輯。

### [核對清單]
- [ ] 型別定義是否使用 `I` 前綴（如 `ICharacterState`）？
- [ ] 變更型別後，是否已檢查 Client 與 Server 的同步相容性？
- [ ] 常數是否已抽離至 `constants/`？
