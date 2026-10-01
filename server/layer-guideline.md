# Server Layer Guideline

### [此層職責]
定命矩陣 (The Matrix)。負責所有數值驗證、骰子結算、LLM API 轉發與權威資料管理。

### [依賴限制]
* **嚴禁** 引用任何與客戶端渲染相關的程式碼（如 Phaser）。
* 必須依賴 `shared/` 層的型別定義。
* 所有結算必須是「零信任」，嚴禁直接信任客戶端傳來的數值。

### [核對清單]
- [ ] 是否所有數值變動都在伺服器端計算？
- [ ] LLM Proxy 是否正確隱藏了 API Key？
- [ ] 是否對所有 Incoming Socket 訊息進行了 Hash 或簽章驗證？
