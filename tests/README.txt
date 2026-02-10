=== Workflow de test recommandé ===

npm run test:verify

# 2. Lance l'API (dans un terminal)
npm run api

# 3. Teste (dans un autre terminal)
npm run test:diagnostic    # Diagnostic complet
npm run test:simple        # Test Simple Wallet rapide
npm run test:api:smoke     # Tests Jest smoke
npm run test:api:simple    # Tests Jest complets